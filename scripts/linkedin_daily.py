#!/usr/bin/env python3
"""
LinkedIn Daily Networking Automation
Runs every weekday morning via macOS launchd.
Actions: comment (5/day), like (25/day), connect request (15/day), DM (3/day)

Usage:
  python3 linkedin_daily.py                      # Full daily run
  python3 linkedin_daily.py --dry-run            # Print planned actions, no posting
  python3 linkedin_daily.py --only comments      # Comments only
  python3 linkedin_daily.py --only likes         # Likes only
  python3 linkedin_daily.py --only connections   # Connection requests only (Day 2)
  python3 linkedin_daily.py --only dms           # DMs only (Day 5)
  python3 linkedin_daily.py --limit 1            # Max 1 action per engine
  python3 linkedin_daily.py --simulate-day2      # Force Day 2 sequence (testing)
"""

import argparse
import json
import logging
import random
import re
import time
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

import anthropic
from playwright.sync_api import BrowserContext, Page, sync_playwright

# ── Config ────────────────────────────────────────────────────────────────────

CONFIG_PATH = Path("/Users/Apple/Projectmanagement/config/linkedin_targets.json")
MODEL = "claude-haiku-4-5-20251001"

# Selector priority lists — LinkedIn DOM changes monthly; first match wins
COMMENT_BTN_SELECTORS = [
    'button[aria-label*="Comment"]',
    'button.social-actions-button[aria-label*="comment" i]',
    'button[data-control-name="comment"]',
]
EDITOR_SELECTORS = [
    '.tiptap[contenteditable="true"]',
    '[contenteditable="true"][class*="ProseMirror"]',
    '.ql-editor[contenteditable="true"]',
    '[contenteditable="true"]',
]
SUBMIT_SELECTORS = [
    'button.comments-comment-box__submit-button',
    'button[aria-label*="Post comment" i]',
    'button[data-control-name="submit_comment"]',
]
LIKE_BTN_SELECTORS = [
    'button[aria-label^="Like"][aria-pressed="false"]',
    'button[aria-label*="Like" i]:not([aria-label*="Unlike" i])',
    'button.react-button__trigger[aria-label*="Like" i]',
]
CONNECT_BTN_SELECTORS = [
    'button[aria-label*="Connect" i]',
    'button[aria-label*="Invite" i]',
]


# ── Dataclass ─────────────────────────────────────────────────────────────────

@dataclass
class OutreachRecord:
    person_name: str
    company: str
    profile_url: str
    post_url: str
    post_topic: str
    comment_text: str
    day0_date: str
    day2_connect_sent: Optional[str] = None
    day2_connect_accepted: Optional[bool] = None
    day5_dm_sent: Optional[str] = None
    outcome: Optional[str] = None


# ── State Machine ─────────────────────────────────────────────────────────────

class LinkedInStateMachine:
    """Persists outreach records, processed post IDs, and daily counts."""

    def __init__(self, state_path: Path):
        self.path = state_path
        self.data = self._load()

    def _load(self) -> dict:
        if self.path.exists():
            return json.loads(self.path.read_text())
        return {
            "outreach_records": [],
            "processed_posts": [],
            "processed_profiles": [],
            "daily_counts": {},
        }

    def save(self):
        self.path.write_text(json.dumps(self.data, indent=2, default=str))

    def is_post_processed(self, post_id: str) -> bool:
        return post_id in self.data["processed_posts"]

    def mark_post_processed(self, post_id: str):
        if post_id not in self.data["processed_posts"]:
            self.data["processed_posts"].append(post_id)
        self.save()

    def is_profile_processed(self, profile_url: str) -> bool:
        return profile_url in self.data["processed_profiles"]

    def add_record(self, record: OutreachRecord):
        self.data["outreach_records"].append(asdict(record))
        if record.profile_url and record.profile_url not in self.data["processed_profiles"]:
            self.data["processed_profiles"].append(record.profile_url)
        self.save()

    def get_day2_ready(self) -> list:
        today = date.today()
        return [
            r for r in self.data["outreach_records"]
            if not r.get("day2_connect_sent")
            and (today - date.fromisoformat(r["day0_date"])).days >= 2
        ]

    def get_day5_ready(self) -> list:
        today = date.today()
        return [
            r for r in self.data["outreach_records"]
            if r.get("day2_connect_accepted")
            and not r.get("day5_dm_sent")
            and (today - date.fromisoformat(r["day0_date"])).days >= 5
        ]

    def update_record(self, profile_url: str, updates: dict):
        for r in self.data["outreach_records"]:
            if r["profile_url"] == profile_url:
                r.update(updates)
        self.save()


