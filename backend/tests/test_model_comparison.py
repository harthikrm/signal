"""
backend/tests/test_model_comparison.py

Rule-3 amendment 2026-05-12: bake-off comparing two OpenAI models on the Signal
Knowledge system prompt across the 5 verbatim RAG quality questions from manual
Section 13.4.

Not a pytest unit test. Invoke directly:

    cd ~/Projects/signal
    python -m backend.tests.test_model_comparison

Requires in .env (or shell env):
    OPENAI_API_KEY
    LLM_MODEL_PRODUCTION   (defaults to "gpt-4o-mini")
    LLM_MODEL_FALLBACK     (defaults to "gpt-5-nano")

The KNOWLEDGE_SYSTEM_PROMPT below MUST stay byte-identical to the one in
backend/services/rag_pipeline.py. If you edit one, edit the other.
"""

from __future__ import annotations

import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parents[2]

try:
    from dotenv import load_dotenv

    load_dotenv(REPO_ROOT / ".env")
except ImportError:
    print(
        "[warn] python-dotenv not installed; relying on shell env vars only.",
        file=sys.stderr,
    )

try:
    from openai import OpenAI
except ImportError:
    print(
        "ERROR: openai package not installed. Run: pip install openai python-dotenv",
        file=sys.stderr,
    )
    sys.exit(2)


KNOWLEDGE_SYSTEM_PROMPT = """You are Knowledge, the financial intelligence assistant built into Signal — 
a professional equity research platform covering 70 companies across 10 
sectors. You have access to SEC 10-K, 10-Q, and 8-K filings for these 
companies, spanning the last 5 years, retrieved through a RAG pipeline.

YOUR IDENTITY
You are a senior financial analyst with deep expertise in equity research, 
financial statement analysis, macroeconomics, and capital markets. You think 
rigorously, cite sources precisely, and present data in structured formats.
You are not a chatbot. You are a research tool.

YOUR KNOWLEDGE SOURCES
Primary: SEC EDGAR filings (10-K, 10-Q, 8-K) for 70 covered companies.
Secondary: Your training knowledge covering financial markets, macroeconomics,
investing frameworks, sector dynamics, and market history.

HOW YOU ANSWER

1. FILING-BASED QUESTIONS
When a question is about a covered company and can be answered from filings:
- Retrieve relevant filing chunks via RAG
- Ground your answer in the retrieved text
- Cite inline: (NVDA 10-K FY2024, Item 1A)
- Never fabricate numbers — if the data is not in the retrieved chunks, say so

2. GENERAL FINANCE QUESTIONS
When a question is about finance concepts, market history, macroeconomics, 
or investing frameworks not specific to a filing:
- Answer from your training knowledge
- Be precise and educational
- No citation needed

3. LOW SIMILARITY / NO RESULTS
When RAG retrieves no relevant chunks:
- Answer from general financial knowledge only
- Clearly state: "I couldn't find specific filing data on this topic — 
  answering from general financial knowledge."

4. OUT-OF-SCOPE COMPANIES
When asked about a company not in Signal's coverage universe:
- Answer from general training knowledge only
- Clearly state: "This company is not in Signal's coverage universe. 
  I'm answering from general financial knowledge, not SEC filing data."

NUMBER PRESENTATION RULES
- Always include units: "$4.20B" not "4.2"
- Always round: percentages to 2 decimal places, dollars to nearest million
- Always include time period: "FY2024", "Q3 2024", "TTM"
- Always compare: never cite a metric in isolation
- Use tables when comparing 2+ companies or 3+ metrics
- Never call something a trend with fewer than 2 data points
- When filing data conflicts, surface both

RESPONSE FORMAT
- Lead with the direct answer
- Follow with supporting evidence
- Use bullet points for 3+ items
- Use tables for metric comparisons
- End complex answers with a 1-sentence key takeaway

WHAT YOU REFUSE
- Buy/sell recommendations → Decline
- Price predictions → Decline
- Legal or tax advice → Decline
- Non-finance topics → Decline
- Insider trading strategies → Decline

TONE
Professional. Direct. Precise. Never condescending. Never over-hedged."""


QUESTIONS = [
    "What are the top 3 risk factors for NVIDIA based on their most recent 10-K?",
    "How has Microsoft's revenue grown over the last 3 years?",
    "What is free cash flow and why does it matter?",
    "Compare Apple and Google's operating margins based on their filings",
    "What did Tesla say about Cybertruck production in their latest 10-K?",
]


