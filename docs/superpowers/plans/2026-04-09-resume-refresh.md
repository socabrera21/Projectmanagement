# Resume Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite Saul Cabrera's resume to fix formatting, add missing metrics, and strengthen every bullet — producing a universal base version and an Apollo.io-tailored version.

**Architecture:** Role-by-role reconstruction — each role gets fully rewritten bullets in a single pass, then Phase 2 layers Apollo-specific keywords onto a copy of the base. No multi-pass sweeps.

**Tech Stack:** Markdown files written to Obsidian vault. No code. Verification via grep/search for formatting artifacts.

**Spec:** `/Users/Apple/Projectmanagement/docs/superpowers/specs/2026-04-09-resume-refresh-design.md`

---

## File Map

| Action | Path |
|---|---|
| Create | `/Users/Apple/Library/Mobile Documents/iCloud~md~obsidian/Documents/Interview/saul/resume-saul-cabrera-base-2026-04-09.md` |
| Overwrite | `/Users/Apple/Library/Mobile Documents/iCloud~md~obsidian/Documents/Interview/saul/apollo-enterprise-ae-2026-04-09/optimized-resume.md` |

Abbreviation used in tasks: `{VAULT}` = `/Users/Apple/Library/Mobile Documents/iCloud~md~obsidian/Documents/Interview/saul`

---

## Task 1: Create Base File — Header + Summary

**Files:**
- Create: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md`

- [ ] **Step 1: Set vault path variable and create file**

All bash steps in this plan use `$VAULT`. Set it once at the start of your session:

```bash
export VAULT="/Users/Apple/Library/Mobile Documents/iCloud~md~obsidian/Documents/Interview/saul"
```

Then write the following as the opening of the new base resume file:

```markdown
# Saul Cabrera
512.470.0169 | socabrera21@gmail.com | linkedin.com/in/saulcabrera21 | Austin, TX

## PROFESSIONAL SUMMARY

Enterprise SaaS AE with 8+ years driving net-new AI platform adoption across Fortune 500 enterprises. 2+ years selling AI-powered solutions directly (AI ITSM at Aisera, AI CLM at Agiloft) with proven ROI storytelling that moves enterprises from skepticism to deployment. Consistent top performer: 110%–180% quota attainment. MEDDPICC practitioner across complex, multi-stakeholder deals ($150K–$500K ACV).

## CORE COMPETENCIES

- Enterprise AI Platform Sales
- Net-New Logo Acquisition
- MEDDPICC / Value Selling
- AI Adoption ROI Storytelling
- C-Suite & Executive Alignment
- Full-Cycle Deal Management
- Greenfield Territory Build
- Commercial Negotiation
```

- [ ] **Step 2: Verify header has phone number and no "Two-plus"**

```bash
grep "512.470.0169" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
grep -c "Two-plus" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: phone found, "Two-plus" count = 0
```

---

## Task 2: Agiloft Bullets

**Files:**
- Modify: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md` (append Agiloft section)

- [ ] **Step 1: Append Agiloft section with rewritten bullets**

```markdown
## WORK EXPERIENCE

### Agiloft
**Enterprise Account Executive | Remote** | Jan 2025 – Present

- Achieved 103% annual quota driving net-new enterprise wins in AI-powered CLM platform ($150K–$500K ACV cycles).
- Led 6–12 month AI platform sales cycles; built ROI models demonstrating AI automation value to Legal, IT, Security, and Procurement decision-makers.
- Compressed deal closure time by 20% by orchestrating discovery, exec presentations, RFPs, InfoSec reviews, and compliance sign-offs across multi-threaded buying committees.
- Built $2M+ pipeline via targeted outbound to senior enterprise buyers; applied MEDDPICC qualification to maintain forecast accuracy.
- Negotiated customized commercial agreements with Legal, Procurement, and C-suite; navigated multi-year contract terms and InfoSec review requirements across $150K–$500K ACV deals.
```

- [ ] **Step 2: Verify no `--` dashes remain in Agiloft section**

```bash
grep -n "\-\-" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: no matches
```

- [ ] **Step 3: Verify "Delivered technical demos" bullet is gone**

```bash
grep -c "Delivered technical demos" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: 0
```

---

## Task 3: Aisera Bullets

**Files:**
- Modify: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md` (append Aisera section)

- [ ] **Step 1: Append Aisera section with $400K rescue bullet added**

```markdown
### Aisera
**Enterprise Account Executive | Remote** | Apr 2024 – Jan 2025

