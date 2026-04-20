---
name: interview-prep
description: Comprehensive job interview preparation through company research, role analysis, and personalized interview strategy development. Use when the user requests help preparing for a job interview, needs company research for interview prep, asks for interview questions and answers, or provides a job description and company name for interview preparation. Automatically includes personalized talking points based on the candidate's sales background and generates both Word document and markdown outputs.
---

# Interview Preparation Skill

## Overview

Conduct comprehensive interview preparation research and create detailed prep documents for job interviews. This skill researches the company, analyzes the role, generates personalized talking points, and produces interview questions with suggested answers aligned to sales methodologies (MEDDPICC, value selling).

## Workflow

### Step 1: Load Candidate Background

**ALWAYS start by loading the candidate's background:**

```bash
view references/candidate_background.md
```

This provides the professional context needed to personalize all talking points and responses.

### Step 2: Gather Interview Information

Collect the following from the user:
1. **Company name** - The organization they're interviewing with
2. **Job description or role title** - The position they're applying for
3. **Interviewer information** (optional) - LinkedIn profiles or names of hiring managers

If the user provides a document with interview details (like hiring manager notes), incorporate that information into the research.

### Step 3: Company Deep Dive Research

Conduct comprehensive research on the company using web_search and web_fetch:

**Required Research Areas:**

1. **Company Overview**
   - Business model and revenue streams
   - Products and services
   - Target market and customer segments
   - Company size, locations, and structure
   - Recent funding, acquisitions, or significant events

2. **Financial & Growth Metrics**
   - Revenue and growth trajectory
   - Funding history and investors
   - Public/private status
   - Market position and market share

3. **Competitive Landscape**
   - Direct competitors
   - Competitive advantages and differentiators
   - Market positioning
   - Industry trends affecting the space

4. **Recent News & Developments**
   - Product launches
   - Strategic partnerships
   - Leadership changes
   - Press releases and announcements (last 6 months)

5. **Culture & Values**
   - Mission and values
   - Work environment and culture indicators
   - Employee reviews (Glassdoor, etc.)
   - Diversity and inclusion initiatives

**Research Strategy:**
- Use 5-10 web searches to gather comprehensive information
- Prioritize official sources (company website, investor docs, press releases)
- Include recent news articles and industry analysis
- Search for "<company name> competitors" and "<company name> vs <competitor>"

### Step 4: Role Analysis

Analyze the job description thoroughly:

1. **Key Responsibilities**
   - Primary duties and expectations
   - Success metrics and KPIs
   - Territory or account details (if applicable)

2. **Required Qualifications**
   - Must-have skills and experience
   - Nice-to-have qualifications
   - Technical requirements

3. **Sales Methodology Alignment**
   - Identify which aspects of MEDDPICC are most relevant
   - Note prospecting requirements (hunter vs. farmer)
   - Team selling requirements
   - Deal complexity indicators

4. **Quota and Compensation**
   - Quota expectations (if provided)
   - Commission structure (if mentioned)
   - Territory size and account distribution

### Step 5: Interviewer Research

If interviewer LinkedIn profiles are provided:

1. **Use web_fetch to access the LinkedIn profile**
2. **Extract key information:**
   - Current role and tenure
   - Career background
   - Education
   - Shared connections or interests
   - Recent posts or activity (if accessible)

3. **Identify connection points:**
   - Shared background or experiences
   - Similar career paths
   - Common interests or groups

### Step 6: Load Sales Methodologies

```bash
view references/sales_methodologies.md
```

Use this to frame interview responses and talking points using proven sales frameworks.

### Step 7: Create Personalized Interview Prep Document

Generate a comprehensive document with the following structure:

---

## Document Structure

### 1. Executive Summary
- Company name and interview role
- Interview date (if known)
- Interviewer names
- Key preparation priorities (3-5 bullets)

### 2. Company Deep Dive

#### Company Overview
- Business model and value proposition
- Products and services
- Target market and customers
- Size, locations, and key facts

#### Financial & Growth
- Revenue and funding information
- Growth trajectory and milestones
- Market position

#### Competitive Landscape
- Key competitors and how they compare
- Unique differentiators
- Market trends and opportunities

#### Recent News & Developments
- Last 6 months of significant news
- Product launches and partnerships
- Strategic initiatives

#### Culture & Values
- Mission and core values
- Work environment insights
- Employee perspectives

### 3. Role Analysis

#### Position Overview
- Role title and level
- Team structure and reporting line
- Territory/segment details

