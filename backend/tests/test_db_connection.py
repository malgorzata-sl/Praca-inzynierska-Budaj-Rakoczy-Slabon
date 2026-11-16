import os

import psycopg
import pytest

from app.config import get_database_url

pytestmark = pytest.mark.skipif(not os.getenv("DATABASE_URL"), reason="DATABASE_URL is not set in backend/.env")


def test_real_database_answers_select_1():
    with psycopg.connect(get_database_url(), connect_timeout=10) as connection:
        result = connection.execute("SELECT 1").fetchone()

    assert result == (1,)