- First-in-territory AE at a Series D AI hypergrowth startup; built GTM motion from zero and closed 111% of $775K quota.
- Rescued a $400K stalled enterprise deal and drove $230K in expansion ARR through executive re-engagement and ROI reframing.
- Sold AI automation platform to Fortune 500/1000 enterprises; guided buyers from initial AI skepticism to full deployment and expansion.
- Built ROI models demonstrating AI automation efficiency gains (cost per ticket, resolution time, error reduction) to IT, Operations, and executive buyers.
- Cut sales cycle time by 25% through disciplined SE, Product, and CS collaboration; applied MEDDPICC framework throughout.
```

- [ ] **Step 2: Verify $400K rescue bullet is present**

```bash
grep "400K" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
grep "230K" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: both found
```

- [ ] **Step 3: Verify run-on clause is gone**

```bash
grep -c "from initial skepticism through ROI validation, deployment, and expansion" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: 0
```

---

## Task 4: Jamf Bullets

**Files:**
- Modify: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md` (append Jamf section)

- [ ] **Step 1: Append Jamf section with zero-churn streak added and POC bullet strengthened**

```markdown
### Jamf
**Mid-Enterprise Account Executive | Remote** | Oct 2020 – Apr 2024

- Top 10% AE performance (110%+ quota) across three years, securing $1M+ in new ARR across mid-enterprise accounts.
- Maintained 18-month zero-churn streak across $1M+ ARR book; deepened multi-threaded relationships with IT, DevOps, and platform teams.
- Increased customer acquisition by 55% via tailored GTM strategies and stakeholder engagement across IT, DevOps, and platform teams.
- Converted complex POC evaluations to closed deals; drove adoption milestones with technical buyers across 6–12 month enterprise sales cycles.
- Strengthened account retention by 20% through executive alignment and proactive relationship-building, protecting ARR base during competitive renewals.
```

- [ ] **Step 2: Verify zero-churn streak is present**

```bash
grep "zero-churn" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: found
```

- [ ] **Step 3: Verify "Facilitated product evaluations" is gone**

```bash
grep -c "Facilitated product evaluations" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: 0
```

- [ ] **Step 4: Verify "customized solution delivery" is gone**

```bash
grep -c "customized solution delivery" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: 0
```

---

## Task 5: Rapid7 Bullets

**Files:**
- Modify: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md` (append Rapid7 section)

- [ ] **Step 1: Append Rapid7 section — all 3 bullets rewritten with outcomes**

```markdown
### Rapid7
**Mid-Market Account Executive | Austin, TX** | Oct 2019 – Mar 2020

- Sold cybersecurity SaaS solutions to CISO, InfoSec, and technical buyers at $400M+ enterprise accounts; built relationships across multi-stakeholder buying committees.
- Applied MEDDPICC qualification from initial discovery to ensure cross-functional buy-in and clear decision processes, reducing late-stage deal slippage.
- Generated new logo growth by building risk-aligned value propositions that mapped product capabilities directly to customer threat landscapes.
```

- [ ] **Step 2: Verify $400M+ is present**

```bash
grep "400M" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: found
```

---

## Task 6: Bonterra Bullets

**Files:**
- Modify: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md` (append Bonterra section)

- [ ] **Step 1: Append Bonterra section — add third bullet for volume/buyer context**

```markdown
### Bonterra
**Account Executive | Austin, TX** | Nov 2017 – Oct 2019

- Consistently ranked top 10% of Account Executives (2018; Q1 & Q2 2019).
- Closed $3K–$36K ARR deals with 3–7 year contracts; built pipeline through outbound research, cold calling, and networking.
- Closed multi-year SaaS contracts with nonprofit organizations; navigated budget cycles and board approval processes inherent to mission-driven buyers.
```

---

## Task 7: Education + Skills + Final Structure Check

**Files:**
- Modify: `{VAULT}/resume-saul-cabrera-base-2026-04-09.md` (append Education and Skills)

- [ ] **Step 1: Append Education and Skills sections**

```markdown
## EDUCATION

**University of Texas – Pan American** | Bachelor, Biology | 2014

## SKILLS

**Methodologies:** MEDDPICC, Command of the Message, Challenger, ROI/Value Selling, Mutual Action Plans
**Sales Tech:** Salesforce, Clari, Gong, Outreach, ZoomInfo
**Domains:** Enterprise AI Platforms, AI/Automation SaaS, Cybersecurity SaaS, Cloud Infrastructure, CLM, MDM
**Languages:** English (native), Spanish (professional)
```

- [ ] **Step 2: Run full document artifact scan**

```bash
# Check for any remaining -- dashes
grep -n "\-\-" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: no matches

# Check phone is present
grep "512.470.0169" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: found

# Check "Command of the Message" is present
grep "Command of the Message" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: found in Skills section
```

- [ ] **Step 3: Verify section order is standard**

