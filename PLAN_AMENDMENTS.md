# Signal — plan amendments log

Append-only log of approved plan changes (Rule-3).

## Amendments table

| Date       | Change | Reason | Approved by |
|------------|--------|--------|-------------|
| 2026-05-14 | Replace Clearbit Logo API with Logo.dev: `backend/constants.py` — `LOGO_DOMAINS` removed, `LOGO_DEV_BASE_URL` added; `backend/routers/prices.py` — `logo_url` uses Logo.dev ticker URL; `ingestion/config.py` — `LOGO_DOMAINS` removed, comment added; `.env.example` — `LOGO_DEV_TOKEN` added | Clearbit Logo API shut down 2025-12-08. Logo.dev is the official Clearbit-recommended replacement. Ticker-based URL means no domain mapping. `BRK.B` dot-in-ticker verified. Free tier 5000 req/day sufficient for Signal. | Harthik |

## Standing rules (logos)

**Standing rule:** Logo URLs are generated dynamically using the Logo.dev ticker-based API. No static domain mapping exists anywhere in the codebase. `LOGO_DEV_TOKEN` must be set in `.env` and in GCP Cloud Run environment variables before launch.

(Supersedes the prior rule that `LOGO_DOMAINS` existed in two places and had to be kept in sync.)
