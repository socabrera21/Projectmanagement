# Resume Refresh Design — Saul Cabrera
**Date:** 2026-04-09
**Approach:** Role-by-Role Reconstruction (Option B)
**Outputs:** Base resume + Apollo.io tailored version

---

## Scope

Two output files:
1. **Base resume** — universally strong, company-agnostic
   - Path: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md`
2. **Apollo-tailored resume** — base + 5 Apollo-specific overlays
   - Path: `{VAULT}/apollo-enterprise-ae-2026-04-09/optimized-resume.md`

Source PDF: `/Users/Apple/Library/Mobile Documents/com~apple~CloudDocs/Saul Cabrera_2026_resume.pdf`
Target JD: https://job-boards.greenhouse.io/apolloio/jobs/5870559004

---

## Phase 1: Base Resume Refresh

### Header
- Add missing phone number: `512.470.0169`
- No other structural changes

### Professional Summary
- Replace "Two-plus years" → "2+"
- Replace all `--` dashes with clean sentence breaks throughout entire document
- Tighten to ~3 sentences max

**Target:**
> Enterprise SaaS AE with 8+ years driving net-new AI platform adoption across Fortune 500 enterprises. 2+ years selling AI-powered solutions directly (AI ITSM at Aisera, AI CLM at Agiloft) with proven ROI storytelling that moves enterprises from skepticism to deployment. Consistent top performer: 110%–180% quota attainment. MEDDPICC practitioner across complex, multi-stakeholder deals ($150K–$500K ACV).

### Core Competencies
- Keep visual pill styling as-is
- Ensure plain-text parseable in `.md` output

### Role-by-Role Bullet Rewrites

#### Agiloft (Jan 2025 – Present)
**Changes:**
- Drop "Delivered technical demos with Solutions Engineers..." — no outcome, reads as job description
- Add replacement bullet anchoring closed deal count or avg. ACV
- Tighten "Negotiated customized commercial agreements..." — add result (e.g., avg. deal size or win rate)
- Fix all `--` dashes

**Keep:**
- 103% quota bullet (strong opener)
- 20% cycle compression bullet
- $2M+ pipeline bullet
- ROI models bullet

#### Aisera (Apr 2024 – Jan 2025)
**Changes:**
- Add standalone bullet: $400K deal rescue + $230K expansion (currently missing — single best story)
- Cut run-on clause "from initial skepticism through ROI validation, deployment, and expansion" — rewrite as tight impact statement
- Fix all `--` dashes

**Keep:**
- 111% of $775K quota + first-in-territory framing
- 25% cycle compression
- 25% ARR growth (rewritten to be tighter)

#### Jamf (Oct 2020 – Apr 2024)
**Changes:**
- Add 18-month zero-churn streak bullet (currently missing — strong differentiator)
- Rewrite "Facilitated product evaluations and POCs..." → outcome format (conversion rate or deals closed from POC)
- Strengthen "Strengthened account retention by 20%..." → anchor to ARR retained, not floating %
- Cut vague "customized solution delivery" language

**Keep:**
- Top 10% / 110%+ quota opener
- $1M+ new ARR
- 55% customer acquisition growth

#### Rapid7 (Oct 2019 – Mar 2020)
**Changes (all 3 bullets — currently 0 metrics):**
- Bullet 1: Add `$400M+` account size (already confirmed accurate)
- Bullet 2: Rewrite from activity → outcome format
- Bullet 3: Rewrite from activity → outcome format

#### Bonterra (Nov 2017 – Oct 2019)
**Changes:**
- Add 1 new bullet: deal volume or win rate context alongside $3K–$36K range
- Keep top 10% ranking bullet — clean and credible
- Keep $3K–$36K ARR + 3-7 year contract detail

### Structure Check
| Section | Status | Action |
|---|---|---|
| Contact | Missing phone | Add 512.470.0169 |
| Summary | Wordy, written-out numbers | Rewrite per target above |
| Core Competencies | ✓ | No change |
| Work Experience | `--` dashes, missing metrics | Per role plan above |
| Education | ✓ | No change |
| Skills | "Command of the Message" buried | Move to experience bullet context |

---

## Phase 2: Apollo.io Tailored Layer

Applied on top of the base. 5 targeted changes only — do not over-optimize base resume for one JD.

### JD Critical Keywords (gap analysis)
| Keyword | Current Status | Action |
|---|---|---|
| Command of the Message | Skills only | Add to Agiloft or Aisera bullet text |
| MEDDPICC | 3x mentions ✓ | Keep |
| Hunter + farmer | Absent | Add to summary |
| RevOps | Absent | Add to buyer persona lists |
| Founding team / builder | Aisera partial ✓ | Strengthen |
| Forecasting accuracy | Partial | Reinforce in pipeline bullet |
| AI tool familiarity | Absent | Add to Skills |

### 5 Apollo Overlays
1. **Summary** — Add "hunter + farmer" and `high-ownership, founding-team environment` language
2. **Aisera opener** — Strengthen "First-in territory / built GTM from zero" as founding team proof point
3. **Agiloft or Aisera bullet** — Embed "Command of the Message" explicitly in bullet text
4. **Buyer personas** — Add "RevOps" alongside existing Legal / IT / Procurement mentions
5. **Skills section** — Add `ChatGPT, Notion AI` under Sales Tech or new "AI Tools" line

### Apollo Output Path
`{VAULT}/apollo-enterprise-ae-2026-04-09/optimized-resume.md`

---

## Constraints
- Do NOT change role titles, dates, or company names
- Do NOT invent metrics — only use confirmed numbers from memory or existing resume
- Keep resume to 2 pages max
- Maintain consistent formatting: `Mon YYYY` date format, sentence-case bullets, no trailing periods

---

## Success Criteria
- Base resume: zero `--` dashes, phone number present, all roles have ≥1 quantified metric
- Aisera: $400K rescue + $230K expansion visible
- Jamf: 18-month zero-churn streak visible
- Rapid7: all 3 bullets have at least one number or named outcome
- Apollo version: all 5 keyword gaps closed, reads as tailored without feeling generic
