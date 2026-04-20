#!/usr/bin/env python3
"""
Job Match Agent — Scrapes job boards and ranks listings against Saul's resume.

Usage:
  # Live scrape (hits Indeed, LinkedIn, Glassdoor, ZipRecruiter, Google):
  python job_match_agent.py

  # Use existing CSV instead of scraping:
  python job_match_agent.py --csv scripts/jobs_ae_remote.csv

  # Customize search:
  python job_match_agent.py --terms "SaaS Account Executive" --location "Austin, TX" --hours 48

  # Filter results:
  python job_match_agent.py --min-score 60 --top 25
"""

import argparse
import csv
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional


# ─── Resume Profile ──────────────────────────────────────────────────────────

@dataclass
class ResumeProfile:
    """Structured representation of Saul's resume for scoring."""

    name: str = "Saul Orlando Cabrera"
    location: str = "Austin, TX"
    years_experience: int = 8
    seniority_level: str = "mid-senior"  # mid, mid-senior, senior, lead

    # Sales methodologies
    methodologies: list = field(default_factory=lambda: [
        "meddpicc", "meddic", "challenger", "roi selling",
        "value selling", "mutual action plan", "map",
    ])

    # Tools & platforms
    tools: list = field(default_factory=lambda: [
        "salesforce", "sfdc", "clari", "gong", "outreach",
        "zoominfo", "salesloft", "hubspot", "linkedin sales navigator",
    ])

    # Industries sold into
    industries: list = field(default_factory=lambda: [
        "legal", "it", "security", "procurement", "infosec",
        "cybersecurity", "compliance", "enterprise",
    ])

    # Product types sold
    product_types: list = field(default_factory=lambda: [
        "saas", "cloud", "ai", "automation", "clm",
        "contract lifecycle management", "endpoint", "mdm",
        "device management", "it security",
    ])

    # Key achievement signals
    achievement_keywords: list = field(default_factory=lambda: [
        "quota", "attainment", "arr", "acv", "pipeline",
        "net-new", "net new", "logo", "territory",
        "top 10%", "top performer", "president's club",
    ])

    # Title keywords that match well
    target_titles: list = field(default_factory=lambda: [
        "account executive", "ae", "enterprise account executive",
        "mid-market account executive", "commercial account executive",
        "strategic account executive", "sales executive",
        "regional sales", "territory manager",
    ])

    # Titles that are too junior or too senior
    exclude_titles: list = field(default_factory=lambda: [
        "sdr", "bdr", "sales development", "business development rep",
        "intern", "associate", "coordinator", "assistant",
        "vp of sales", "vice president", "chief revenue",
        "cro", "director of sales", "head of sales",
    ])

    # Industry exclusions (non-SaaS/tech)
    exclude_industries: list = field(default_factory=lambda: [
        "pharmaceutical", "pharma", "biotech", "medical device",
        "real estate", "insurance agent", "mortgage",
        "furniture", "manufacturing", "construction",
        "staffing agency", "recruitment agency",
    ])


# ─── Scoring Engine ──────────────────────────────────────────────────────────

@dataclass
class ScoreBreakdown:
    role_fit: float = 0.0         # 30% weight
    industry_product: float = 0.0  # 25% weight
    skills_match: float = 0.0      # 20% weight
    experience_align: float = 0.0  # 15% weight
    location_remote: float = 0.0   # 10% weight
    overall: float = 0.0

    @property
    def tier(self) -> str:
        if self.overall >= 85:
            return "🟢 Top Match"
        elif self.overall >= 70:
            return "🔵 Strong Match"
        elif self.overall >= 55:
            return "🟡 Moderate"
        elif self.overall >= 40:
            return "🟠 Stretch"
        else:
            return "🔴 Long Shot"

    @property
    def tier_short(self) -> str:
        if self.overall >= 85:
            return "TOP"
        elif self.overall >= 70:
            return "STRONG"
        elif self.overall >= 55:
            return "MOD"
        elif self.overall >= 40:
            return "STRETCH"
        else:
            return "LOW"


