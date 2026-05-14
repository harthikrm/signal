import json
import os
from typing import Any

from openai import OpenAI

CLASSIFIER_SYSTEM = """You classify user questions for Signal (70 stocks, 10 sectors).

Return a single JSON object with keys:
- category: one of
  ["company_filing","multi_company","general_finance","off_topic","unclear"]
- tickers: array of uppercase US tickers explicitly mentioned (may be empty)
- k: integer 4-16, how many RAG chunks to retrieve (higher for multi-company)

Rules:
- company_filing: about one covered company's filings/metrics
- multi_company: compares or mentions 2+ tickers
- general_finance: concepts without needing filings
- off_topic: not finance
- unclear: ambiguous

JSON only, no markdown."""


def classify_query(question: str) -> dict[str, Any]:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    model = os.getenv("LLM_MODEL_PRODUCTION", "gpt-4o-mini")
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": CLASSIFIER_SYSTEM},
            {"role": "user", "content": question[:4000]},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )
    raw = resp.choices[0].message.content or "{}"
    data = json.loads(raw)
    k = int(data.get("k") or 8)
    k = max(4, min(16, k))
    return {
        "category": str(data.get("category", "unclear")),
        "tickers": [str(t).upper() for t in data.get("tickers") or []],
        "k": k,
    }