# ── Rate Limiter ──────────────────────────────────────────────────────────────

class RateLimiter:
    """Hard daily limits. Counts reset automatically each calendar day."""

    def __init__(self, state: LinkedInStateMachine, limits: dict):
        self.state = state
        self.limits = limits
        self.today = str(date.today())
        if self.today not in self.state.data["daily_counts"]:
            self.state.data["daily_counts"][self.today] = {}

    @property
    def counts(self) -> dict:
        return self.state.data["daily_counts"][self.today]

    def can_perform(self, action: str) -> bool:
        return self.counts.get(action, 0) < self.limits.get(action, 0)

    def record(self, action: str):
        self.counts[action] = self.counts.get(action, 0) + 1
        self.state.save()

    def summary(self) -> str:
        return " | ".join(
            f"{k}: {self.counts.get(k, 0)}/{v}"
            for k, v in self.limits.items()
        )


# ── Comment Generator ─────────────────────────────────────────────────────────

FALLBACK_COMMENTS = [
    "The pipeline math here is real — when territory coverage and cycle time actually support the number, reps aren't terrified, they're motivated.",
    "The 'great with people' filter has cost more companies good hires than almost any other criterion — resilience and coachability don't show up on a resume.",
    "Seen this play out on the AE side: when the why behind the quota increase is data-driven (territory TAM, win rate, coverage ratio), the conversation changes completely.",
    "Eight years in enterprise SaaS and the deals that moved fastest were always the ones where economic impact was quantified before the first demo.",
    "Agreed — the reps who thrive in greenfield aren't necessarily the best closers, they're the best at creating urgency where none existed.",
    "The candidates who can articulate rejection tolerance in specifics — actual numbers, actual deals lost — are the ones worth a second conversation.",
    "What you're describing is exactly why pipeline coverage ratios matter more than raw activity metrics when you're evaluating territory performance.",
]

class AnthropicCommentGenerator:
    """Generates 1-2 sentence comments via claude-haiku-4-5, with static fallback."""

    def __init__(self):
        try:
            self.client = anthropic.Anthropic()
            self._api_available = True
        except Exception:
            self._api_available = False

    def generate(self, post_text: str, author_name: str, author_company: str) -> str:
        if self._api_available:
            try:
                prompt = f"""Write a LinkedIn comment (1-2 sentences MAX) from Saul Cabrera's POV on this post:

POST: {post_text[:800]}
AUTHOR: {author_name} ({author_company})

Saul = Enterprise AE, 8+ yrs, 110-180% attainment, $400K rescue deal at Aisera,
$1M+ new ARR at Jamf, MEDDPICC/Challenger seller, greenfield territory builder.
Tone: peer-level Slack message, NOT corporate.
NO buzzwords, NO "great post", NO fluff. Grounded in specific numbers or experience.
Max 2 sentences. Optional: end with one genuine question.
Return ONLY the comment text."""

                response = self.client.messages.create(
                    model=MODEL,
                    max_tokens=150,
                    messages=[{"role": "user", "content": prompt}],
                )
                return response.content[0].text.strip().strip('"')
            except Exception as e:
                # Fall through to static templates on any API error
                logging.getLogger(__name__).warning(f"API comment gen failed ({e}), using fallback")

        # Static fallback — pick based on post content keywords
        post_lower = post_text.lower()
        if any(w in post_lower for w in ["quota", "attainment", "number", "target"]):
            return FALLBACK_COMMENTS[0]
        if any(w in post_lower for w in ["hire", "hiring", "recruit", "talent"]):
            return FALLBACK_COMMENTS[1]
        if any(w in post_lower for w in ["pipeline", "forecast", "coverage"]):
            return FALLBACK_COMMENTS[6]
        if any(w in post_lower for w in ["rejection", "resilience", "mindset"]):
            return FALLBACK_COMMENTS[4]
        return random.choice(FALLBACK_COMMENTS)


# ── Activity Logger ───────────────────────────────────────────────────────────