@dataclass
class ScoredJob:
    title: str
    company: str
    location: str
    salary_min: Optional[float]
    salary_max: Optional[float]
    url: str
    source: str
    date_posted: str
    description: str
    score: ScoreBreakdown = field(default_factory=ScoreBreakdown)
    rank: int = 0


class JobMatcher:
    """Multi-dimensional SaaS-sales-tuned scoring engine."""

    def __init__(self, profile: ResumeProfile):
        self.profile = profile

    def score_job(self, job: ScoredJob) -> ScoreBreakdown:
        title = (job.title or "").lower()
        desc = (job.description or "").lower()
        loc = (job.location or "").lower()
        full_text = f"{title} {desc}"

        breakdown = ScoreBreakdown()

        # ── 1. Role Fit (30%) ─────────────────────────────────────────────
        breakdown.role_fit = self._score_role_fit(title, desc)

        # ── 2. Industry & Product (25%) ───────────────────────────────────
        breakdown.industry_product = self._score_industry_product(full_text)

        # ── 3. Skills Match (20%) ─────────────────────────────────────────
        breakdown.skills_match = self._score_skills(full_text)

        # ── 4. Experience Alignment (15%) ─────────────────────────────────
        breakdown.experience_align = self._score_experience(full_text)

        # ── 5. Location / Remote (10%) ────────────────────────────────────
        breakdown.location_remote = self._score_location(loc, full_text)

        # ── Overall weighted score ────────────────────────────────────────
        breakdown.overall = round(
            breakdown.role_fit * 0.30
            + breakdown.industry_product * 0.25
            + breakdown.skills_match * 0.20
            + breakdown.experience_align * 0.15
            + breakdown.location_remote * 0.10,
            1
        )

        job.score = breakdown
        return breakdown

    # ── Dimension scorers ─────────────────────────────────────────────────

    def _score_role_fit(self, title: str, desc: str) -> float:
        score = 0.0

        # Check if title contains any excluded terms → heavy penalty
        for excl in self.profile.exclude_titles:
            if excl in title:
                return 5.0  # Almost zero — wrong seniority/role

        # Check title match (primary signal — up to 75 pts)
        if any(t in title for t in ["account executive", "ae"]):
            score += 75.0
        elif any(t in title for t in ["sales executive", "sales manager", "territory manager"]):
            score += 55.0
        elif any(kw in title for kw in ["account manager", "sales rep", "sales", "revenue"]):
            score += 35.0

        # Seniority alignment bonus (accumulates up to 25 pts)
        seniority_keywords = {
            "mid-market": 12, "midmarket": 12, "mid market": 12,
            "enterprise": 10, "commercial": 10, "strategic": 10,
            "full-cycle": 8, "full cycle": 8,
            "hunter": 6, "net-new": 6, "net new": 6,
            "new business": 6, "new logo": 6,
        }
        seniority_bonus = 0
        for kw, pts in seniority_keywords.items():
            if kw in f"{title} {desc}":
                seniority_bonus += pts
        score += min(seniority_bonus, 25.0)

        return min(score, 100.0)

    def _score_industry_product(self, text: str) -> float:
        score = 0.0

        # Check for excluded industries → heavy penalty
        excluded_count = sum(1 for excl in self.profile.exclude_industries if excl in text)
        if excluded_count >= 2:
            return 5.0  # Clearly wrong industry
        elif excluded_count == 1:
            score -= 20  # Mild penalty, could still be relevant

        # SaaS / Cloud / AI / Software signals
        saas_keywords = {
            "saas": 25, "software as a service": 25,
            "b2b saas": 25, "b2b software": 20,
            "enterprise software": 20, "software company": 18,
            "cloud": 12, "cloud-based": 14, "cloud platform": 14,
            "ai ": 40, "ai-": 40, "artificial intelligence": 40,
            "automation": 40, "machine learning": 30, "generative ai": 40,
            "genai": 40, "llm": 30,
            "platform": 6, "tech company": 12, "technology company": 12,
            "software": 10, "devops": 8, "api": 8,
            "data analytics": 8, "cybersecurity": 12, "fintech": 10,
        }
        matched_saas = 0
        for kw, pts in saas_keywords.items():
            if kw in text:
                matched_saas += pts
        # Increased cap to allow AI jobs to easily max out this category
        score += min(matched_saas, 75.0)

        # Industry alignment (Legal, IT, Security, Procurement)
        industry_matches = sum(1 for ind in self.profile.industries if ind in text)
        score += min(industry_matches * 10, 30.0)

        # Product type alignment
        product_matches = sum(1 for pt in self.profile.product_types if pt in text)
        score += min(product_matches * 8, 25.0)

        return max(min(score, 100.0), 0.0)

    def _score_skills(self, text: str) -> float:
        score = 0.0

        # Methodology match
        method_matches = sum(1 for m in self.profile.methodologies if m in text)
        score += min(method_matches * 15, 35.0)

        # Tool match
        tool_matches = sum(1 for t in self.profile.tools if t in text)
        score += min(tool_matches * 10, 30.0)

        # Sales competency keywords
        competency_kws = [
            "discovery", "demo", "presentation", "rfi", "rfp",
            "poc", "proof of concept", "proposal", "negotiat",
            "stakeholder", "multi-thread", "executive sponsor",
            "c-suite", "c-level", "cross-functional",
            "pipeline", "forecast", "territory", "quota",
            "cold call", "outbound", "prospecting",
            "close", "closing", "deal", "contract",
            "business case", "roi", "value",
        ]
        comp_matches = sum(1 for kw in competency_kws if kw in text)
        score += min(comp_matches * 3, 35.0)

        return min(score, 100.0)

    def _score_experience(self, text: str) -> float:
        score = 60.0  # Base score (assume OK unless contradicted)

        # If description is very short/empty, return base
        if len(text.strip()) < 100:
            return score

        # Extract years required from description
        years_patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|sales)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:in\s+)',
        ]
        required_years = None
        for pat in years_patterns:
            match = re.search(pat, text)
            if match:
                required_years = int(match.group(1))
                break

        if required_years is not None:
            if required_years <= self.profile.years_experience:
                score = 90.0  # Meets or exceeds
            elif required_years <= self.profile.years_experience + 2:
                score = 70.0  # Close enough
            else:
                score = 30.0  # Underqualified

        # ACV / deal size alignment signals
        deal_signals = [
            "six-figure", "six figure", "$100k", "$150k", "$200k", "$500k",
            "enterprise", "complex deal", "strategic",
        ]
        deal_matches = sum(1 for ds in deal_signals if ds in text)
        if deal_matches > 0:
            score = min(score + 15, 100.0)

        # Achievement-style keywords (they want proven performers)
        for kw in self.profile.achievement_keywords:
            if kw in text:
                score = min(score + 5, 100.0)

        return min(score, 100.0)

    def _score_location(self, location: str, text: str) -> float:
        # Check for remote
        remote_signals = ["remote", "work from home", "wfh", "distributed", "anywhere"]
        is_remote = any(sig in text for sig in remote_signals) or any(sig in location for sig in remote_signals)

        if is_remote:
            return 100.0

        # Check for Austin, TX
        if "austin" in location or "texas" in location or "tx" in location:
            return 90.0

        # Other US location
        if any(st in location.lower() for st in ["usa", "united states", "us-"]):
            return 50.0

        # Unknown or international
        return 30.0