#### Key Responsibilities
- Primary duties (with priority ranking)
- Success metrics and KPIs
- Quota and performance expectations

#### Required Qualifications
- Must-have skills and experience (map to candidate's background)
- Preferred qualifications
- Technical requirements

#### Sales Methodology Fit
- MEDDPICC application to this role
- Prospecting expectations (% new logos vs. expansion)
- Team selling requirements
- Deal complexity and cycle length

### 4. Personalized Talking Points

**Map the candidate's experience to role requirements:**

For each key requirement or responsibility, create a talking point that:
1. References specific experience from candidate background
2. Includes quantifiable results
3. Demonstrates relevant methodology (MEDDPICC, value selling, etc.)
4. Shows cultural fit

**Example Format:**
"When asked about [requirement], emphasize your experience at [company] where you [specific achievement with metrics]. This demonstrates your ability to [relevant skill] which directly aligns with their need for [role requirement]."

### 5. Interview Questions & Suggested Answers

Generate 15-20 anticipated interview questions across these categories:

#### Background & Experience
- "Walk me through your background"
- "Why are you interested in [company]?"
- "Why now?"

#### Behavioral Questions (STAR format answers)
- Prospecting and new business development
- Team selling and cross-functional collaboration
- Value selling and ROI conversations
- Objection handling and resilience
- Coachability and learning from failure
- Driving urgency in deals

#### Role-Specific Questions
- Questions about quota attainment and metrics
- Questions about specific tools or methodologies
- Questions about deal examples
- Questions about territory management

#### Company-Specific Questions
- Why this company specifically?
- What do you know about our products/competitors?
- How would you approach this territory/segment?

**Answer Format for Each Question:**
- **Question:** [The anticipated question]
- **Suggested Answer:** [2-3 paragraph answer using STAR format where appropriate]
- **Key Points to Emphasize:** [3-5 bullet points]
- **Metrics to Reference:** [Specific numbers from candidate background]

### 6. Questions to Ask Interviewers

Provide 15-20 thoughtful questions organized by interview stage:

#### First Round / Recruiter
- Role clarity and expectations
- Team structure and growth
- Interview process and timeline

#### Hiring Manager Round
- Success metrics and performance expectations
- Team dynamics and support
- Leadership style and philosophy
- Challenges and opportunities in the role
- Top performer characteristics

#### Panel / Peer Interviews
- Day-to-day responsibilities
- Collaboration and resources
- What they love about the company/team

#### Final Round / Executive
- Company vision and strategy
- Growth trajectory and market position
- Team investment and development

### 7. Interviewer Background

For each interviewer:
- Name and title
- Background summary
- Career path highlights
- Potential connection points
- Conversation topics or interests
- LinkedIn profile link

### 8. Key Takeaways & Preparation Checklist

- Top 5 things to remember
- Top 3 differentiators to emphasize
- Red flags to watch for
- Pre-interview checklist
- Day-of reminders

---

### Step 8: Generate Both Output Formats

Create two files:

1. **Word Document (.docx):**
   - Professional formatting with headers
   - Table of contents
   - Proper spacing and readability
   - Save to `/mnt/user-data/outputs/`

2. **Markdown File (.md):**
   - Clean markdown formatting
   - Clickable table of contents
   - Same content as Word doc
   - Save to `/mnt/user-data/outputs/`

Both files should be named: `Interview_Prep_[Company]_[Role].docx` and `Interview_Prep_[Company]_[Role].md`

### Step 9: Present Files to User

Use the present_files tool to share both documents with the user.

## Best Practices

### Research Quality
- Use 8-12 web searches minimum for comprehensive research
- Prioritize recent information (last 6-12 months)
- Include both official sources and third-party analysis
- Verify important facts across multiple sources

### Personalization Depth
- Every talking point should reference specific candidate experience
- Include actual metrics and results from past roles
- Map methodologies (MEDDPICC) to specific examples
- Show clear connection between past success and future role

### Answer Quality
- Use STAR format (Situation, Task, Action, Result) for behavioral questions
- Keep answers concise but substantive (2-3 paragraphs)
- Include specific metrics and outcomes
- Demonstrate self-awareness and growth mindset

### Professional Presentation
- Use clear headings and hierarchy
- Include page numbers and table of contents
- Ensure consistent formatting throughout
- Proofread for errors and clarity

## References

- **candidate_background.md**: Candidate's professional experience and achievements
- **sales_methodologies.md**: MEDDPICC, value selling, and other sales frameworks
