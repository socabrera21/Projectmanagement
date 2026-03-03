# Resume Scorer Agent - User Guide

## Overview

The Resume Scorer Agent analyzes your resume against job postings and provides:
- Overall match score (0-100)
- Detailed breakdown by category (skills, experience, education, keywords)
- List of matched and missing items
- ATS (Applicant Tracking System) optimization score
- Actionable recommendations for improvement

## Features

### Multi-Criteria Scoring
- **Skills Match (35% weight)**: Technical and soft skills alignment
- **Experience Match (30% weight)**: Years and relevance of experience
- **Education Match (15% weight)**: Degree requirements
- **Keyword Match (20% weight)**: Job-specific terminology

### ATS Optimization
- Checks for ATS-friendly formatting
- Identifies problematic special characters
- Validates standard section headers
- Analyzes keyword density

### Actionable Insights
- Critical missing skills highlighted
- Specific improvement recommendations
- Match quality assessment (Strong/Moderate/Low)

## Usage

### Basic Usage

```typescript
import { ResumeScorerAgent } from './agents/resume-scorer';
import { readFileSync } from 'fs';

const agent = new ResumeScorerAgent();

// Load your resume
const resumeText = readFileSync('./my-resume.txt', 'utf-8');

// Define job posting
const jobPosting = {
  title: 'Senior Software Engineer',
  description: `
    We are seeking a Senior Software Engineer with 5+ years of experience
    in TypeScript, React, and Node.js. Must have experience with AWS and
    Docker. Strong communication and leadership skills required.
  `,
  requirements: [
    '5+ years software development experience',
    'Expert in TypeScript and React',
    'Experience with AWS and containerization',
    'Strong problem-solving skills'
  ],
  preferredQualifications: [
    'Bachelor\'s degree in Computer Science',
    'Experience with Kubernetes',
    'GraphQL experience'
  ]
};

// Score resume
const result = await agent.scoreResume(resumeText, jobPosting);

console.log(`Overall Score: ${result.overallScore}/100`);
console.log('\nBreakdown:');
console.log(`  Skills: ${result.breakdown.skillsMatch}/100`);
console.log(`  Experience: ${result.breakdown.experienceMatch}/100`);
console.log(`  Education: ${result.breakdown.educationMatch}/100`);
console.log(`  Keywords: ${result.breakdown.keywordMatch}/100`);
console.log(`\nATS Optimization: ${result.atsOptimizationScore}/100`);

console.log('\nRecommendations:');
result.recommendations.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec}`);
});
```

### Batch Scoring (Multiple Jobs)

```typescript
const jobPostings = [
  {
    title: 'Frontend Developer',
    description: 'React and TypeScript expert needed...',
    requirements: ['React', 'TypeScript', 'CSS']
  },
  {
    title: 'Full Stack Engineer',
    description: 'Node.js and React developer...',
    requirements: ['Node.js', 'React', 'PostgreSQL']
  },
  {
    title: 'DevOps Engineer',
    description: 'AWS and Kubernetes specialist...',
    requirements: ['AWS', 'Docker', 'Kubernetes']
  }
];

const results = await agent.scoreBatch(resumeText, jobPostings);

console.log('Best Matches:');
results.forEach((result, i) => {
  console.log(`${i + 1}. ${result.jobTitle}: ${result.overallScore}/100`);
});
```

## Resume Format Requirements

### Recommended Format

```
SKILLS
- JavaScript, TypeScript, Python
- React, Node.js, Express
- AWS, Docker, Kubernetes
- Git, CI/CD, Agile

EXPERIENCE
Software Engineer | Company Name | 2020-Present
- Developed microservices using Node.js and Docker
- Led team of 4 developers on cloud migration project
- Reduced API response time by 40%

EDUCATION
Bachelor of Science in Computer Science
University Name | 2016-2020

