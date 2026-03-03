# Resume Scoring & Job Search Agent

An intelligent agent system that compares your resume to job postings, searches multiple job boards, and ranks opportunities by match quality.

## Features

### 🎯 Resume Scoring Engine
- **Multi-criteria analysis**: Skills, experience, education, keywords
- **Weighted scoring algorithm**: Prioritizes most important factors
- **ATS optimization**: Ensures resume passes Applicant Tracking Systems
- **Actionable recommendations**: Specific improvements to increase match scores

### 🔍 Job Board Integration
- **Multi-board search**: LinkedIn, Indeed, Glassdoor, ZipRecruiter, Monster
- **Automated scoring**: Each job analyzed against your resume
- **Smart ranking**: Jobs sorted by compatibility
- **Batch processing**: Score hundreds of jobs in minutes

### 📊 Intelligent Analysis
- **Score breakdown**: See exactly where you match (or don't)
- **Missing skills detection**: Identify gaps in your qualifications
- **Critical requirements**: Highlights must-have vs nice-to-have skills
- **Match quality grouping**: Excellent/Good/Moderate/Poor categories

## Quick Start

### Installation

```bash
npm install
```

### Basic Usage

```typescript
import { ResumeScorerAgent } from './src/agents/resume-scorer';
import { readFileSync } from 'fs';

const agent = new ResumeScorerAgent();
const resumeText = readFileSync('./my-resume.txt', 'utf-8');

const jobPosting = {
  title: 'Senior Software Engineer',
  description: 'We need a React and Node.js expert with 5+ years experience...',
  requirements: ['React', 'Node.js', 'TypeScript', 'AWS'],
};

const result = await agent.scoreResume(resumeText, jobPosting);

console.log(`Match Score: ${result.overallScore}/100`);
console.log('Recommendations:', result.recommendations);
```

### Job Board Search & Ranking

```typescript
import { JobBoardScraperAgent } from './src/agents/job-board-scraper';

const agent = new JobBoardScraperAgent();
const resumeText = readFileSync('./my-resume.txt', 'utf-8');

// Search and automatically rank jobs
const rankedJobs = await agent.searchScoreAndRank(resumeText, {
  keywords: 'Senior Full Stack Engineer',
  location: 'Remote',
  remote: true,
  minScore: 60,
  maxResults: 20,
});

// View top matches
rankedJobs.slice(0, 5).forEach(job => {
  console.log(`${job.rank}. ${job.title} - ${job.company}`);
  console.log(`   Score: ${job.score.overallScore}/100`);
  console.log(`   ${job.url}`);
});
```

## Architecture

### Components

```
src/agents/
├── resume-scorer.ts         # Core scoring engine
└── job-board-scraper.ts     # Job board integration & ranking

examples/
├── resume-scorer-example.ts       # Basic scoring examples
└── job-board-scraper-example.ts   # Job search & ranking examples

tests/
└── resume-scorer.test.ts    # Unit tests

docs/
├── resume-scorer-guide.md   # Detailed user guide
└── JOB-SEARCH-AGENT-README.md  # This file
```

### Scoring Algorithm

The agent uses a weighted scoring system:

```
Overall Score =
  Skills Match (35%) +
  Experience Match (30%) +
  Education Match (15%) +
  Keyword Match (20%)
```

Each category is scored 0-100 based on:
- **Skills**: Percentage of required skills present in resume
- **Experience**: Years required + relevance of past roles
- **Education**: Degree requirements met
- **Keywords**: Density of job-specific terminology

### Match Quality Ranges

| Score | Quality | Recommendation |
|-------|---------|----------------|
| 80-100 | 🟢 Excellent | Apply immediately with confidence |
| 60-79 | 🟡 Good | Tailor resume and apply |
| 40-59 | 🟠 Moderate | Significant customization needed |
| 0-39 | 🔴 Poor | Consider if role is appropriate fit |

## Use Cases

### 1. Single Job Analysis

Perfect for analyzing a specific job you're interested in:

```typescript
const result = await agent.scoreResume(resumeText, jobPosting);

// Get detailed breakdown
console.log('Skills:', result.breakdown.skillsMatch);
console.log('Experience:', result.breakdown.experienceMatch);
console.log('Missing:', result.missingItems.preferredSkills);
```

### 2. Batch Job Comparison

Compare multiple opportunities to find the best fit:

```typescript
const jobs = [job1, job2, job3];
const results = await agent.scoreBatch(resumeText, jobs);

// Results sorted by score
results.forEach(r => {
  console.log(`${r.jobTitle}: ${r.overallScore}/100`);
});
```

### 3. Resume Optimization

Test resume changes to improve scores:

```typescript
const v1Score = await agent.scoreResume(originalResume, job);
const v2Score = await agent.scoreResume(updatedResume, job);

console.log(`Improvement: +${v2Score.overallScore - v1Score.overallScore} points`);
```

### 4. Job Market Research

Understand which jobs you're most qualified for:

```typescript
const rankedJobs = await scraper.searchScoreAndRank(resume, {
  keywords: 'Software Engineer',
  maxResults: 100,
});

const grouped = scraper.groupByScoreRange(rankedJobs);
console.log(`Excellent matches: ${grouped.excellent.length}`);
console.log(`Good matches: ${grouped.good.length}`);
```

## Resume Format Tips

### ✅ Do's

```
SKILLS
- JavaScript, TypeScript, Python
- React, Node.js, Express
- AWS, Docker, Kubernetes

EXPERIENCE
Senior Software Engineer | Company | 2020-Present
- Built microservices handling 1M requests/day
- Led team of 5 developers
- Improved performance by 60%

EDUCATION
Bachelor of Science in Computer Science
University Name | 2016-2020
```

### ❌ Don'ts

```
╔══════════════════════╗
║ My Creative Skills  ║
╚══════════════════════╝

⭐ JavaScript wizard
🚀 React enthusiast

[Tables, graphics, and special characters hurt ATS parsing]
```

### Best Practices

1. **Use standard headers**: SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS
2. **Keep lines under 100 characters** for ATS compatibility
3. **Include keywords naturally** from job descriptions
4. **Quantify achievements** with numbers and percentages
5. **Avoid special characters** (│, ╔, ═, etc.)

## API Reference

### ResumeScorerAgent

#### `scoreResume(resumeText, jobPosting): Promise<ScoringResult>`

Scores a resume against a single job posting.

**Parameters:**
- `resumeText` (string): Full text of resume
- `jobPosting` (object): Job posting with title, description, requirements

**Returns:** ScoringResult object with:
- `overallScore`: Overall match score (0-100)
- `breakdown`: Category-specific scores
- `matchedItems`: Lists of matched skills/experience/etc
- `missingItems`: Lists of missing qualifications
- `recommendations`: Actionable improvement suggestions
- `atsOptimizationScore`: ATS compatibility score

#### `scoreBatch(resumeText, jobPostings): Promise<ScoringResult[]>`

Scores resume against multiple job postings.

**Returns:** Array of ScoringResults sorted by score (highest first)

### JobBoardScraperAgent

#### `searchScoreAndRank(resumeText, searchParams, options)`

Complete workflow: search job boards, score each job, return ranked list.

**Parameters:**
- `resumeText` (string): Full text of resume
- `searchParams` (object):
  - `keywords` (string): Job title or skills
  - `location` (string): Location or "Remote"
  - `remote` (boolean): Filter for remote jobs
  - `experienceLevel`: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  - `maxResults` (number): Max jobs to return
- `options` (object):
  - `minScore` (number): Minimum match score (0-100)
  - `maxResults` (number): Limit results
  - `usePublicFeeds` (boolean): Use RSS feeds instead of APIs

**Returns:** Array of RankedJob objects sorted by score

#### `filterByScore(rankedJobs, minScore)`

Filter jobs by minimum score threshold.

#### `groupByScoreRange(rankedJobs)`

Group jobs into excellent/good/moderate/poor categories.

#### `generateReport(rankedJobs): string`

Generate formatted text summary of search results.

## Job Board Integration

### Supported Boards

- **LinkedIn**: Largest professional network, best for senior roles
- **Indeed**: Highest volume, good for all levels
- **Glassdoor**: Company reviews + jobs, good for research
- **ZipRecruiter**: AI-powered matching, fast applications
- **Monster**: Traditional job board, broad coverage

### API Requirements

To use real job board data, you need API keys:

1. **Indeed**: [Apply for publisher account](https://www.indeed.com/publisher)
2. **LinkedIn**: [Developer program](https://developer.linkedin.com/)
3. **ZipRecruiter**: [Partner program](https://www.ziprecruiter.com/partner)

### Alternative: Public RSS Feeds

Many job boards offer RSS feeds for search results:

```typescript
const rssSources = [
  `https://www.indeed.com/rss?q=${keywords}&l=${location}`,
  // Add more feeds
];
```

**Benefits:**
- No API keys required
- Free to use
- Real-time updates

**Limitations:**
- Less structured data
- Rate limiting
- No advanced filtering

## Examples

### Example 1: Find Best Job Matches

```bash
npm run example:job-search
```

Searches job boards and shows your top 10 matches with detailed scoring.

### Example 2: Optimize Resume

```bash
npm run example:resume-optimize
```

Tests different resume versions to see which scores higher.

### Example 3: Market Analysis

```bash
npm run example:market-analysis
```

Analyzes 100+ jobs to show where you're most competitive.

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Limitations & Disclaimers

### Current Limitations

1. **Text-based analysis only**: Cannot parse PDF/DOCX directly (convert to text first)
2. **English language**: Optimized for English resumes and jobs
3. **Keyword matching**: Uses predefined skill lists, may miss niche technologies
4. **No semantic understanding**: Cannot assess quality of achievements
5. **API dependencies**: Job board integration requires API access

### Legal Considerations

- **Respect terms of service**: Check each job board's policies
- **Rate limiting**: Don't overload job board servers
- **robots.txt**: Honor scraping restrictions
- **Privacy**: Don't store or share user data without consent

### Accuracy Notes

- Scores are **estimates** based on keyword matching
- **Human review is essential**: Don't rely solely on scores
- **Context matters**: Agent can't assess soft skills or culture fit
- **Job descriptions vary**: Same role may be described differently

## Roadmap

### Planned Features

- [ ] PDF/DOCX resume parsing
- [ ] Machine learning-based scoring
- [ ] Salary range estimation
- [ ] Company culture fit analysis
- [ ] Interview question prediction
- [ ] Application tracking
- [ ] Email notifications for new matches
- [ ] Browser extension for one-click scoring
- [ ] Mobile app

### Integration Opportunities

- [ ] LinkedIn profile import
- [ ] ATS system integration (Greenhouse, Lever)
- [ ] Calendar integration for interview scheduling
- [ ] CRM for application tracking
- [ ] Analytics dashboard

## Contributing

Contributions welcome! Areas for improvement:

1. **Additional job boards**: Add more data sources
2. **Better parsing**: Improve resume/job description extraction
3. **ML models**: Train models for better scoring
4. **UI/UX**: Build web interface or CLI tool
5. **Documentation**: More examples and guides

## FAQ

**Q: Why am I getting low scores for jobs I'm qualified for?**
A: The agent uses keyword matching. Make sure your resume includes exact terms from the job description.

**Q: How accurate are the scores?**
A: Scores are estimates. Use them as a guide, not absolute truth. Always apply human judgment.

**Q: Can I customize the scoring weights?**
A: Yes! Edit the weights in `resume-scorer.ts` (currently 35% skills, 30% experience, 15% education, 20% keywords).

**Q: Do I need API keys to use this?**
A: Not for basic resume scoring. Job board search requires API keys or uses public RSS feeds.

**Q: Is this legal?**
A: Resume scoring is legal. For job scraping, check terms of service and use official APIs when possible.

**Q: Can this help me cheat or lie on my resume?**
A: No. This tool helps you present your **real** qualifications effectively. Never lie on your resume.

## Support

- **Documentation**: See `/docs/resume-scorer-guide.md` for detailed guide
- **Examples**: Check `/examples/` folder for code samples
- **Issues**: Report bugs via GitHub issues
- **Questions**: Open a discussion on GitHub

## License

MIT License - See LICENSE file

## Acknowledgments

Built with:
- TypeScript for type safety
- Zod for input validation
- Jest for testing
- Node.js for runtime

Inspired by job search challenges and the need for data-driven career decisions.

---

**Remember**: This tool is a **helper**, not a replacement for human judgment. Use it to optimize your job search, but always apply critical thinking and personal assessment when evaluating opportunities.

Good luck with your job search! 🚀
