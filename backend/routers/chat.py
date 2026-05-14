import os
import time

from fastapi import APIRouter

from guardrails import rules
from models.schemas import ChatQueryRequest, ChatQueryResponse
from openai import OpenAI

from services import query_classifier, query_logger
from services.knowledge_prompt import KNOWLEDGE_SYSTEM_PROMPT

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/query", response_model=ChatQueryResponse)
def chat_query(body: ChatQueryRequest) -> ChatQueryResponse:
    q = body.question
    g = rules.guardrail_check(q) or rules.political_check(q)
    if g:
        return ChatQueryResponse(
            answer=g, category="refusal", tickers=[], k=0
        )

    t0 = time.perf_counter()
    cls = query_classifier.classify_query(q)
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    model = os.getenv("LLM_MODEL_PRODUCTION", "gpt-4o-mini")
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": KNOWLEDGE_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Classification: {cls}\n\n"
                    "Phase 9 note: retrieval is not wired yet; answer from "
                    "training knowledge and clearly note if filing data is "
                    "unavailable.\n\nQuestion:\n"
                    + q
                ),
            },
        ],
        temperature=0.2,
    )
    answer = (resp.choices[0].message.content or "").strip()
    usage = resp.usage
    tokens_in = usage.prompt_tokens if usage else 0
    tokens_out = usage.completion_tokens if usage else 0
    latency_ms = int((time.perf_counter() - t0) * 1000)
    query_logger.log_query(
        question=q,
        answer=answer,
        ticker_context=",".join(cls.get("tickers") or []) or None,
        model_used=model,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        latency_ms=latency_ms,
        classification=cls["category"],
        retrieved_chunks=0,
        session_id=None,
    )
    return ChatQueryResponse(
        answer=answer,
        category=cls["category"],
        tickers=cls.get("tickers") or [],
        k=cls.get("k") or 0,
    )
