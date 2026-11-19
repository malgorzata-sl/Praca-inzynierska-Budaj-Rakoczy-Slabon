import argparse
import re
from pathlib import Path

import psycopg

from app.config import get_database_url

ANNEX_HEADING = "ZAŁĄCZNIK"
EXPECTED_ENTRY_COUNT = 30418
MAX_NORMAL_NAME_LENGTH = 255

ENTRY_LINE = re.compile(r"^\s*(\d{1,5})\s+(\S.*?)\s*$")
NOISE_LINE = re.compile(r"^\s*(ELI:|PL\s+Dz\.U\.|Dz\.U\.\s+L|Numer pozycji|\d+/\d+\s+ELI:)")
FORMERLY_SUFFIX = re.compile(r"\s*\(FORMERLY\s.+\)$")
SPACES_AROUND_SLASH = re.compile(r"\s*/\s*")
ALLOWED_LOWERCASE = re.compile(r"\b(sh|rh|sr)-|HCl\b")
UNUSUAL_CHARACTER = re.compile(r"[^A-Z0-9 ()\[\]/+&,'.×:-]")
LEADING_NUMBER = re.compile(r"^\d+")


def read_annex_lines(path: Path) -> list[str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    for index, line in enumerate(lines):
        if line.strip() == ANNEX_HEADING:
            return lines[index + 1:]
    raise ValueError(f"Heading {ANNEX_HEADING} not found in {path}")


def indentation(line: str) -> int:
    return len(line) - len(line.lstrip())


def has_unusual_characters(text: str) -> bool:
    return bool(UNUSUAL_CHARACTER.search(ALLOWED_LOWERCASE.sub("", text)))


def is_continuation(line: str, name_column: int, last_number: int) -> bool:
    text = line.strip()
    if indentation(line) != name_column or has_unusual_characters(text):
        return False
    leading_number = LEADING_NUMBER.match(text)
    return not leading_number or int(leading_number.group()) < last_number


def join_parts(name: str, continuation: str) -> str:
    if name.endswith(("-", "(")) or continuation.startswith((")", "-")):
        return name + continuation
    return name + " " + continuation


def parse_entries(lines: list[str]) -> tuple[list[tuple[int, str]], list[str]]:
    entries = []
    problems = []
    name_column = None
    for line in lines:
        text = line.strip()
        if not text or NOISE_LINE.match(line):
            continue
        match = ENTRY_LINE.match(line)
        last_number = entries[-1][0] if entries else 0
        if match and int(match.group(1)) == last_number + 1:
            entries.append((last_number + 1, match.group(2)))
            name_column = match.start(2)
        elif entries and is_continuation(line, name_column, last_number):
            number, name = entries[-1]
            entries[-1] = (number, join_parts(name, text))
        elif match:
            number = int(match.group(1))
            problems.append(f"Entry {number} found after entry {last_number}: wrong order of numbers")
            entries.append((number, match.group(2)))
            name_column = match.start(2)
        elif entries:
            problems.append(f"Unclear text after entry {last_number}: {text}")
    return entries, problems


def check_entries(entries: list[tuple[int, str]], expected_count: int) -> list[str]:
    problems = []
    if len(entries) != expected_count:
        problems.append(f"Expected {expected_count} entries, found {len(entries)}")
    for number, name in entries:
        if not name:
            problems.append(f"Entry {number}: empty name")
    return problems


def find_suspicious_names(entries: list[tuple[int, str]]) -> list[str]:
    suspicious = []
    for number, name in entries:
        if has_unusual_characters(name):
            suspicious.append(f"Entry {number}: unusual characters: {name}")
        elif len(name) > MAX_NORMAL_NAME_LENGTH:
            suspicious.append(f"Entry {number}: very long name ({len(name)} characters): {name[:60]}...")
    return suspicious


def clean_name(name: str) -> str:
    name = FORMERLY_SUFFIX.sub("", name)
    return SPACES_AROUND_SLASH.sub("/", name)


def unique_names(names: list[str]) -> list[str]:
    seen = set()
    result = []
    for name in names:
        key = name.lower()
        if key not in seen:
            seen.add(key)
            result.append(name)
    return result


def count_ingredients(connection: psycopg.Connection) -> int:
    return connection.execute("SELECT count(*) FROM ingredients").fetchone()[0]


def insert_ingredient_names(connection: psycopg.Connection, names: list[str]) -> None:
    with connection.cursor() as cursor:
        cursor.executemany(
            "INSERT INTO ingredients (inci_name) VALUES (%s) ON CONFLICT DO NOTHING",
            [(name,) for name in names],
        )


def run_import(
    text_file: Path,
    dry_run: bool,
    accept_suspicious: bool = False,
    expected_count: int = EXPECTED_ENTRY_COUNT,
) -> bool:
    entries, problems = parse_entries(read_annex_lines(text_file))
    entries = [(number, clean_name(name)) for number, name in entries]
    problems += check_entries(entries, expected_count)
    suspicious = find_suspicious_names(entries)
    names = unique_names([name for _, name in entries])

    print(f"Entries read from the document: {len(entries)}")
    print(f"Unique ingredient names: {len(names)}")
    print(f"Repeated names skipped: {len(entries) - len(names)}")
    print(f"Suspicious names to check: {len(suspicious)}")
    print(f"Errors: {len(problems)}")
    for item in suspicious:
        print(f"  Check: {item}")

    if problems:
        for problem in problems:
            print(f"  Error: {problem}")
        print("Import stopped: nothing was saved to the database")
        return False

    if dry_run:
        print("Dry run: nothing was saved to the database")
        return True

    if suspicious and not accept_suspicious:
        print("Import stopped: check the names above, then run again with --accept-suspicious")
        return False

    with psycopg.connect(get_database_url(), connect_timeout=10) as connection:
        count_before = count_ingredients(connection)
        insert_ingredient_names(connection, names)
        added = count_ingredients(connection) - count_before
    print(f"Added to the database: {added}")
    print(f"Already in the database: {len(names) - added}")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Import INCI names from Commission Implementing Decision (EU) 2025/1175")
    parser.add_argument("text_file", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--accept-suspicious", action="store_true")
    args = parser.parse_args()
    if not run_import(args.text_file, args.dry_run, args.accept_suspicious):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
