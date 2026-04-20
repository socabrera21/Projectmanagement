const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Intigriti × Starling Bank — Bug Bounty Proposal";
pres.author = "Saul Cabrera";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  darkBg:    "0B0A18",   // near-black purple
  cardBg:    "1A1640",   // dark purple card
  cardBg2:   "13112E",   // slightly darker card variant
  accent:    "7C3AED",   // Intigriti violet
  accentLt:  "A78BFA",   // lighter violet
  accentBar: "6D28D9",   // deeper violet
  white:     "FFFFFF",
  offWhite:  "E2E8F0",
  gray:      "94A3B8",
  green:     "10B981",
  red:       "EF4444",
  gold:      "F59E0B",
};

const makeShadow = () => ({
  type: "outer", blur: 12, offset: 3, angle: 135,
  color: "000000", opacity: 0.35
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function darkSlide(slide) {
  slide.background = { color: C.darkBg };
}

function addCard(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: opts.color || C.cardBg },
    line: { color: opts.border || C.accent, width: opts.borderWidth || 0.5 },
    shadow: makeShadow(),
  });
}

function accentBar(slide, x, y, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.07, h,
    fill: { color: C.accent },
    line: { color: C.accent, width: 0 },
  });
}

function slideLabel(slide, text) {
  slide.addText(text.toUpperCase(), {
    x: 0.45, y: 0.22, w: 9, h: 0.25,
    fontSize: 9, color: C.accentLt, bold: true,
    charSpacing: 3, margin: 0,
  });
}

function slideTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.45, y: opts.y || 0.55, w: opts.w || 9.1, h: opts.h || 0.65,
    fontSize: opts.size || 30, fontFace: "Georgia",
    color: opts.color || C.white, bold: true, margin: 0,
  });
}