# ─── Job Scraping ─────────────────────────────────────────────────────────────

def scrape_jobs(
    search_terms: list[str],
    location: str = "USA",
    is_remote: bool = True,
    hours_old: int = 72,
    results_wanted: int = 50,
    sites: list[str] = None,
) -> list[ScoredJob]:
    """Scrape job boards using jobspy."""
    try:
        from jobspy import scrape_jobs as jobspy_scrape
    except ImportError:
        print("❌ jobspy not installed. Install with: pip install python-jobspy")
        print("   Falling back to CSV mode. Use --csv flag to provide a CSV file.")
        sys.exit(1)

    if sites is None:
        sites = ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google"]

    all_jobs: list[ScoredJob] = []

    for term in search_terms:
        print(f"  🔍 Searching: \"{term}\" ...")
        try:
            df = jobspy_scrape(
                site_name=sites,
                search_term=term,
                google_search_term=f"{term} remote jobs",
                location=location,
                results_wanted=results_wanted,
                hours_old=hours_old,
                country_indeed="USA",
                is_remote=is_remote,
                verbose=0,
            )

            for _, row in df.iterrows():
                job = ScoredJob(
                    title=str(row.get("title", "")),
                    company=str(row.get("company", "")),
                    location=str(row.get("location", "")),
                    salary_min=_safe_float(row.get("min_amount")),
                    salary_max=_safe_float(row.get("max_amount")),
                    url=str(row.get("job_url", "")),
                    source=str(row.get("site", "")),
                    date_posted=str(row.get("date_posted", "")),
                    description=str(row.get("description", "")),
                )
                all_jobs.append(job)

            print(f"    ✅ Found {len(df)} listings")
        except Exception as e:
            print(f"    ⚠️  Error searching \"{term}\": {e}")

    # Deduplicate by (company + title)
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        key = (job.company.lower().strip(), job.title.lower().strip())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)

    print(f"\n  📊 Total unique listings: {len(unique_jobs)} (from {len(all_jobs)} raw)")
    return unique_jobs


