from collections.abc import Iterator

import psycopg
from fastapi import HTTPException

from app.config import get_database_url

CONNECT_TIMEOUT_SECONDS = 10


def get_connection() -> Iterator[psycopg.Connection]:
    try:
        connection = psycopg.connect(get_database_url(), connect_timeout=CONNECT_TIMEOUT_SECONDS)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))
    except psycopg.OperationalError:
        raise HTTPException(status_code=503, detail="Database is unavailable")
    with connection:
        yield connection
