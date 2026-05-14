import os
from contextlib import contextmanager
from typing import Any, Generator

import psycopg2
from psycopg2.extensions import connection as PgConnection


def _use_cloud_sql_connector() -> bool:
    return bool(os.getenv("K_SERVICE")) and bool(
        os.getenv("GCP_CLOUD_SQL_CONNECTION_NAME")
    )


def _connect_direct() -> PgConnection:
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5433")),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )


def _connect_cloud_sql() -> PgConnection:
    from google.cloud.sql.connector import Connector

    connector = Connector()
    conn = connector.connect(
        os.environ["GCP_CLOUD_SQL_CONNECTION_NAME"],
        "pg8000",
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        db=os.environ["DB_NAME"],
    )
    return conn


def get_connection() -> PgConnection:
    if _use_cloud_sql_connector():
        return _connect_cloud_sql()
    return _connect_direct()


@contextmanager
def db_cursor() -> Generator[Any, None, None]:
    conn = get_connection()
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
