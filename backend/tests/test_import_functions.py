from contextlib import nullcontext

from app import import_functions
from app.import_functions import (
    OFFICIAL_FUNCTIONS,
    build_links,
    check_rows,
    find_missing_names,
    read_rows,
    run_import,
)


def write_csv(path, lines):
    path.write_text("\n".join(["inci_name,functions,confirmed_by", *lines]), encoding="utf-8")
    return path


def block_database(monkeypatch):
    def fail_on_connect(*args, **kwargs):
        raise AssertionError("This test must not connect to the database")

    monkeypatch.setattr(import_functions.psycopg, "connect", fail_on_connect)


def test_official_functions_has_63_unique_names():
    assert len(OFFICIAL_FUNCTIONS) == 63
    assert len({name.lower() for name in OFFICIAL_FUNCTIONS}) == 63


def test_read_rows_reads_all_files_and_splits_functions(tmp_path):
    first = write_csv(tmp_path / "first.csv", ["AQUA,Solvent,3 of 3"])
    second = write_csv(tmp_path / "second.csv", ["GLYCERIN,Denaturant/Humectant/Solvent,3 of 3"])

    assert read_rows([first, second]) == [
        ("AQUA", ["Solvent"]),
        ("GLYCERIN", ["Denaturant", "Humectant", "Solvent"]),
    ]


def test_check_rows_accepts_correct_rows():
    rows = [("AQUA", ["Solvent"]), ("GLYCERIN", ["Denaturant", "Humectant", "Solvent"])]

    assert check_rows(rows) == []


def test_check_rows_reports_unknown_function():
    assert check_rows([("CUPRESSUS SEMPERVIRENS EXTRACT", ["Firming"])]) == [
        "CUPRESSUS SEMPERVIRENS EXTRACT: unknown function Firming"
    ]


def test_check_rows_reports_name_repeated_in_files():
    rows = [("AQUA", ["Solvent"]), ("Aqua", ["Solvent"])]

    assert check_rows(rows) == ["Aqua: appears more than once"]


def test_check_rows_reports_missing_and_repeated_functions():
    rows = [("AQUA", []), ("GLYCERIN", ["Humectant", "humectant"])]

    assert check_rows(rows) == ["AQUA: no functions", "GLYCERIN: the same function is listed twice"]


def test_find_missing_names_ignores_letter_case():
    rows = [("AQUA", ["Solvent"]), ("GLYCERIN", ["Humectant"])]

    assert find_missing_names(rows, {"aqua": 1}) == ["GLYCERIN"]


def test_build_links_gives_every_function_of_ingredient():
    rows = [("GLYCERIN", ["Denaturant", "Humectant", "Solvent"]), ("AQUA", ["Solvent"])]
    ingredient_ids = {"glycerin": 10, "aqua": 20}
    function_ids = {"denaturant": 1, "humectant": 2, "solvent": 3}

    assert build_links(rows, ingredient_ids, function_ids) == [(10, 1), (10, 2), (10, 3), (20, 3)]


def test_run_import_dry_run_prints_summary_without_database(tmp_path, capsys, monkeypatch):
    block_database(monkeypatch)
    csv_file = write_csv(tmp_path / "functions.csv", ["AQUA,Solvent,3 of 3", "GLYCERIN,Humectant/Solvent,3 of 3"])

    assert run_import([csv_file], dry_run=True) is True

    output = capsys.readouterr().out
    assert "Ingredients in the files: 2" in output
    assert "Ingredient-function links in the files: 3" in output
    assert "Errors: 0" in output
    assert "Dry run: nothing was saved to the database" in output


def test_run_import_stops_on_errors_without_database(tmp_path, capsys, monkeypatch):
    block_database(monkeypatch)
    csv_file = write_csv(tmp_path / "functions.csv", ["AQUA,Solvent,3 of 3", "PISUM SATIVUM EXTRACT,Firming,3 of 3"])

    assert run_import([csv_file], dry_run=False) is False

    output = capsys.readouterr().out
    assert "Error: PISUM SATIVUM EXTRACT: unknown function Firming" in output
    assert "Import stopped: nothing was saved to the database" in output


def test_run_import_stops_when_name_is_not_in_database(tmp_path, capsys, monkeypatch):
    def fail_on_missing_name(connection, rows):
        raise ValueError("1 ingredient names are not in the database, for example: AQUA")

    monkeypatch.setattr(import_functions.psycopg, "connect", lambda *args, **kwargs: nullcontext())
    monkeypatch.setattr(import_functions, "get_database_url", lambda: "postgresql://test")
    monkeypatch.setattr(import_functions, "save_functions", fail_on_missing_name)
    csv_file = write_csv(tmp_path / "functions.csv", ["AQUA,Solvent,3 of 3"])

    assert run_import([csv_file], dry_run=False) is False

    output = capsys.readouterr().out
    assert "Error: 1 ingredient names are not in the database, for example: AQUA" in output
    assert "Import stopped: nothing was saved to the database" in output
