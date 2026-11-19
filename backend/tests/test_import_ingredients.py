from app import import_ingredients
from app.import_ingredients import (
    check_entries,
    clean_name,
    find_suspicious_names,
    parse_entries,
    run_import,
    unique_names,
)


def write_decision_file(tmp_path, entry_lines):
    text_file = tmp_path / "decision.txt"
    text_file.write_text("\n".join(["ZAŁĄCZNIK", *entry_lines]), encoding="utf-8")
    return text_file


def block_database(monkeypatch):
    def fail_on_connect(*args, **kwargs):
        raise AssertionError("This test must not connect to the database")

    monkeypatch.setattr(import_ingredients.psycopg, "connect", fail_on_connect)


def test_parse_entries_joins_multiline_names():
    lines = [
        "1        AQUA",
        "2        ACETOBACTER/APPLE FRUIT/PAPAYA",
        "         FRUIT FERMENT FILTRATE",
        "3        GLYCERIN",
    ]

    assert parse_entries(lines) == (
        [(1, "AQUA"), (2, "ACETOBACTER/APPLE FRUIT/PAPAYA FRUIT FERMENT FILTRATE"), (3, "GLYCERIN")],
        [],
    )


def test_parse_entries_joins_continuation_starting_with_smaller_number():
    lines = [f"{number}        INGREDIENT" for number in range(1, 250)] + [
        "250      FLUORESCENT BRIGHTENER",
        "         230 SALT",
        "251      PEG-",
        "         20",
    ]

    entries, problems = parse_entries(lines)

    assert entries[-2:] == [(250, "FLUORESCENT BRIGHTENER 230 SALT"), (251, "PEG-20")]
    assert problems == []


def test_parse_entries_reports_number_in_name_column_instead_of_joining_it():
    entries, problems = parse_entries(["1        AQUA", "         3 GLYCERIN"])

    assert entries == [(1, "AQUA"), (3, "GLYCERIN")]
    assert problems == ["Entry 3 found after entry 1: wrong order of numbers"]


def test_parse_entries_reports_other_text_in_name_column_instead_of_joining_it():
    entries, problems = parse_entries(["1        AQUA", "         Strona tytułowa"])

    assert entries == [(1, "AQUA")]
    assert problems == ["Unclear text after entry 1: Strona tytułowa"]


def test_parse_entries_skips_page_headers_and_footers():
    lines = [
        "1        AQUA",
        "ELI: http://data.europa.eu/eli/dec_impl/2025/1175/oj        1/862",
        "PL                         Dz.U. L z 10.7.2025",
        "    Numer pozycji          Wspólna nazwa składnika",
        "2/862                      ELI: http://data.europa.eu/eli/dec_impl/2025/1175/oj",
        "2        GLYCERIN",
    ]

    assert parse_entries(lines) == ([(1, "AQUA"), (2, "GLYCERIN")], [])


def test_parse_entries_accepts_next_number_in_name_column_of_previous_page():
    lines = [
        "   1 POLYACRYLATE-52",
        "         2 POLYACRYLATE-53",
    ]

    assert parse_entries(lines) == ([(1, "POLYACRYLATE-52"), (2, "POLYACRYLATE-53")], [])


def test_parse_entries_reports_missing_number():
    entries, problems = parse_entries(["1        AQUA", "3        GLYCERIN"])

    assert entries == [(1, "AQUA"), (3, "GLYCERIN")]
    assert problems == ["Entry 3 found after entry 1: wrong order of numbers"]


def test_parse_entries_reports_repeated_number():
    entries, problems = parse_entries(["1        AQUA", "2        GLYCERIN", "2        UREA"])

    assert problems == ["Entry 2 found after entry 2: wrong order of numbers"]


def test_parse_entries_reports_unclear_text_instead_of_joining_it():
    entries, problems = parse_entries(["1        AQUA", "Strona tytułowa", "2        GLYCERIN"])

    assert entries == [(1, "AQUA"), (2, "GLYCERIN")]
    assert problems == ["Unclear text after entry 1: Strona tytułowa"]