Confirm document contains sections in this order:
1. Header (name + contact)
2. PROFESSIONAL SUMMARY
3. CORE COMPETENCIES
4. WORK EXPERIENCE (Agiloft → Aisera → Jamf → Rapid7 → Bonterra)
5. EDUCATION
6. SKILLS

```bash
grep -n "^##" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md"
# Expected: sections appear in order above
```

- [ ] **Step 4: Count bullets per role — ensure no role has 0 metrics**

```bash
# Each role should have at least one $ or % symbol in its bullets
grep -A 20 "### Agiloft" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md" | grep -c "[$%]"
grep -A 20 "### Aisera" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md" | grep -c "[$%]"
grep -A 20 "### Jamf" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md" | grep -c "[$%]"
grep -A 20 "### Rapid7" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md" | grep -c "[$%]"
grep -A 10 "### Bonterra" "{VAULT}/resume-saul-cabrera-base-2026-04-09.md" | grep -c "[$%]"
# Expected: all results > 0
```

---

## Task 8: Apollo.io Tailored Version — 5 Keyword Overlays

**Files:**
- Overwrite: `{VAULT}/apollo-enterprise-ae-2026-04-09/optimized-resume.md`

This task copies the base and applies 5 targeted overlays. Do not change anything not listed here.

- [ ] **Step 1: Copy base file to Apollo folder**

```bash
cp "{VAULT}/resume-saul-cabrera-base-2026-04-09.md" \
   "{VAULT}/apollo-enterprise-ae-2026-04-09/optimized-resume.md"
```

- [ ] **Step 2: Overlay 1 — Summary: add hunter+farmer + founding team language**

Replace the summary paragraph with:

```markdown
Enterprise SaaS AE with 8+ years driving net-new AI platform adoption across Fortune 500 enterprises. 2+ years selling AI-powered solutions directly (AI ITSM at Aisera, AI CLM at Agiloft) with proven ROI storytelling that moves enterprises from skepticism to deployment. Hunter and farmer: consistent new logo acquisition paired with expansion and retention. Top performer (110%–180% quota attainment) who thrives in high-ownership, founding-team environments. MEDDPICC and Command of the Message practitioner across complex, multi-stakeholder deals ($150K–$500K ACV).
```

- [ ] **Step 3: Overlay 2 — Aisera opener: strengthen founding team proof point**

Replace the Aisera first bullet with:

```markdown
- First-in-territory AE at a Series D AI hypergrowth startup; built entire GTM motion from zero infrastructure, closed 111% of $775K quota — direct proof of founding-team execution.
```

- [ ] **Step 4: Overlay 3 — Agiloft: embed "Command of the Message" in bullet text**

Replace the Agiloft ROI models bullet with:

```markdown
- Led 6–12 month AI platform sales cycles using Command of the Message framework; built ROI models demonstrating AI automation value to Legal, IT, Security, and Procurement decision-makers.
```

- [ ] **Step 5: Overlay 4 — Add RevOps to buyer persona lists**

Find and replace the Agiloft negotiation bullet's buyer list to include RevOps:

```markdown
- Negotiated customized commercial agreements with Legal, Procurement, RevOps, and C-suite; navigated multi-year contract terms and InfoSec review requirements across $150K–$500K ACV deals.
```

- [ ] **Step 6: Overlay 5 — Skills: add AI tool familiarity**

Replace the Sales Tech line with:

```markdown
**Sales Tech:** Salesforce, Clari, Gong, Outreach, ZoomInfo
**AI Tools:** ChatGPT, Notion AI
```

- [ ] **Step 7: Verify all 5 Apollo keyword gaps are closed**

```bash
FILE="{VAULT}/apollo-enterprise-ae-2026-04-09/optimized-resume.md"

grep -c "Command of the Message" "$FILE"     # Expected: ≥2 (summary + bullet)
grep -c "hunter" "$FILE"                      # Expected: ≥1
grep -c "RevOps" "$FILE"                      # Expected: ≥1
grep -c "founding.team\|founding team" "$FILE" # Expected: ≥1
grep -c "ChatGPT\|Notion AI" "$FILE"          # Expected: ≥1
```

---

## Final Verification Checklist

- [ ] Base resume exists at `{VAULT}/resume-saul-cabrera-base-2026-04-09.md`
- [ ] Apollo version exists at `{VAULT}/apollo-enterprise-ae-2026-04-09/optimized-resume.md`
- [ ] Zero `--` dashes in either file
- [ ] Phone number `512.470.0169` in both files
- [ ] $400K rescue + $230K expansion visible in Aisera section of both files
- [ ] 18-month zero-churn streak visible in Jamf section of both files
- [ ] Rapid7 has at least one metric in every bullet
- [ ] All 5 Apollo keyword overlays confirmed present in Apollo version
- [ ] Base resume reads as universally strong — no Apollo-specific language
