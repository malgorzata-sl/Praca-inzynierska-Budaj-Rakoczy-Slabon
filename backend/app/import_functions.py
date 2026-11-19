import argparse
import csv
from pathlib import Path

import psycopg

from app.config import get_database_url

OFFICIAL_FUNCTIONS = (
    "Abrasive", "Absorbent", "Anticaking", "Anticorrosive", "Antidandruff", "Antifoaming", "Antimicrobial",
    "Antioxidant", "Antiperspirant", "Antiplaque", "Antiseborrhoeic", "Antistatic", "Astringent", "Binding",
    "Bleaching", "Buffering", "Bulking", "Chelating", "Cleansing", "Cosmetic colorant", "Denaturant", "Deodorant",
    "Depilatory", "Detangling", "Emollient", "Emulsifying", "Emulsion stabilising", "Film forming", "Foaming",
    "Foam boosting", "Gel forming", "Hair conditioning", "Hair dyeing", "Hair fixing", "Hair waving or straightening",
    "Humectant", "Hydrotrope", "Keratolytic", "Masking", "Moisturising", "Nail conditioning", "Opacifying",
    "Oral care", "Oxidising", "Pearlescent", "Plasticiser", "Preservative", "Propellant", "Reducing", "Refatting",
    "Refreshing", "Skin conditioning", "Skin protecting", "Smoothing", "Solvent", "Soothing", "Stabilising",
    "Surfactant", "Tanning", "Tonic", "UV absorber", "UV filter", "Viscosity controlling",
)


def read_rows(paths: list[Path]) -> list[tuple[str, list[str]]]:
    rows = []
    for path in paths:
        with path.open(encoding="utf-8", newline="") as file:
            for row in csv.DictReader(file):
                functions = [name.strip() for name in row["functions"].split("/") if name.strip()]
                rows.append((row["inci_name"].strip(), functions))
    return rows


def check_rows(rows: list[tuple[str, list[str]]]) -> list[str]:
    official = {name.lower() for name in OFFICIAL_FUNCTIONS}
    seen_names = set()
    problems = []
    for inci_name, functions in rows:
        if not inci_name:
            problems.append("Empty ingredient name")
            continue
        if inci_name.lower() in seen_names:
            problems.append(f"{inci_name}: appears more than once")
        seen_names.add(inci_name.lower())
        if not functions:
            problems.append(f"{inci_name}: no functions")
        if len({function.lower() for function in functions}) != len(functions):
            problems.append(f"{inci_name}: the same function is listed twice")
        for function in functions:
            if function.lower() not in official:
                problems.append(f"{inci_name}: unknown function {function}")
    return problems


def find_missing_names(rows: list[tuple[str, list[str]]], ingredient_ids: dict[str, int]) -> list[str]:
    return [inci_name for inci_name, _ in rows if inci_name.lower() not in ingredient_ids]


def build_links(
    rows: list[tuple[str, list[str]]],
    ingredient_ids: dict[str, int],
    function_ids: dict[str, int],
) -> list[tuple[int, int]]:
    return [
        (ingredient_ids[inci_name.lower()], function_ids[function.lower()])
        for inci_name, functions in rows
        for function in functions
    ]


def load_ids(connection: psycopg.Connection, query: str) -> dict[str, int]:
    return {name: row_id for row_id, name in connection.execute(query).fetchall()}


def count_links(connection: psycopg.Connection) -> int:
    return connection.execute("SELECT count(*) FROM ingredient_functions").fetchone()[0]


def save_functions(connection: psycopg.Connection, rows: list[tuple[str, list[str]]]) -> int:
    with connection.cursor() as cursor:
        cursor.executemany(
            "INSERT INTO functions (name) VALUES (%s) ON CONFLICT DO NOTHING",
            [(name,) for name in OFFICIAL_FUNCTIONS],
        )

    ingredient_ids = load_ids(connection, "SELECT id, lower(inci_name) FROM ingredients")
    missing_names = find_missing_names(rows, ingredient_ids)
    if missing_names:
        raise ValueError(f"{len(missing_names)} ingredient names are not in the database, for example: {missing_names[0]}")

    function_ids = load_ids(connection, "SELECT id, lower(name) FROM functions")
    links = build_links(rows, ingredient_ids, function_ids)
    count_before = count_links(connection)
    with connection.cursor() as cursor:
        cursor.executemany(
            "INSERT INTO ingredient_functions (ingredient_id, function_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            links,
        )
    return count_links(connection) - count_before


def run_import(paths: list[Path], dry_run: bool) -> bool:
    rows = read_rows(paths)
    problems = check_rows(rows)
    link_count = sum(len(functions) for _, functions in rows)

    print(f"Ingredients in the files: {len(rows)}")
    print(f"Ingredient-function links in the files: {link_count}")
    print(f"Errors: {len(problems)}")

    if problems:
        for problem in problems:
            print(f"  Error: {problem}")
        print("Import stopped: nothing was saved to the database")
        return False

    if dry_run:
        print("Dry run: nothing was saved to the database")
        return True

    try:
        with psycopg.connect(get_database_url(), connect_timeout=10) as connection:
            added = save_functions(connection, rows)
    except ValueError as error:
        print(f"  Error: {error}")
        print("Import stopped: nothing was saved to the database")
        return False

    print(f"Added links: {added}")
    print(f"Links already in the database: {link_count - added}")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Import ingredient functions from Commission Decision 2006/257/EC")
    parser.add_argument("csv_files", type=Path, nargs="+")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if not run_import(args.csv_files, args.dry_run):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
