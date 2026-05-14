import logging
import os
from typing import Any, Optional

from models.database import db_cursor

logger = logging.getLogger(__name__)


def log_query(
    *,
    question: str,
    answer: str,
    ticker_context: Optional[str],
    model_used: str,
    tokens_in: int,
    tokens_out: int,
    latency_ms: int,
    classification: str,
    retrieved_chunks: int,
    session_id: Optional[str] = None,
) -> None:
    try:
        with db_cursor() as cur:
            cur.execute(
                """
                INSERT INTO query_logs
                    (question, answer, ticker_context, model_used,
                     tokens_in, tokens_out, latency_ms, classification,
                     retrieved_chunks, session_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    question[:8000],
                    answer[:16000],
                    ticker_context,
                    model_used,
                    tokens_in,
                    tokens_out,
                    latency_ms,
                    classification,
                    retrieved_chunks,
                    session_id,
                ),
            )
    except Exception as e:
        logger.warning("query_logs insert failed (non-fatal): %s", e)
