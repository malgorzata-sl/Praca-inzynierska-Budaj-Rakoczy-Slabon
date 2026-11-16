import os

import psycopg
import pytest

from app.config import get_database_url

pytestmark = pytest.mark.skipif(not os.getenv("DATABASE_URL"), reason="DATABASE_URL is not set in backend/.env")

EXPECTED_TABLES = {
    "ingredients",
    "ingredient_aliases",
    "functions",
    "ingredient_functions",
    "product_categories",
}


def get_public_tables() -> dict[str, bool]:
    with psycopg.connect(get_database_url(), connect_timeout=10) as connection:
        rows = connection.execute(
            "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'"
        ).fetchall()
    return {table_name: row_security for table_name, row_security in rows}


def test_all_tables_exist():
    tables = get_public_tables()

    assert EXPECTED_TABLES <= tables.keys()


def test_row_level_security_is_enabled_on_all_tables():
    tables = get_public_tables()

    for table_name in EXPECTED_TABLES:
        assert tables.get(table_name) is True, f"RLS is not enabled on {table_name}"