def test_check_entries_reports_wrong_count_and_empty_name():
    problems = check_entries([(1, "AQUA"), (2, "")], expected_count=3)

    assert problems == ["Expected 3 entries, found 2", "Entry 2: empty name"]


def test_find_suspicious_names_reports_unusual_text():
    suspicious = find_suspicious_names([(1, "Nazwa składnika"), (2, "GLYCERIN")])

    assert suspicious == ["Entry 1: unusual characters: Nazwa składnika"]


def test_find_suspicious_names_accepts_typical_inci_names():
    names = [
        (1, "ACETYL sh-OLIGOPEPTIDE-26 SP"),
        (2, "2,4-DIAMINO-5-METHYLPHENETOLE HCl"),
        (3, "CI 77268:1"),
        (4, "ASPERGILLUS/CITRUS RETICULATA × SINENSIS FRUIT/RICE FERMENT"),
    ]

    assert find_suspicious_names(names) == []


def test_find_suspicious_names_reports_very_long_name():
    suspicious = find_suspicious_names([(1, "A" * 256)])

    assert suspicious == [f"Entry 1: very long name (256 characters): {'A' * 60}..."]


def test_clean_name_removes_formerly_suffix():
    assert clean_name("C10-11 ISOALKANE (FORMERLY C10-11 ISOPARAFFIN)") == "C10-11 ISOALKANE"


def test_clean_name_removes_spaces_around_slash():
    assert clean_name("COIX LACRYMA-JOBI MA-YUEN /MACADAMIA TERNIFOLIA") == "COIX LACRYMA-JOBI MA-YUEN/MACADAMIA TERNIFOLIA"


def test_clean_name_keeps_normal_name():
    assert clean_name("NIACINAMIDE") == "NIACINAMIDE"


def test_unique_names_ignores_letter_case_and_keeps_first():
    assert unique_names(["AQUA", "GLYCERIN", "Aqua"]) == ["AQUA", "GLYCERIN"]


def test_run_import_dry_run_prints_summary_without_database(tmp_path, capsys, monkeypatch):
    block_database(monkeypatch)
    text_file = tmp_path / "decision.txt"
    text_file.write_text(
        "\n".join(
            [
                "Artykuł 2",
                "2        Decyzja traci moc.",
                "ZAŁĄCZNIK",
                "1        AQUA",
                "2        C10-11 ISOALKANE (FORMERLY C10-11 ISOPARAFFIN)",
                "3        C10-11 ISOALKANE",
            ]
        ),
        encoding="utf-8",
    )

    assert run_import(text_file, dry_run=True, expected_count=3) is True

    output = capsys.readouterr().out
    assert "Entries read from the document: 3" in output
    assert "Unique ingredient names: 2" in output
    assert "Repeated names skipped: 1" in output
    assert "Suspicious names to check: 0" in output
    assert "Errors: 0" in output
    assert "Dry run: nothing was saved to the database" in output


def test_run_import_stops_on_suspicious_names_until_they_are_accepted(tmp_path, capsys, monkeypatch):
    block_database(monkeypatch)
    text_file = write_decision_file(tmp_path, ["1        AQUA", "2        Bifidobacterium Ferment Extract"])

    assert run_import(text_file, dry_run=False, expected_count=2) is False

    output = capsys.readouterr().out
    assert "Check: Entry 2: unusual characters: Bifidobacterium Ferment Extract" in output
    assert "Import stopped: check the names above, then run again with --accept-suspicious" in output


def test_run_import_stops_when_document_has_errors(tmp_path, capsys, monkeypatch):
    block_database(monkeypatch)
    text_file = write_decision_file(tmp_path, ["1        AQUA", "2        GLYCERIN"])

    assert run_import(text_file, dry_run=False, expected_count=3) is False

    output = capsys.readouterr().out
    assert "Error: Expected 3 entries, found 2" in output
    assert "Import stopped: nothing was saved to the database" in output