def load_jobs_from_csv(csv_path: str) -> list[ScoredJob]:
    """Load jobs from an existing CSV (e.g., from a previous jobspy run)."""
    jobs: list[ScoredJob] = []

    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            job = ScoredJob(
                title=row.get("title", ""),
                company=row.get("company", ""),
                location=row.get("location", ""),
                salary_min=_safe_float(row.get("min_amount")),
                salary_max=_safe_float(row.get("max_amount")),
                url=row.get("job_url", ""),
                source=row.get("site", ""),
                date_posted=row.get("date_posted", ""),
                description=row.get("description", ""),
            )
            jobs.append(job)

    # Deduplicate
    seen = set()
    unique = []
    for job in jobs:
        key = (job.company.lower().strip(), job.title.lower().strip())
        if key not in seen:
            seen.add(key)
            unique.append(job)

    print(f"  📂 Loaded {len(unique)} unique jobs from CSV ({len(jobs)} total rows)")
    return unique


def _safe_float(val) -> Optional[float]:
    if val is None or str(val).strip() in ("", "nan", "None"):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


# ─── Ranking Engine ───────────────────────────────────────────────────────────

class RankingEngine:
    """Scores, ranks, and generates reports."""

    def __init__(self, profile: ResumeProfile):
        self.matcher = JobMatcher(profile)

    def score_and_rank(self, jobs: list[ScoredJob]) -> list[ScoredJob]:
        print(f"\n⚙️  Scoring {len(jobs)} jobs against resume...\n")
        for job in jobs:
            self.matcher.score_job(job)

        # Sort by overall score descending
        jobs.sort(key=lambda j: j.score.overall, reverse=True)

        # Assign ranks
        for i, job in enumerate(jobs):
            job.rank = i + 1

        return jobs

    def print_summary(self, jobs: list[ScoredJob], top_n: int = 20):
        tiers = {
            "🟢 Top Match": [j for j in jobs if j.score.overall >= 85],
            "🔵 Strong Match": [j for j in jobs if 70 <= j.score.overall < 85],
            "🟡 Moderate": [j for j in jobs if 55 <= j.score.overall < 70],
            "🟠 Stretch": [j for j in jobs if 40 <= j.score.overall < 55],
            "🔴 Long Shot": [j for j in jobs if j.score.overall < 40],
        }

        print("═" * 72)
        print("           JOB MATCH RESULTS — SAUL CABRERA")
        print("═" * 72)
        print(f"\n  Total Jobs Analyzed: {len(jobs)}")
        print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

        for tier_name, tier_jobs in tiers.items():
            count = len(tier_jobs)
            bar = "█" * min(count, 40)
            print(f"  {tier_name}: {count:>4}  {bar}")

        print(f"\n{'─' * 72}")
        print(f"  TOP {top_n} MATCHES")
        print(f"{'─' * 72}\n")

        for job in jobs[:top_n]:
            salary = _format_salary(job.salary_min, job.salary_max)
            print(f"  #{job.rank:<3} {job.score.tier}")
            print(f"      {job.title}")
            print(f"      📍 {job.company} | {job.location}")
            if salary:
                print(f"      💰 {salary}")
            print(f"      Score: {job.score.overall}/100  "
                  f"[Role:{job.score.role_fit:.0f} Ind:{job.score.industry_product:.0f} "
                  f"Skill:{job.score.skills_match:.0f} Exp:{job.score.experience_align:.0f} "
                  f"Loc:{job.score.location_remote:.0f}]")
            print(f"      🔗 {job.url}")
            print()

        print("═" * 72)

    def generate_markdown_report(
        self, jobs: list[ScoredJob], output_dir: str, top_n: int = 20
    ) -> str:
        tiers = {
            "🟢 Top Match (85-100)": [j for j in jobs if j.score.overall >= 85],
            "🔵 Strong Match (70-84)": [j for j in jobs if 70 <= j.score.overall < 85],
            "🟡 Moderate (55-69)": [j for j in jobs if 55 <= j.score.overall < 70],
            "🟠 Stretch (40-54)": [j for j in jobs if 40 <= j.score.overall < 55],
            "🔴 Long Shot (<40)": [j for j in jobs if j.score.overall < 40],
        }

        date_str = datetime.now().strftime("%Y-%m-%d")
        lines = []
        lines.append(f"# 🎯 Job Match Report — {date_str}")
        lines.append(f"\n**Candidate:** Saul Orlando Cabrera")
        lines.append(f"**Total Jobs Analyzed:** {len(jobs)}")
        lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

        lines.append("---\n")
        lines.append("## Summary\n")
        lines.append("| Tier | Count |")
        lines.append("|------|-------|")
        for tier_name, tier_jobs in tiers.items():
            lines.append(f"| {tier_name} | {len(tier_jobs)} |")

        lines.append(f"\n---\n")
        lines.append(f"## Top {top_n} Ranked Matches\n")
        lines.append("| Rank | Score | Tier | Title | Company | Location | Salary |")
        lines.append("|------|-------|------|-------|---------|----------|--------|")

        for job in jobs[:top_n]:
            salary = _format_salary(job.salary_min, job.salary_max) or "—"
            tier = job.score.tier_short
            lines.append(
                f"| #{job.rank} | {job.score.overall} | {tier} | "
                f"{_escape_md(job.title)} | {_escape_md(job.company)} | "
                f"{_escape_md(job.location)} | {salary} |"
            )

        lines.append(f"\n---\n")
        lines.append(f"## Detailed Cards — Top 10\n")

        for job in jobs[:10]:
            salary = _format_salary(job.salary_min, job.salary_max)
            lines.append(f"### #{job.rank}. {_escape_md(job.title)} — {_escape_md(job.company)}")
            lines.append(f"\n{job.score.tier} | **Score: {job.score.overall}/100**\n")
            lines.append("| Dimension | Score |")
            lines.append("|-----------|-------|")
            lines.append(f"| Role Fit (30%) | {job.score.role_fit:.0f} |")
            lines.append(f"| Industry/Product (25%) | {job.score.industry_product:.0f} |")
            lines.append(f"| Skills Match (20%) | {job.score.skills_match:.0f} |")
            lines.append(f"| Experience (15%) | {job.score.experience_align:.0f} |")
            lines.append(f"| Location/Remote (10%) | {job.score.location_remote:.0f} |")
            lines.append(f"\n- **Location:** {job.location}")
            if salary:
                lines.append(f"- **Salary:** {salary}")
            lines.append(f"- **Source:** {job.source}")
            lines.append(f"- **Posted:** {job.date_posted}")
            lines.append(f"- **Link:** [{job.url}]({job.url})")
            lines.append("")

        # Write file
        os.makedirs(output_dir, exist_ok=True)
        filename = f"job_matches_{date_str}.md"
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        return filepath