class ActivityLogger:
    """Appends rows to the Obsidian activity-log.md table."""

    def __init__(self, log_path: Path):
        self.log_path = log_path

    def append_daily_row(self, record: OutreachRecord, day: str = "Day 0"):
        if not self.log_path.exists():
            return
        today = str(date.today())
        excerpt = record.comment_text[:60].replace("|", "—")
        topic = record.post_topic[:40].replace("|", "—")
        row = (
            f"| {today} | {record.person_name} | {record.company} | "
            f"{topic} | \"{excerpt}...\" | ✅ | TBD | {day} |"
        )
        content = self.log_path.read_text()
        marker = "\n\n---\n\n## Outreach Tracker"
        if marker in content:
            content = content.replace(marker, f"\n{row}{marker}", 1)
            self.log_path.write_text(content)

    def update_outreach_row(self, record: dict, day: str):
        if not self.log_path.exists():
            return
        content = self.log_path.read_text()
        today = str(date.today())
        name = record["person_name"]
        row = (
            f"| {name} | {record['company']} | {record['day0_date']} | "
            f"{today if day == 'Day 2' else '—'} | "
            f"{today if day == 'Day 5' else '—'} | — |"
        )
        marker = "\n---\n\n## Weekly Stats"
        if marker in content:
            content = content.replace(marker, f"\n{row}{marker}", 1)
            self.log_path.write_text(content)


# ── Browser ───────────────────────────────────────────────────────────────────

