import os

from fastapi import APIRouter

from constants import LOGO_DEV_BASE_URL
from models.database import db_cursor
from models.schemas import PriceSnapshotItem

router = APIRouter(prefix="/prices", tags=["prices"])

LOGO_DEV_TOKEN = os.getenv("LOGO_DEV_TOKEN", "")


def _logo_url(ticker: str) -> str | None:
    if not LOGO_DEV_TOKEN:
        return None
    return f"{LOGO_DEV_BASE_URL}/{ticker}?token={LOGO_DEV_TOKEN}"


@router.get("/snapshot")
def snapshot() -> list[dict]:
    with db_cursor() as cur:
        cur.execute(
            "SELECT ticker, name, sector FROM companies ORDER BY ticker"
        )
        rows = cur.fetchall()
    return [
        PriceSnapshotItem(
            ticker=r[0],
            name=r[1],
            sector=r[2],
            logo_url=_logo_url(r[0]),
        ).model_dump()
        for r in rows
    ]