function divider(slide, y) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y, w: 9.1, h: 0.03,
    fill: { color: C.accent, transparency: 50 },
    line: { color: C.accent, width: 0 },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);

  // Full-bleed left stripe
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.35, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent, width: 0 },
  });

  // Subtle grid dots pattern (large decorative rectangle, low opacity)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.5, y: 0, w: 3.5, h: 5.625,
    fill: { color: C.accent, transparency: 92 },
    line: { color: C.accent, width: 0 },
  });

  // INTIGRITI wordmark area
  s.addText("intigriti", {
    x: 0.65, y: 0.7, w: 4, h: 0.55,
    fontSize: 22, fontFace: "Georgia", color: C.accentLt,
    bold: true, charSpacing: 4, margin: 0,
  });

  // Thin separator line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: 1.38, w: 3.0, h: 0.03,
    fill: { color: C.accentLt, transparency: 40 },
    line: { color: C.accentLt, width: 0 },
  });

  // Main headline
  s.addText("Securing\nStarling Bank's\nFuture", {
    x: 0.65, y: 1.55, w: 6.5, h: 2.3,
    fontSize: 42, fontFace: "Georgia",
    color: C.white, bold: true, margin: 0,
  });

  // Subtitle
  s.addText("A Continuous Security Partnership Built for UK Fintech", {
    x: 0.65, y: 3.95, w: 7, h: 0.45,
    fontSize: 15, fontFace: "Calibri",
    color: C.offWhite, margin: 0,
  });

  // Bottom meta
  s.addText("Prepared for: James Collins, CISO  ·  Starling Bank  ·  2026", {
    x: 0.65, y: 5.1, w: 8, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: C.gray, margin: 0,
  });

  // Right side big stat teaser
  s.addText("70K+", {
    x: 6.8, y: 1.4, w: 3, h: 1.2,
    fontSize: 72, fontFace: "Georgia", color: C.accent,
    bold: true, align: "center", margin: 0,
  });
  s.addText("ETHICAL HACKERS\nREADY TO WORK FOR YOU", {
    x: 6.5, y: 2.65, w: 3.3, h: 0.75,
    fontSize: 11, fontFace: "Calibri", color: C.accentLt,
    bold: true, align: "center", charSpacing: 1, margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — WHERE STARLING STANDS TODAY
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);
  slideLabel(s, "Context");
  slideTitle(s, "Where Starling Stands Today");
  divider(s, 1.28);

  // Left column: current state
  addCard(s, 0.45, 1.45, 4.25, 3.75, { color: C.cardBg });
  accentBar(s, 0.45, 1.45, 3.75);

  s.addText("Current Security Posture", {
    x: 0.68, y: 1.62, w: 3.8, h: 0.35,
    fontSize: 14, fontFace: "Georgia", color: C.accentLt, bold: true, margin: 0,
  });

  const currentItems = [
    { icon: "✓", col: C.green, text: "HackerOne VDP — public acknowledgment" },
    { icon: "✓", col: C.green, text: "Private researcher pilot on pre-prod systems" },
    { icon: "✓", col: C.green, text: "£12.1B deposits, 4.6M accounts — rapidly scaling" },
    { icon: "⚠", col: C.gold,  text: "No paid bug bounty program yet" },
    { icon: "⚠", col: C.gold,  text: "Engine by Starling adds new API attack surface" },
    { icon: "✗", col: C.red,   text: "£29M FCA fine: sanctions screening misconfiguration\nundetected for years by internal teams" },
  ];

  currentItems.forEach((item, i) => {
    const yPos = 2.12 + i * 0.53;
    s.addText(item.icon, {
      x: 0.65, y: yPos, w: 0.35, h: 0.38,
      fontSize: 13, color: item.col, bold: true,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(item.text, {
      x: 1.05, y: yPos, w: 3.45, h: 0.38,
      fontSize: 11.5, fontFace: "Calibri", color: C.offWhite,
      valign: "middle", margin: 0,
    });
  });

  // Right column: the opportunity
  addCard(s, 5.0, 1.45, 4.55, 3.75, { color: C.cardBg2, border: C.accentLt, borderWidth: 0.75 });
  accentBar(s, 5.0, 1.45, 3.75);

  s.addText("The Opportunity", {
    x: 5.23, y: 1.62, w: 4.1, h: 0.35,
    fontSize: 14, fontFace: "Georgia", color: C.accentLt, bold: true, margin: 0,
  });

  s.addText([
    { text: "Starling is mid-journey. ", options: { bold: true, color: C.white } },
    { text: "The VDP proves the intent. The private pilot proves the team can operate it.\n\nWhat's missing is the engine: ", options: { color: C.offWhite } },
    { text: "a managed, rewarded, continuous program", options: { bold: true, color: C.accentLt } },
    { text: " that turns external researcher talent into a force multiplier — before the next audit cycle.", options: { color: C.offWhite } },
  ], {
    x: 5.23, y: 2.1, w: 4.1, h: 2.0,
    fontSize: 12.5, fontFace: "Calibri", margin: 0,
  });

  s.addText("\"The £29M fine wasn't a breach —\nit was a misconfiguration that\npersisted unnoticed. That's exactly\nwhat bug bounty catches first.\"", {
    x: 5.23, y: 4.1, w: 4.0, h: 0.95,
    fontSize: 11, fontFace: "Georgia", color: C.accentLt,
    italic: true, margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — THE SECURITY GAP (continuous vs point-in-time)
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);
  slideLabel(s, "The Problem");
  slideTitle(s, "Pentests Protect the Audit. Bug Bounty Protects Everything Else.");
  divider(s, 1.28);

  // Left card: Pentest
  addCard(s, 0.45, 1.45, 4.25, 3.75, { color: C.cardBg });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 1.45, w: 4.25, h: 0.5,
    fill: { color: "1E293B" }, line: { color: "1E293B", width: 0 },
  });
  s.addText("TRADITIONAL PENTEST", {
    x: 0.55, y: 1.52, w: 4.0, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: C.gray,
    bold: true, charSpacing: 2, margin: 0,
  });

  const pentestRows = [
    ["Timing", "Point-in-time snapshot"],
    ["Coverage", "1–2 consultants"],
    ["Attack surface", "Fixed, agreed scope"],
    ["Findings speed", "Report in 4–8 weeks"],
    ["Between audits", "Blind spot"],
    ["Cost model", "Day rate × days"],
    ["FCA compliance", "Audit checkbox ✓"],
  ];

  pentestRows.forEach(([label, val], i) => {
    const yRow = 2.1 + i * 0.43;
    s.addText(label, {
      x: 0.6, y: yRow, w: 1.7, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: C.gray, margin: 0,
    });
    s.addText(val, {
      x: 2.35, y: yRow, w: 2.2, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: C.offWhite, margin: 0,
    });
  });

  // Right card: Bug Bounty
  addCard(s, 5.0, 1.45, 4.55, 3.75, { color: C.cardBg2, border: C.accent, borderWidth: 1.0 });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 1.45, w: 4.55, h: 0.5,
    fill: { color: C.accent, transparency: 20 }, line: { color: C.accent, width: 0 },
  });
  s.addText("INTIGRITI BUG BOUNTY", {
    x: 5.15, y: 1.52, w: 4.2, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: C.white,
    bold: true, charSpacing: 2, margin: 0,
  });

  const bountyRows = [
    ["Timing",        "Continuous, always-on", C.green],
    ["Coverage",      "70,000+ researchers", C.green],
    ["Attack surface","Evolves with your product", C.green],
    ["Findings speed","24–48hr validated report", C.green],
    ["Between audits","Full coverage", C.green],
    ["Cost model",    "Pay only for valid bugs", C.green],
    ["FCA compliance","Proactive + audit ✓✓", C.green],
  ];

  bountyRows.forEach(([label, val, col], i) => {
    const yRow = 2.1 + i * 0.43;
    s.addText(label, {
      x: 5.15, y: yRow, w: 1.7, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: C.gray, margin: 0,
    });
    s.addText(val, {
      x: 6.9, y: yRow, w: 2.45, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: col || C.offWhite,
      bold: !!col, margin: 0,
    });
  });

  // VS divider
  s.addText("VS", {
    x: 4.5, y: 3.1, w: 0.55, h: 0.55,
    fontSize: 14, fontFace: "Georgia", color: C.gray,
    bold: true, align: "center", valign: "middle", margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — THE INTIGRITI PLATFORM (3 pillars)
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);
  slideLabel(s, "The Platform");
  slideTitle(s, "Three Pillars That Set Us Apart");
  divider(s, 1.28);

  const pillars = [
    {
      num: "01",
      title: "70,000+\nEthical Hackers",
      body: "Europe's largest researcher community. Continuous coverage across web, API, mobile, and cloud — not 2 consultants for 5 days.",
      stat: "24–48hr",
      statLabel: "median time to\nvalidated finding",
      color: C.accent,
    },
    {
      num: "02",
      title: "Managed\nTriage Layer",
      body: "Your team only sees validated, severity-rated bugs. Researchers get paid only for confirmed findings. Zero noise in your queue.",
      stat: "0",
      statLabel: "unvalidated reports\nreach your team",
      color: C.accentLt,
    },
    {
      num: "03",
      title: "European\nData Residency",
      body: "GDPR-compliant by design. All data stays in the EU. Built for FCA-regulated financial services — not retrofitted.",
      stat: "GDPR",
      statLabel: "native compliance\nFCA-aligned",
      color: C.green,
    },
  ];

  pillars.forEach((p, i) => {
    const x = 0.45 + i * 3.2;

    // Card
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.45, w: 2.95, h: 4.0,
      fill: { color: C.cardBg },
      line: { color: p.color, width: 0.75 },
      shadow: makeShadow(),
    });

    // Top accent band
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.45, w: 2.95, h: 0.08,
      fill: { color: p.color }, line: { color: p.color, width: 0 },
    });

    // Pillar number
    s.addText(p.num, {
      x: x + 0.2, y: 1.65, w: 1.0, h: 0.45,
      fontSize: 28, fontFace: "Georgia", color: p.color,
      bold: true, margin: 0,
    });

    // Title
    s.addText(p.title, {
      x: x + 0.2, y: 2.15, w: 2.5, h: 0.8,
      fontSize: 16, fontFace: "Georgia", color: C.white,
      bold: true, margin: 0,
    });

    // Body
    s.addText(p.body, {
      x: x + 0.2, y: 3.05, w: 2.55, h: 1.3,
      fontSize: 11, fontFace: "Calibri", color: C.offWhite,
      margin: 0,
    });

    // Stat box
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: 4.45, w: 2.55, h: 0.75,
      fill: { color: C.darkBg },
      line: { color: p.color, width: 0.5 },
    });
    s.addText(p.stat, {
      x: x + 0.2, y: 4.5, w: 2.55, h: 0.35,
      fontSize: 18, fontFace: "Georgia", color: p.color,
      bold: true, align: "center", margin: 0,
    });
    s.addText(p.statLabel, {
      x: x + 0.2, y: 4.85, w: 2.55, h: 0.32,
      fontSize: 8.5, fontFace: "Calibri", color: C.gray,
      align: "center", margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — ROI: THE NUMBERS
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);
  slideLabel(s, "Return on Investment");
  slideTitle(s, "The Math Doesn't Need a Sales Pitch");
  divider(s, 1.28);

  // Big stat callouts (3 across)
  const stats = [
    { val: "$4.88M",  label: "Average cost of\na data breach (2024)",       sub: "IBM Security Report", col: C.red },
    { val: "~$6K",    label: "Average bounty for\na critical vulnerability",  sub: "Intigriti platform data",    col: C.gold },
    { val: "$84K",    label: "Average annual cost\nof a managed program",      sub: "vs $456K+ for equiv. staff", col: C.green },
  ];

  stats.forEach((st, i) => {
    const x = 0.45 + i * 3.2;
    addCard(s, x, 1.5, 2.95, 2.5, { color: C.cardBg });

    s.addText(st.val, {
      x, y: 1.7, w: 2.95, h: 1.0,
      fontSize: 48, fontFace: "Georgia", color: st.col,
      bold: true, align: "center", margin: 0,
    });
    s.addText(st.label, {
      x: x + 0.15, y: 2.75, w: 2.65, h: 0.6,
      fontSize: 12, fontFace: "Calibri", color: C.offWhite,
      align: "center", margin: 0,
    });
    s.addText(st.sub, {
      x: x + 0.15, y: 3.38, w: 2.65, h: 0.3,
      fontSize: 9, fontFace: "Calibri", color: C.gray,
      align: "center", italic: true, margin: 0,
    });
  });

  // Bottom callout bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 4.2, w: 9.1, h: 1.0,
    fill: { color: C.accent, transparency: 15 },
    line: { color: C.accent, width: 0.75 },
    shadow: makeShadow(),
  });

  s.addText([
    { text: "Retail customer case study: ", options: { bold: true, color: C.white } },
    { text: "€12K bounty budget invested over 2 years → ", options: { color: C.offWhite } },
    { text: "multiple critical vulnerabilities found", options: { bold: true, color: C.accentLt } },
    { text: " that could have led to millions in breach costs.", options: { color: C.offWhite } },
    { text: "  Average data breach in financial services: ", options: { color: C.offWhite } },
    { text: ">€4.7M.", options: { bold: true, color: C.red } },
  ], {
    x: 0.65, y: 4.3, w: 8.7, h: 0.8,
    fontSize: 13, fontFace: "Calibri", align: "left", margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — BUILT FOR UK FINTECH
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);
  slideLabel(s, "Industry Fit");
  slideTitle(s, "Purpose-Built for FCA-Regulated Financial Services");
  divider(s, 1.28);

  const reasons = [
    {
      title: "European Data Residency",
      body: "All program data stays within the EU. No cross-border data transfer concerns for FCA/PRA-regulated institutions. GDPR-native, not retrofitted.",
      icon: "🇪🇺",
    },
    {
      title: "FCA Vulnerability Disclosure Alignment",
      body: "Bug bounty directly supports FCA PS21/3 operational resilience requirements. Demonstrates proactive threat identification — not just reactive incident response.",
      icon: "⚖️",
    },
    {
      title: "Monzo Is Already Running Publicly",
      body: "Starling's direct competitor just launched a public bug bounty. When the category leader goes public, the question becomes: what does it look like when you don't have one?",
      icon: "🏦",
    },
    {
      title: "Scaling Attack Surface Demands Continuous Coverage",
      body: "4.6M accounts, Engine by Starling APIs, third-party integrations. Every release cycle adds new surface. Quarterly pentests can't keep pace.",
      icon: "📈",
    },
  ];

  reasons.forEach((r, i) => {
    const col = i % 2 === 0 ? 0.45 : 5.1;
    const row = i < 2 ? 0 : 1;
    const y = 1.5 + row * 2.05;
    const w = 4.4;
    const h = 1.85;

    addCard(s, col, y, w, h, { color: C.cardBg });
    accentBar(s, col, y, h);

    s.addText(r.icon + "  " + r.title, {
      x: col + 0.25, y: y + 0.18, w: w - 0.35, h: 0.42,
      fontSize: 13, fontFace: "Georgia", color: C.accentLt,
      bold: true, margin: 0,
    });
    s.addText(r.body, {
      x: col + 0.25, y: y + 0.65, w: w - 0.35, h: 1.05,
      fontSize: 11, fontFace: "Calibri", color: C.offWhite,
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — YOUR JOURNEY WITH INTIGRITI (3-phase roadmap)
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);
  slideLabel(s, "Your Path Forward");
  slideTitle(s, "A Journey, Not a Switch — Start Controlled, Scale With Confidence");
  divider(s, 1.28);

  const phases = [
    {
      phase: "Phase 1",
      title: "Managed\nPrivate Program",
      timeline: "Month 1–3",
      items: [
        "Scope defined by your team (Alex drives this)",
        "Invite-only curated researcher pool",
        "Pre-production and selected prod APIs",
        "Managed triage: Sam's team sees only validated bugs",
        "Learn the researcher community before going wider",
      ],
      color: C.accent,
      badge: "WHERE YOU START",
    },
    {
      phase: "Phase 2",
      title: "Expanded\nPrivate Program",
      timeline: "Month 4–9",
      items: [
        "Scope expands based on Phase 1 learnings",
        "Larger, rated researcher pool",
        "Production systems with confidence",
        "Bug bounty becomes part of SDLC",
        "FCA can see active, continuous testing",
      ],
      color: C.accentLt,
      badge: "BUILD MOMENTUM",
    },
    {
      phase: "Phase 3",
      title: "Public\nBug Bounty",
      timeline: "Month 10+",
      items: [
        "Public program signals security leadership",
        "Monzo-level external confidence signal",
        "Full researcher community engagement",
        "Ongoing researcher recognition & rewards",
        "Category differentiation vs. competitors",
      ],
      color: C.green,
      badge: "CATEGORY LEADER",
    },
  ];

  // Arrow connectors
  [0, 1].forEach(i => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 3.35 + i * 3.2, y: 2.95, w: 0.3, h: 0.06,
      fill: { color: C.gray }, line: { color: C.gray, width: 0 },
    });
  });

  phases.forEach((ph, i) => {
    const x = 0.45 + i * 3.2;

    addCard(s, x, 1.45, 2.9, 4.0, { color: C.cardBg, border: ph.color, borderWidth: 0.75 });

    // Phase header band
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.45, w: 2.9, h: 0.55,
      fill: { color: ph.color, transparency: i === 0 ? 0 : 35 },
      line: { color: ph.color, width: 0 },
    });

    s.addText(ph.phase.toUpperCase(), {
      x: x + 0.15, y: 1.52, w: 1.5, h: 0.35,
      fontSize: 10, fontFace: "Calibri", color: C.white,
      bold: true, charSpacing: 2, margin: 0,
    });
    s.addText(ph.timeline, {
      x: x + 1.55, y: 1.52, w: 1.2, h: 0.35,
      fontSize: 10, fontFace: "Calibri", color: C.white,
      align: "right", margin: 0,
    });

    // Title
    s.addText(ph.title, {
      x: x + 0.15, y: 2.1, w: 2.6, h: 0.7,
      fontSize: 16, fontFace: "Georgia", color: C.white,
      bold: true, margin: 0,
    });

    // Items
    ph.items.forEach((item, j) => {
      s.addText([
        { text: "›  ", options: { color: ph.color, bold: true } },
        { text: item, options: { color: C.offWhite } },
      ], {
        x: x + 0.15, y: 2.9 + j * 0.44, w: 2.6, h: 0.38,
        fontSize: 10.5, fontFace: "Calibri", margin: 0,
      });
    });

    // Badge
    if (i === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.55, y: 5.15, w: 1.85, h: 0.28,
        fill: { color: ph.color }, line: { color: ph.color, width: 0 },
      });
      s.addText(ph.badge, {
        x: x + 0.55, y: 5.15, w: 1.85, h: 0.28,
        fontSize: 8, fontFace: "Calibri", color: C.white,
        bold: true, align: "center", charSpacing: 1, margin: 0,
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — CLOSE / NEXT STEP
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkSlide(s);

  // Full left stripe
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.35, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent, width: 0 },
  });

  // Subtle bg shape
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 0, w: 4.5, h: 5.625,
    fill: { color: C.accent, transparency: 90 },
    line: { color: C.accent, width: 0 },
  });

  // Label
  s.addText("THE ASK", {
    x: 0.65, y: 0.55, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: C.accentLt,
    bold: true, charSpacing: 4, margin: 0,
  });

  // Main headline
  s.addText("Let's Scope\nYour Program.", {
    x: 0.65, y: 0.95, w: 5.5, h: 1.6,
    fontSize: 42, fontFace: "Georgia",
    color: C.white, bold: true, margin: 0,
  });

  // Subtext
  s.addText("No commitment. No budget required.", {
    x: 0.65, y: 2.65, w: 5.5, h: 0.38,
    fontSize: 16, fontFace: "Calibri", color: C.accentLt,
    bold: true, margin: 0,
  });

  // The offer
  addCard(s, 0.65, 3.15, 5.6, 1.9, { color: C.cardBg, border: C.accent, borderWidth: 1.0 });

  s.addText("Free 45-Minute Scoping Call", {
    x: 0.85, y: 3.3, w: 5.1, h: 0.4,
    fontSize: 17, fontFace: "Georgia", color: C.white,
    bold: true, margin: 0,
  });

  const scopingItems = [
    "Model cost-per-bug specific to Starling's attack surface",
    "Define what Phase 1 scope looks like (Alex leads this)",
    "Produce a custom ROI model to take to your CFO",
  ];
  scopingItems.forEach((item, i) => {
    s.addText([
      { text: "›  ", options: { color: C.accent, bold: true } },
      { text: item, options: { color: C.offWhite } },
    ], {
      x: 0.85, y: 3.8 + i * 0.37, w: 5.2, h: 0.32,
      fontSize: 11.5, fontFace: "Calibri", margin: 0,
    });
  });

  // Right side: recap pain → gain
  s.addText("What you told us you need:", {
    x: 6.3, y: 0.85, w: 3.5, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: C.gray,
    italic: true, margin: 0,
  });

  const recaps = [
    { pain: "FCA compliance pressure",      gain: "Proactive coverage + audit evidence" },
    { pain: "Triage noise concerns",         gain: "Validated-only queue for Sam's team" },
    { pain: "Scope control for production",  gain: "Alex-defined, invite-only to start" },
  ];

  recaps.forEach((r, i) => {
    const y = 1.3 + i * 1.05;
    addCard(s, 6.3, y, 3.45, 0.9, { color: C.cardBg2, border: C.accentLt, borderWidth: 0.4 });
    s.addText(r.pain, {
      x: 6.45, y: y + 0.08, w: 3.1, h: 0.3,
      fontSize: 10.5, fontFace: "Calibri", color: C.red,
      bold: true, margin: 0,
    });
    s.addText("→ " + r.gain, {
      x: 6.45, y: y + 0.45, w: 3.1, h: 0.35,
      fontSize: 10.5, fontFace: "Calibri", color: C.green,
      margin: 0,
    });
  });

  // Footer CTA
  s.addText("intigriti.com", {
    x: 0.65, y: 5.2, w: 9, h: 0.22,
    fontSize: 9, fontFace: "Calibri", color: C.gray,
    align: "center", margin: 0,
  });
}

// ─── WRITE ───────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "intigriti-starling-pitch.pptx" })
  .then(() => console.log("✓ intigriti-starling-pitch.pptx written"))
  .catch(err => { console.error(err); process.exit(1); });