class LinkedInBrowser:
    """Playwright wrapper for all LinkedIn browser interactions."""

    def __init__(self, profile_dir: str, dry_run: bool = False, log: logging.Logger = None):
        self.profile_dir = profile_dir
        self.dry_run = dry_run
        self.log = log or logging.getLogger(__name__)
        self._pw = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None

    def __enter__(self):
        self._pw = sync_playwright().start()
        Path(self.profile_dir).mkdir(parents=True, exist_ok=True)
        self.context = self._pw.chromium.launch_persistent_context(
            user_data_dir=self.profile_dir,
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-extensions-except=",
            ],
            ignore_default_args=["--enable-automation"],
            viewport={"width": 1440, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
        )
        self.page = self.context.new_page()
        # Mask automation fingerprints
        self.page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});
            Object.defineProperty(navigator, 'languages', {get: () => ['en-US','en']});
            window.chrome = {runtime: {}};
        """)
        return self

    def __exit__(self, *args):
        if self.context:
            self.context.close()
        if self._pw:
            self._pw.stop()

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _human_delay(self, min_s: float = 2.0, max_s: float = 5.0):
        time.sleep(random.uniform(min_s, max_s))

    def _check_captcha(self) -> bool:
        url = self.page.url
        if "checkpoint/challenge" in url or "captcha" in url:
            self.log.error(f"CAPTCHA detected at {url} — manual intervention required")
            return True
        return False

    def _scroll_naturally(self, times: int = 3):
        for _ in range(times):
            self.page.evaluate(f"window.scrollBy(0, {random.randint(200, 500)})")
            self._human_delay(0.5, 1.5)

    def _try_selectors(self, selectors: list, timeout_ms: int = 5000):
        """Return first matching visible element across selector list."""
        for sel in selectors:
            try:
                el = self.page.wait_for_selector(sel, timeout=timeout_ms)
                if el and el.is_visible():
                    return el
            except Exception:
                continue
        return None

    # ── Feed Discovery ────────────────────────────────────────────────────────

    def navigate_to_hashtag(self, hashtag: str):
        tag = hashtag.lstrip("#")
        url = (
            f"https://www.linkedin.com/search/results/content/"
            f"?keywords=%23{tag}&sortBy=date_posted"
        )
        self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
        self.page.wait_for_timeout(3000)
        if self._check_captcha():
            raise RuntimeError("CAPTCHA — stopping run")
        self._scroll_naturally()

    def extract_posts_from_feed(self) -> list:
        """Scrape post data from the current search feed page via JS evaluation."""
        posts = []
        try:
            # Wait for any post-like content to appear
            self.page.wait_for_timeout(3000)
            self._scroll_naturally(2)

            raw = self.page.evaluate("""
                () => {
                    const results = [];
                    const seen = new Set();

                    // LinkedIn now puts /in/ links whose DIRECT PARENT is the post container div.
                    // Find those parent divs, deduplicate, extract post data.
                    const profileLinks = [...document.querySelectorAll('a[href*="/in/"]')];

                    for (const link of profileLinks) {
                        const el = link.parentElement;
                        if (!el || seen.has(el)) continue;
                        seen.add(el);

                        try {
                            const fullText = (el.innerText || '').trim();
                            if (fullText.length < 40) continue;

                            // Profile URL
                            const href = link.getAttribute('href') || '';
                            const profileUrl = href.startsWith('http')
                                ? href.split('?')[0]
                                : 'https://www.linkedin.com' + href.split('?')[0];

                            // Author name — first aria-hidden span with short text
                            let authorName = 'Unknown';
                            for (const s of el.querySelectorAll('span[aria-hidden="true"]')) {
                                const t = s.innerText.trim();
                                if (t.length > 2 && t.length < 60 && !t.includes('\\n')) {
                                    authorName = t;
                                    break;
                                }
                            }

                            // Company — second short aria-hidden span
                            let company = '';
                            let foundCount = 0;
                            for (const s of el.querySelectorAll('span[aria-hidden="true"]')) {
                                const t = s.innerText.trim();
                                if (t.length > 2 && t.length < 120 && !t.includes('\\n')) {
                                    foundCount++;
                                    if (foundCount === 2) { company = t; break; }
                                }
                            }

                            // Post text — longest visible span (not aria-hidden)
                            let postText = '';
                            for (const s of el.querySelectorAll('span:not([aria-hidden="true"])')) {
                                const t = (s.innerText || '').trim();
                                if (t.length > postText.length && t.length > 30 && t.length < 2000) {
                                    postText = t;
                                }
                            }
                            if (postText.length < 30) postText = fullText.substring(0, 600);

                            // Post URL and ID — look for activity/feed links anywhere in parent chain
                            let postUrl = '';
                            let searchEl = el;
                            for (let d = 0; d < 6; d++) {
                                if (!searchEl) break;
                                for (const a of searchEl.querySelectorAll('a[href]')) {
                                    const h = a.getAttribute('href') || '';
                                    if (h.includes('activity') || h.includes('/feed/update/')) {
                                        postUrl = h.startsWith('http') ? h : 'https://www.linkedin.com' + h;
                                        break;
                                    }
                                }
                                if (postUrl) break;
                                searchEl = searchEl.parentElement;
                            }
                            if (!postUrl) postUrl = profileUrl;

                            const m = postUrl.match(/activity[:\\-](\\d+)/);
                            const postId = m ? m[1] : (profileUrl + '_' + Date.now()).replace(/[^a-z0-9_]/gi,'').substring(0,40);

                            if (profileUrl && profileUrl.includes('/in/')) {
                                results.push({ postText, authorName, company, postUrl, postId, profileUrl });
                            }
                        } catch(e) {}
                    }
                    return results;
                }
            """)
            for r in raw:
                posts.append({
                    "post_text": r.get("postText", "")[:600],
                    "author_name": r.get("authorName", "Unknown"),
                    "company": r.get("company", ""),
                    "post_url": r.get("postUrl", ""),
                    "post_id": r.get("postId", ""),
                    "profile_url": r.get("profileUrl", ""),
                })
            self.log.debug(f"Extracted {len(posts)} posts via JS")
        except Exception as e:
            self.log.error(f"extract_posts_from_feed error: {e}")
        return posts

    # ── Comment Engine ────────────────────────────────────────────────────────

    def post_comment(self, post_url: str, comment_text: str) -> bool:
        if self.dry_run:
            self.log.info(f"[DRY-RUN] Comment on {post_url[:70]}: {comment_text[:80]}")
            return True
        try:
            self.page.goto(post_url, wait_until="domcontentloaded", timeout=30000)
            self._human_delay(2, 4)
            if self._check_captcha():
                return False

            # Open comment editor
            btn = self._try_selectors(COMMENT_BTN_SELECTORS)
            if btn:
                btn.scroll_into_view_if_needed()
                btn.click()
                self._human_delay(1, 2)

            # Find editor
            editor = self._try_selectors(EDITOR_SELECTORS, timeout_ms=6000)
            if not editor:
                self.log.error("Comment editor not found")
                return False

            editor.click()
            self._human_delay(0.5, 1.0)

            # Inject text — validated working pattern for LinkedIn Tiptap/ProseMirror
            self.page.evaluate(
                """(text) => {
                    const ed = document.querySelector('[contenteditable="true"]');
                    if (ed) {
                        ed.focus();
                        document.execCommand('selectAll', false, null);
                        document.execCommand('delete', false, null);
                        document.execCommand('insertText', false, text);
                    }
                }""",
                comment_text,
            )
            self._human_delay(1, 2)

            # Submit
            submitted = False
            submit = self._try_selectors(SUBMIT_SELECTORS)
            if submit:
                submit.click()
                submitted = True
            else:
                # Fallback: find button by text
                submitted = self.page.evaluate(
                    """() => {
                        const btn = [...document.querySelectorAll('button')]
                            .find(b => b.textContent.trim() === 'Comment'
                                    && b.getAttribute('type') !== 'button');
                        if (btn) { btn.click(); return true; }
                        return false;
                    }"""
                )

            self._human_delay(2, 4)
            self.log.info(f"Comment posted: {comment_text[:60]}")
            return bool(submitted)

        except Exception as e:
            self.log.error(f"post_comment error: {e}")
            return False

    # ── Like Engine ───────────────────────────────────────────────────────────

    def like_post(self, post_url: str) -> bool:
        if self.dry_run:
            self.log.info(f"[DRY-RUN] Like {post_url[:70]}")
            return True
        try:
            self.page.goto(post_url, wait_until="domcontentloaded", timeout=30000)
            self._human_delay(1, 3)
            if self._check_captcha():
                return False

            btn = self._try_selectors(LIKE_BTN_SELECTORS)
            if btn:
                btn.scroll_into_view_if_needed()
                btn.click()
                self._human_delay(0.5, 1.5)
                self.log.info(f"Liked {post_url[:70]}")
                return True
            return False
        except Exception as e:
            self.log.error(f"like_post error: {e}")
            return False

    # ── Connection Engine ─────────────────────────────────────────────────────

    def send_connection_request(self, profile_url: str, note: str) -> bool:
        if self.dry_run:
            self.log.info(f"[DRY-RUN] Connect {profile_url[:70]}: {note[:60]}")
            return True
        try:
            self.page.goto(profile_url, wait_until="domcontentloaded", timeout=30000)
            self._human_delay(2, 4)
            if self._check_captcha():
                return False

            # Skip if already connected (Message button present)
            msg_btn = self.page.query_selector('button[aria-label*="Message" i]')
            if msg_btn and msg_btn.is_visible():
                self.log.info("Already connected — skipping")
                return False

            btn = self._try_selectors(CONNECT_BTN_SELECTORS)
            if not btn:
                self.log.warning(f"No Connect button on {profile_url[:70]}")
                return False

            btn.click()
            self._human_delay(1, 2)

            # Try to add a note
            try:
                note_btn = self.page.wait_for_selector(
                    'button[aria-label*="Add a note" i]', timeout=5000
                )
                if note_btn and note_btn.is_visible():
                    note_btn.click()
                    self._human_delay(1, 2)
                    textarea = self.page.wait_for_selector(
                        'textarea[name="message"], textarea[id*="custom-message"]',
                        timeout=5000,
                    )
                    if textarea:
                        textarea.fill(note[:300])
                        self._human_delay(1, 2)
            except Exception:
                self.log.debug("Add-note dialog not found — sending without note")

            # Send
            send_btn = self._try_selectors([
                'button[aria-label*="Send" i][type="submit"]',
                'button[aria-label*="Send invitation" i]',
                'button[aria-label*="Send now" i]',
            ])
            if send_btn:
                send_btn.click()
                self._human_delay(1, 2)
                self.log.info(f"Connection request sent to {profile_url[:70]}")
                return True
            return False

        except Exception as e:
            self.log.error(f"send_connection_request error: {e}")
            return False

    # ── Persona Search Engine ─────────────────────────────────────────────────

    def search_persona_profiles(self, search_url: str, max_results: int = 8) -> list:
        """Search LinkedIn people results and return profile URLs + names via JS."""
        profiles = []
        try:
            self.page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            self.page.wait_for_timeout(3000)
            if self._check_captcha():
                return profiles
            self._scroll_naturally(2)

            raw = self.page.evaluate(f"""
                () => {{
                    const results = [];
                    const limit = {max_results};
                    const seen = new Set();

                    // Use parent div of /in/ links — works with LinkedIn's hashed class names
                    const profileLinks = [...document.querySelectorAll('a[href*="/in/"]')];
                    for (const link of profileLinks) {{
                        if (results.length >= limit) break;
                        const el = link.parentElement;
                        if (!el || seen.has(el)) continue;
                        seen.add(el);
                        try {{
                            const href = link.getAttribute('href') || '';
                            const profileUrl = href.startsWith('http')
                                ? href.split('?')[0]
                                : 'https://www.linkedin.com' + href.split('?')[0];
                            if (!profileUrl.includes('/in/')) continue;

                            let name = '';
                            for (const s of el.querySelectorAll('span[aria-hidden="true"]')) {{
                                const t = s.innerText.trim();
                                if (t.length > 2 && t.length < 60 && !t.includes('\\n')) {{
                                    name = t;
                                    break;
                                }}
                            }}
                            if (!name) name = link.innerText.trim().split('\\n')[0] || 'Unknown';

                            if (profileUrl) results.push({{ name, profileUrl }});
                        }} catch(e) {{}}
                    }}
                    return results;
                }}
            """)
            for r in raw:
                profiles.append({"name": r["name"], "profile_url": r["profileUrl"]})
            self.log.debug(f"Persona search found {len(profiles)} candidates")
        except Exception as e:
            self.log.error(f"search_persona_profiles error: {e}")
        return profiles

    # ── DM Engine ─────────────────────────────────────────────────────────────

    def send_dm(self, profile_url: str, message: str) -> bool:
        if self.dry_run:
            self.log.info(f"[DRY-RUN] DM {profile_url[:70]}: {message[:60]}")
            return True
        try:
            self.page.goto(profile_url, wait_until="domcontentloaded", timeout=30000)
            self._human_delay(2, 4)
            if self._check_captcha():
                return False

            msg_btn = self.page.query_selector('button[aria-label*="Message" i]')
            if not msg_btn or not msg_btn.is_visible():
                self.log.warning(f"No Message button on {profile_url[:70]} — not connected?")
                return False

            msg_btn.click()
            self._human_delay(2, 3)

            msg_editor = self.page.wait_for_selector(
                '.msg-form__contenteditable, [contenteditable="true"][placeholder*="message" i]',
                timeout=6000,
            )
            if msg_editor:
                msg_editor.click()
                self.page.evaluate(
                    """(text) => {
                        const ed = document.querySelector(
                            '.msg-form__contenteditable, [contenteditable="true"]'
                        );
                        if (ed) { ed.focus(); document.execCommand('insertText', false, text); }
                    }""",
                    message,
                )
                self._human_delay(1, 2)
                send = self._try_selectors([
                    'button.msg-form__send-button[aria-label*="Send" i]',
                    'button[aria-label*="Send" i].msg-form__send-button',
                ])
                if send:
                    send.click()
                    self.log.info(f"DM sent to {profile_url[:70]}")
                    return True
            return False

        except Exception as e:
            self.log.error(f"send_dm error: {e}")
            return False


# ── Orchestrator ──────────────────────────────────────────────────────────────

class DailyOrchestrator:
    def __init__(
        self,
        config: dict,
        state: LinkedInStateMachine,
        browser: LinkedInBrowser,
        limiter: RateLimiter,
        generator: AnthropicCommentGenerator,
        activity_logger: ActivityLogger,
        log: logging.Logger,
        only: Optional[str] = None,
        limit: Optional[int] = None,
    ):
        self.config = config
        self.state = state
        self.browser = browser
        self.limiter = limiter
        self.generator = generator
        self.activity_logger = activity_logger
        self.log = log
        self.only = only
        self.limit = limit

    def _jitter_wait(self):
        anti = self.config.get("anti_spam", {})
        delay = random.uniform(
            anti.get("min_delay_between_actions_sec", 45),
            anti.get("max_delay_between_actions_sec", 180),
        )
        self.log.info(f"Anti-spam pause: {delay:.0f}s")
        time.sleep(delay)

    def _max_for(self, action: str) -> int:
        configured = self.config["daily_limits"][action]
        return min(self.limit, configured) if self.limit else configured

    # ── Comment Engine ────────────────────────────────────────────────────────

    def run_comment_engine(self):
        self.log.info("── Comment engine ──")
        count = 0
        max_count = self._max_for("comments")
        hashtags = self.config["hashtags"].copy()
        random.shuffle(hashtags)

        for hashtag in hashtags:
            if count >= max_count or not self.limiter.can_perform("comments"):
                break
            self.log.info(f"Scanning {hashtag}…")
            try:
                self.browser.navigate_to_hashtag(hashtag)
            except RuntimeError as e:
                self.log.error(str(e))
                return

            posts = self.browser.extract_posts_from_feed()
            self.log.info(f"  {len(posts)} posts found")

            for post in posts:
                if count >= max_count or not self.limiter.can_perform("comments"):
                    break
                if not post["post_id"] or self.state.is_post_processed(post["post_id"]):
                    continue

                comment = self.generator.generate(
                    post["post_text"], post["author_name"], post["company"]
                )
                self.log.info(f"  Comment for {post['author_name']}: {comment[:80]}")

                if self.browser.post_comment(post["post_url"], comment):
                    self.state.mark_post_processed(post["post_id"])
                    self.limiter.record("comments")
                    count += 1

                    record = OutreachRecord(
                        person_name=post["author_name"],
                        company=post["company"],
                        profile_url=post["profile_url"],
                        post_url=post["post_url"],
                        post_topic=post["post_text"][:40].replace("\n", " "),
                        comment_text=comment,
                        day0_date=str(date.today()),
                    )
                    if not self.state.is_profile_processed(post["profile_url"]):
                        self.state.add_record(record)
                    self.activity_logger.append_daily_row(record)

                    if count < max_count:
                        self._jitter_wait()

        self.log.info(f"Comment engine done: {count} posted")

    # ── Like Engine ───────────────────────────────────────────────────────────

    def run_like_engine(self):
        self.log.info("── Like engine ──")
        count = 0
        max_count = self._max_for("likes")
        hashtags = self.config["hashtags"].copy()
        random.shuffle(hashtags)

        for hashtag in hashtags:
            if count >= max_count or not self.limiter.can_perform("likes"):
                break
            try:
                self.browser.navigate_to_hashtag(hashtag)
            except RuntimeError as e:
                self.log.error(str(e))
                return

            posts = self.browser.extract_posts_from_feed()
            for post in posts:
                if count >= max_count or not self.limiter.can_perform("likes"):
                    break
                liked_key = f"liked_{post['post_id']}"
                if self.state.is_post_processed(liked_key):
                    continue
                if self.browser.like_post(post["post_url"]):
                    self.state.mark_post_processed(liked_key)
                    self.limiter.record("likes")
                    count += 1
                    time.sleep(random.uniform(15, 45))

        self.log.info(f"Like engine done: {count} liked")

    # ── Connection Engine ─────────────────────────────────────────────────────

    def run_connection_engine(self):
        self.log.info("── Connection engine (Day 2) ──")
        records = self.state.get_day2_ready()
        self.log.info(f"  {len(records)} records ready for Day 2")
        count = 0
        max_count = self._max_for("connection_requests")

        for record in records:
            if count >= max_count or not self.limiter.can_perform("connection_requests"):
                break
            first_name = record["person_name"].split()[0]
            note = (
                f"Hey {first_name} — left a comment on your post about "
                f"{record['post_topic'][:50]}. "
                f"I'm an enterprise AE exploring this space — would love to connect."
            )[:300]

            if self.browser.send_connection_request(record["profile_url"], note):
                self.state.update_record(
                    record["profile_url"],
                    {"day2_connect_sent": str(date.today())}
                )
                self.activity_logger.update_outreach_row(record, "Day 2")
                self.limiter.record("connection_requests")
                count += 1
                if count < max_count:
                    self._jitter_wait()

        self.log.info(f"Connection engine done: {count} requests sent")

    # ── Persona Connection Engine ──────────────────────────────────────────────

    def run_persona_connection_engine(self):
        """Proactively search for target personas and send connection requests."""
        self.log.info("── Persona connection engine ──")
        persona_buckets = self.config.get("persona_searches", [])
        if not persona_buckets:
            self.log.info("  No persona_searches configured — skipping")
            return

        total_sent = 0
        max_total = self._max_for("connection_requests")

        for bucket in persona_buckets:
            if total_sent >= max_total or not self.limiter.can_perform("connection_requests"):
                break

            bucket_name = bucket.get("bucket", "Unknown")
            search_url = bucket.get("search_url", "")
            per_day = bucket.get("connect_per_day", 2)
            note_template = bucket.get(
                "connection_note_template",
                "Hey {first_name} — I'm an enterprise AE exploring my next role. Would love to connect."
            )
            bucket_limit = min(per_day, max_total - total_sent)

            self.log.info(f"  Searching bucket: {bucket_name} (limit {bucket_limit})")
            profiles = self.browser.search_persona_profiles(search_url, max_results=bucket_limit * 3)
            self.log.info(f"  Found {len(profiles)} candidates")

            bucket_sent = 0
            for profile in profiles:
                if bucket_sent >= bucket_limit or not self.limiter.can_perform("connection_requests"):
                    break
                profile_url = profile["profile_url"]
                if self.state.is_profile_processed(profile_url):
                    self.log.debug(f"  Already processed: {profile_url}")
                    continue

                first_name = profile["name"].split()[0] if profile["name"] else "there"
                note = note_template.format(first_name=first_name)[:300]

                if self.browser.send_connection_request(profile_url, note):
                    record = OutreachRecord(
                        person_name=profile["name"],
                        company=bucket_name,
                        profile_url=profile_url,
                        post_url="",
                        post_topic=f"Persona search: {bucket_name}",
                        comment_text="",
                        day0_date=str(date.today()),
                        day2_connect_sent=str(date.today()),
                    )
                    self.state.add_record(record)
                    self.limiter.record("connection_requests")
                    bucket_sent += 1
                    total_sent += 1
                    self.log.info(f"  Connected: {profile['name']} ({bucket_name})")
                    if total_sent < max_total:
                        self._jitter_wait()

            self.log.info(f"  {bucket_name}: {bucket_sent} requests sent")

        self.log.info(f"Persona connection engine done: {total_sent} total requests sent")

    # ── DM Engine ─────────────────────────────────────────────────────────────

    def run_dm_engine(self):
        self.log.info("── DM engine (Day 5) ──")
        records = self.state.get_day5_ready()
        self.log.info(f"  {len(records)} records ready for Day 5")
        count = 0
        max_count = self._max_for("dms")

        for record in records:
            if count >= max_count or not self.limiter.can_perform("dms"):
                break
            first_name = record["person_name"].split()[0]
            message = (
                f"Thanks for connecting, {first_name}. "
                f"I've been selling into enterprise buyers for 8+ years across AI/SaaS — "
                f"always good to connect with people building in this space. "
                f"Happy to compare notes anytime."
            )
            if self.browser.send_dm(record["profile_url"], message):
                self.state.update_record(
                    record["profile_url"],
                    {"day5_dm_sent": str(date.today())}
                )
                self.activity_logger.update_outreach_row(record, "Day 5")
                self.limiter.record("dms")
                count += 1
                if count < max_count:
                    self._jitter_wait()

        self.log.info(f"DM engine done: {count} DMs sent")

    def run(self):
        only = self.only
        if not only or only == "comments":
            self.run_comment_engine()
        if not only or only == "likes":
            self.run_like_engine()
        if not only or only == "connections":
            self.run_connection_engine()
        if not only or only == "persona_connect":
            self.run_persona_connection_engine()
        if not only or only == "dms":
            self.run_dm_engine()
        self.log.info(f"Daily totals — {self.limiter.summary()}")


# ── Entry Point ───────────────────────────────────────────────────────────────

def setup_logging(log_dir: Path) -> logging.Logger:
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"linkedin_{date.today()}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-8s %(message)s",
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(),
        ],
    )
    return logging.getLogger("linkedin_daily")


def main():
    parser = argparse.ArgumentParser(description="LinkedIn Daily Networking Automation")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print planned actions without posting")
    parser.add_argument("--only", choices=["comments", "likes", "connections", "persona_connect", "dms"],
                        help="Run only one engine")
    parser.add_argument("--limit", type=int,
                        help="Max actions per engine for this run")
    parser.add_argument("--simulate-day2", action="store_true",
                        help="Force Day 2 sequence for testing (backdates all records by 2 days)")
    parser.add_argument("--force", action="store_true",
                        help="Bypass run-window check (for testing)")
    args = parser.parse_args()

    config = load_config()

    # Run-window guard (bypass in dry-run or --force mode)
    if not args.dry_run and not args.force:
        hour = datetime.now().hour
        window = config.get("run_window", {})
        start, end = window.get("start_hour", 8), window.get("end_hour", 11)
        if not (start <= hour <= end):
            print(f"Outside run window ({start}:00–{end}:00). Exiting.")
            return

    log_dir = Path(config["log_dir"])
    log = setup_logging(log_dir)
    log.info(
        f"LinkedIn Daily starting — dry_run={args.dry_run} "
        f"only={args.only} limit={args.limit}"
    )

    state_path = Path(config["state_file"])
    state = LinkedInStateMachine(state_path)

    # Simulate Day 2 for testing
    if args.simulate_day2:
        two_days_ago = str(date.today() - timedelta(days=2))
        for r in state.data["outreach_records"]:
            if not r.get("day2_connect_sent"):
                r["day0_date"] = two_days_ago
        state.save()
        log.info("simulate-day2: backdated all un-connected records to 2 days ago")

    limiter = RateLimiter(state, config["daily_limits"])
    generator = AnthropicCommentGenerator()
    activity_logger = ActivityLogger(Path(config["activity_log"]))

    with LinkedInBrowser(config["browser_profile_dir"], dry_run=args.dry_run, log=log) as browser:
        orchestrator = DailyOrchestrator(
            config=config,
            state=state,
            browser=browser,
            limiter=limiter,
            generator=generator,
            activity_logger=activity_logger,
            log=log,
            only=args.only,
            limit=args.limit,
        )
        orchestrator.run()

    log.info("LinkedIn Daily complete.")


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text())


if __name__ == "__main__":
    main()