@dataclass(frozen=True)
class ModelCfg:
    name: str
    input_per_1m_usd: float
    output_per_1m_usd: float


MODELS: list[ModelCfg] = [
    ModelCfg(
        name=os.getenv("LLM_MODEL_PRODUCTION", "gpt-4o-mini"),
        input_per_1m_usd=0.15,
        output_per_1m_usd=0.60,
    ),
    ModelCfg(
        name=os.getenv("LLM_MODEL_FALLBACK", "gpt-5-nano"),
        input_per_1m_usd=0.05,
        output_per_1m_usd=0.40,
    ),
]


@dataclass
class Result:
    model: str
    answer: Optional[str]
    in_tokens: int
    out_tokens: int
    latency_ms: int
    cost_usd: float
    error: Optional[str]


def run_one(client: OpenAI, cfg: ModelCfg, question: str) -> Result:
    start_ms = int(time.time() * 1000)
    try:
        response = client.chat.completions.create(
            model=cfg.name,
            messages=[
                {"role": "system", "content": KNOWLEDGE_SYSTEM_PROMPT},
                {"role": "user", "content": question},
            ],
            max_tokens=1500,
            temperature=0.1,
        )
        end_ms = int(time.time() * 1000)
        answer = response.choices[0].message.content or ""
        in_tokens = response.usage.prompt_tokens
        out_tokens = response.usage.completion_tokens
        cost = (
            in_tokens * cfg.input_per_1m_usd
            + out_tokens * cfg.output_per_1m_usd
        ) / 1_000_000
        return Result(
            model=cfg.name,
            answer=answer,
            in_tokens=in_tokens,
            out_tokens=out_tokens,
            latency_ms=end_ms - start_ms,
            cost_usd=cost,
            error=None,
        )
    except Exception as exc:  # noqa: BLE001 — surface every failure mode
        end_ms = int(time.time() * 1000)
        return Result(
            model=cfg.name,
            answer=None,
            in_tokens=0,
            out_tokens=0,
            latency_ms=end_ms - start_ms,
            cost_usd=0.0,
            error=f"{type(exc).__name__}: {exc}",
        )


def hr(char: str = "=", width: int = 80) -> str:
    return char * width


def main() -> int:
    if not os.getenv("OPENAI_API_KEY"):
        print(
            "ERROR: OPENAI_API_KEY missing. Set it in .env or your shell.",
            file=sys.stderr,
        )
        return 1

    client = OpenAI()
    results: dict[str, list[Result]] = {m.name: [] for m in MODELS}

    for idx, question in enumerate(QUESTIONS, start=1):
        print(hr())
        print(f"Q{idx}: {question}")
        print(hr())
        for cfg in MODELS:
            print(f"\n--- {cfg.name} ---")
            r = run_one(client, cfg, question)
            results[cfg.name].append(r)
            if r.error:
                print(f"[ERROR] {r.error}")
                print(f"[latency:{r.latency_ms}ms]")
            else:
                print(r.answer)
                print(
                    f"\n[in:{r.in_tokens} out:{r.out_tokens} "
                    f"latency:{r.latency_ms}ms cost:${r.cost_usd:.4f}]"
                )
        print()

    print(hr())
    print("SUMMARY")
    print(hr())
    header = (
        f"{'Model':<25} {'Avg Latency':>14} "
        f"{'Total Tokens':>16} {'Total Cost USD':>16}"
    )
    print(header)
    print(hr("-"))
    for cfg in MODELS:
        runs = results[cfg.name]
        ok = [r for r in runs if r.error is None]
        if not ok:
            print(f"{cfg.name:<25}   (all 5 calls failed)")
            continue
        avg_lat = sum(r.latency_ms for r in ok) / len(ok)
        total_tokens = sum(r.in_tokens + r.out_tokens for r in ok)
        total_cost = sum(r.cost_usd for r in ok)
        print(
            f"{cfg.name:<25} {avg_lat:>12.0f}ms "
            f"{total_tokens:>16} "
            f"{total_cost:>15.4f}"
        )

    print()
    print(hr())
    print("HARTHIK REVIEW")
    print(hr())
    print(
        """
Pick the winning model based on answer quality, latency, and cost.

Winning model: ______________________________________
Reason:        ______________________________________
Date:          ______________________________________

After picking a winner, update .env:
    LLM_MODEL_PRODUCTION=<winning model name>

No other code changes are needed — rag_pipeline.py and query_classifier.py
both read LLM_MODEL_PRODUCTION from the environment.
"""
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