CERTIFICATIONS
- AWS Certified Solutions Architect
- Certified Kubernetes Administrator
```

### Best Practices

1. **Use Standard Section Headers**
   - SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS
   - Avoid creative headers like "What I Bring" or "My Journey"

2. **Keep Lines Under 100 Characters**
   - Improves ATS parsing
   - Better readability

3. **Avoid Special Characters**
   - No tables, borders, or graphics
   - Use simple bullets (-, •, *)
   - Avoid │ ┌ └ ┐ ┘

4. **Include Keywords Naturally**
   - Mirror job posting language
   - Don't keyword stuff
   - Use full technology names and abbreviations

5. **Quantify Achievements**
   - "Improved performance by 40%"
   - "Led team of 4 developers"
   - "Reduced costs by $50K annually"

## Interpreting Scores

### Overall Score
- **80-100**: Excellent match, apply with confidence
- **60-79**: Good match, tailor resume to strengthen weak areas
- **40-59**: Moderate match, significant customization needed
- **0-39**: Poor match, consider if role is appropriate fit

### Category Scores
- **Skills Match**: Focus on technical and soft skills alignment
- **Experience Match**: Years of experience and relevant projects
- **Education Match**: Degree requirements (or equivalent)
- **Keyword Match**: Job-specific terminology usage

### ATS Optimization Score
- **90-100**: Resume will parse cleanly through ATS
- **70-89**: Minor formatting improvements recommended
- **50-69**: Significant ATS issues, reformat needed
- **0-49**: Resume likely to be rejected by ATS

## Common Recommendations

### Critical Skills Missing
```
🔴 CRITICAL: Add these required skills: Docker, Kubernetes, AWS
```
**Action**: Add these skills if you have them, or consider upskilling

### Low Skills Match
```
Add missing skills to your resume: GraphQL, Redis, MongoDB
```
**Action**: Include relevant skills from job posting you possess

### Low Experience Match
```
Expand experience section with quantifiable achievements
```
**Action**: Add metrics, team sizes, and impact statements

### Low Keyword Match
```
Incorporate more job-specific keywords naturally
```
**Action**: Use exact terms from job description where truthful

### Poor ATS Score
```
Improve ATS compatibility: use standard headers, avoid special characters
```
**Action**: Reformat using plain text-friendly structure

## API Reference

### ResumeScorerAgent

#### Methods

##### `scoreResume(resumeText: string, jobPosting: JobPosting): Promise<ScoringResult>`

Scores a single resume against a job posting.

**Parameters:**
- `resumeText`: Full text of resume
- `jobPosting`: Job posting object with title, description, requirements

**Returns:** ScoringResult with scores, matches, and recommendations

##### `scoreBatch(resumeText: string, jobPostings: JobPosting[]): Promise<ScoringResult[]>`

Scores resume against multiple job postings.

**Parameters:**
- `resumeText`: Full text of resume
- `jobPostings`: Array of job posting objects

**Returns:** Array of ScoringResults sorted by score (highest first)

### Types

```typescript
interface JobPosting {
  title: string;
  description: string;
  requirements?: string[];
  preferredQualifications?: string[];
  keywords?: string[];
}

interface ScoringResult {
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    keywordMatch: number;
  };
  matchedItems: {
    skills: string[];
    experience: string[];
    education: string[];
    keywords: string[];
  };
  missingItems: {
    criticalSkills: string[];
    preferredSkills: string[];
    qualifications: string[];
  };
  recommendations: string[];
  atsOptimizationScore: number;
}
```

## Limitations

1. **Text-Based Analysis Only**
   - Cannot parse PDF or DOCX files directly
   - Convert to plain text first

2. **English Language**
   - Optimized for English resumes and job postings
   - May not work well with other languages

3. **Keyword Matching**
   - Uses predefined skill lists
   - May miss industry-specific terminology

4. **No Context Understanding**
   - Cannot assess quality of achievements
   - Cannot verify truthfulness of claims

## Tips for Best Results

1. **Customize Your Resume**
   - Create tailored version for each job
   - Emphasize relevant experience

2. **Use Job Posting Language**
   - Mirror terminology from description
   - Include exact skill names

3. **Quantify Everything**
   - Use numbers and percentages
   - Show impact and scale

4. **Test Before Applying**
   - Run scorer on job posting
   - Address recommendations
   - Re-score to verify improvements

5. **Combine with Human Review**
   - Use score as guide, not absolute truth
   - Have peers review customized resume
   - Proofread carefully

## Example Output

```
Overall Score: 78/100

Breakdown:
  Skills: 85/100
  Experience: 75/100
  Education: 100/100
  Keywords: 65/100

ATS Optimization: 82/100

Matched Skills:
  ✓ TypeScript
  ✓ React
  ✓ Node.js
  ✓ Docker
  ✓ AWS

Missing Skills:
  ✗ Kubernetes
  ✗ GraphQL

Recommendations:
1. Add missing skills to your resume: Kubernetes, GraphQL
2. Incorporate more job-specific keywords naturally
3. ⚠️ Moderate match. Tailor resume to emphasize relevant experience
```

## Support

For issues or questions:
- Check examples in `/examples/resume-scorer-example.ts`
- Review test cases in `/tests/resume-scorer.test.ts`
- Open issue on GitHub repository
