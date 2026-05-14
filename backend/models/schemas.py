from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    status: str
    service: str


class ChatQueryRequest(BaseModel):
    question: str = Field(..., max_length=2000)

    @field_validator("question")
    @classmethod
    def strip_q(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("question must not be empty")
        return v


class ChatQueryResponse(BaseModel):
    answer: str
    category: str
    tickers: list[str] = Field(default_factory=list)
    k: int = 0


class CompareRequest(BaseModel):
    tickers: list[str]

    @field_validator("tickers")
    @classmethod
    def validate_count(cls, v: list[str]) -> list[str]:
        if len(v) < 2:
            raise ValueError("At least 2 tickers required")
        if len(v) > 3:
            raise ValueError("At most 3 tickers allowed")
        return [t.upper().strip() for t in v]


class CompareAnalysisRequest(CompareRequest):
    pass


class CompareResponse(BaseModel):
    content: str
    tickers: list[str]


class CompanyRow(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    exchange: Optional[str] = None
    cik: Optional[str] = None


class MetricsRow(BaseModel):
    model_config = {"extra": "allow"}
    ticker: str
    data: dict[str, Any] = Field(default_factory=dict)


class PriceSummaryRow(BaseModel):
    ticker: str
    last_close: Optional[float] = None
    as_of: Optional[str] = None


class IndicatorRow(BaseModel):
    ticker: str
    date: Optional[str] = None
    rsi_14: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None


class SectorRow(BaseModel):
    sector: str
    company_count: int


class PriceSnapshotItem(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    logo_url: Optional[str] = None