def _format_salary(min_val: Optional[float], max_val: Optional[float]) -> str:
    if min_val and max_val:
        return f"${min_val:,.0f} – ${max_val:,.0f}"
    elif min_val:
        return f"${min_val:,.0f}+"
    elif max_val:
        return f"Up to ${max_val:,.0f}"
    return ""


def _escape_md(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ")[:80]


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="🎯 Job Match Agent — Scrape, score, and rank jobs against your resume",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python job_match_agent.py                           # Live scrape with defaults
  python job_match_agent.py --csv jobs.csv            # Score existing CSV
  python job_match_agent.py --terms "SaaS AE" --top 30
  python job_match_agent.py --min-score 70            # Only show 70+ matches
        """
    )
    parser.add_argument("--csv", help="Path to existing CSV file (skip scraping)")
    parser.add_argument("--terms", nargs="+", default=[
        "Account Executive",
        "Enterprise Account Executive",
        "Mid-Market Account Executive",
        "SaaS Account Executive",
    ], help="Search terms (default: AE variants)")
    parser.add_argument("--location", default="USA", help="Location filter")
    parser.add_argument("--hours", type=int, default=72, help="Max age in hours")
    parser.add_argument("--results", type=int, default=50, help="Results per search term")
    parser.add_argument("--sites", nargs="+", default=None,
                        help="Sites to search (indeed linkedin glassdoor zip_recruiter google)")
    parser.add_argument("--min-score", type=float, default=0, help="Minimum score filter")
    parser.add_argument("--top", type=int, default=20, help="Number of top results to show")
    parser.add_argument("--no-remote", action="store_true", help="Include non-remote jobs")
    parser.add_argument("--output-dir", default=None, help="Output directory for report")
    args = parser.parse_args()

    print("\n🎯 Job Match Agent")
    print("━" * 40)

    # Determine output dir
    script_dir = Path(__file__).parent
    output_dir = args.output_dir or str(script_dir / "output")

    # Build resume profile
    profile = ResumeProfile()

    # Get jobs
    if args.csv:
        print(f"\n📂 Loading jobs from CSV: {args.csv}")
        jobs = load_jobs_from_csv(args.csv)
    else:
        print(f"\n🌐 Scraping job boards...")
        print(f"   Terms: {', '.join(args.terms)}")
        print(f"   Location: {args.location}")
        print(f"   Remote: {not args.no_remote}")
        print(f"   Max age: {args.hours}h\n")
        jobs = scrape_jobs(
            search_terms=args.terms,
            location=args.location,
            is_remote=not args.no_remote,
            hours_old=args.hours,
            results_wanted=args.results,
            sites=args.sites,
        )

    if not jobs:
        print("\n❌ No jobs found. Try broadening your search or providing a CSV.")
        sys.exit(1)

    # Score and rank
    engine = RankingEngine(profile)
    ranked_jobs = engine.score_and_rank(jobs)

    # Apply minimum score filter
    if args.min_score > 0:
        ranked_jobs = [j for j in ranked_jobs if j.score.overall >= args.min_score]
        print(f"  🔽 Filtered to {len(ranked_jobs)} jobs with score >= {args.min_score}")

    # Print console report
    engine.print_summary(ranked_jobs, top_n=args.top)

    # Generate markdown report
    report_path = engine.generate_markdown_report(ranked_jobs, output_dir, top_n=args.top)
    print(f"\n📄 Full report saved to: {report_path}\n")


if __name__ == "__main__":
    main()
