# Quick Start Guide

Get up and running with the Resume & Job Search Agent in 5 minutes!

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env
```

### Step 3: Get Free API Keys (2 minutes)

The fastest way to start is with **Adzuna** (completely free, instant approval):

1. Go to https://developer.adzuna.com/
2. Click "Get API Key"
3. Fill out the simple form
4. Check your email for credentials

### Step 4: Add API Keys

Edit `.env` file:

```bash
# Required - Get from Adzuna (free, instant)
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here

# Optional - These work without keys
# The Muse and Remotive are already configured!
```

### Step 5: Test Your Setup

```bash
npm run test:apis
```

You should see:
```
✅ Adzuna: Configured
✅ The Muse: Configured
✅ Remotive: Configured
```

## 🎯 Usage

### 1. Search for Jobs

```bash
npm run search -- --keywords "software engineer" --location "remote"
```

### 2. Score Jobs Against Your Resume

```bash
# Create a simple text file with your resume
npm run search -- --keywords "developer" --resume ./my-resume.txt --min-score 70
```

### 3. Test with Examples

```bash
# Run example searches
npm run example:jobs

# Run resume scoring examples
npm run example:resume
```

## 📊 Example Output

```
═══════════════════════════════════════════════════════════════════
JOB SEARCH RESULTS
═══════════════════════════════════════════════════════════════════

Search Parameters:
  Keywords: software engineer
  Location: remote
  Max Results: 50 per source

Using 3 job board(s): adzuna, themuse, remotive

Searching...
✓ adzuna: Found 50 jobs
✓ themuse: Found 20 jobs
✓ remotive: Found 30 jobs

✅ Found 100 total jobs

═══════════════════════════════════════════════════════════════════
TOP MATCHES
═══════════════════════════════════════════════════════════════════

1. 🟢 Senior Software Engineer - TechCorp
   Score: 85/100 | Location: Remote
   Skills: 90 | Experience: 85
   https://example.com/job/123
   💡 Strong match! Consider customizing your cover letter

2. 🟡 Full Stack Developer - StartupXYZ
   Score: 72/100 | Location: San Francisco, CA
   Skills: 75 | Experience: 70
   https://example.com/job/456
   💡 Add missing skills: Kubernetes, GraphQL

...
```

## 🛠️ Troubleshooting

### "No APIs configured" Error

Make sure you:
1. Copied `.env.example` to `.env`
2. Added your Adzuna API credentials
3. No quotes around values in `.env`

### Can't Find Jobs

Try:
- Broader keywords ("engineer" instead of "Senior React Engineer")
- Different locations ("remote" instead of specific city)
- Lower `--max-results` if APIs are slow

### Resume Scoring Not Working

Make sure:
- Resume file exists at the path you specified
- Resume is plain text (not PDF or DOCX)
- Resume has clear sections (SKILLS, EXPERIENCE, EDUCATION)

## 📚 Next Steps

### Add More Job Boards (Optional)

See `docs/API-SETUP-GUIDE.md` for instructions on:
- USAJobs (free, U.S. government jobs)
- Jooble (free, international)
- Reed (free, UK jobs)

### Optimize Your Resume

Use the scoring agent to test different resume versions:

```bash
# Score current resume
npm run search -- -k "your target role" -r resume-v1.txt

# Make changes, test again
npm run search -- -k "your target role" -r resume-v2.txt

# Compare scores!
```

### Automate Your Job Search

Create a simple script:

```bash
#!/bin/bash
# Daily job search

npm run search -- \
  --keywords "senior software engineer" \
  --location "remote" \
  --resume ./resume.txt \
  --min-score 75 \
  > jobs-$(date +%Y-%m-%d).txt

echo "Saved to jobs-$(date +%Y-%m-%d).txt"
```

Run it daily with cron:
```bash
# Run every day at 9 AM
0 9 * * * /path/to/your/job-search.sh
```

## 💡 Pro Tips

### 1. Use Multiple Keywords

```bash
# Search multiple job titles
npm run search -- -k "software engineer" > results1.txt
npm run search -- -k "full stack developer" > results2.txt
npm run search -- -k "backend engineer" > results3.txt
```

### 2. Filter by Match Score

Only see jobs you're highly qualified for:

```bash
npm run search -- -k "developer" -r resume.txt --min-score 80
```

### 3. Search Specific Sources

If you want jobs from one source only:

```bash
npm run search -- -k "engineer" --source adzuna
```

### 4. Save Results

```bash
npm run search -- -k "developer" -l "remote" > my-jobs.txt
```

## 🆘 Getting Help

- **Quick questions:** Run `npm run help`
- **API setup:** See `docs/API-SETUP-GUIDE.md`
- **Detailed guide:** See `docs/resume-scorer-guide.md`
- **Full README:** See `docs/JOB-SEARCH-AGENT-README.md`

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Adzuna API keys added
- [ ] API test passed (`npm run test:apis`)
- [ ] First job search completed
- [ ] Resume scoring tested

If all items are checked, you're ready to go! 🎉

## 📱 Command Reference

```bash
# Test API configuration
npm run test:apis

# Search jobs
npm run search -- --keywords "job title" [--location "city"] [--resume path]

# Run examples
npm run example:resume
npm run example:jobs

# Run tests
npm test

# Build project
npm run build

# Show help
npm run help
```

## 🎓 Learning Resources

1. **Understanding Scores**
   - 80-100: Excellent match, apply immediately
   - 60-79: Good match, tailor resume
   - 40-59: Moderate match, significant work needed
   - 0-39: Poor match, may not be right fit

2. **Resume Tips**
   - Use standard section headers
   - Keep lines under 100 characters
   - Include keywords from job descriptions
   - Quantify achievements
   - Avoid special characters

3. **Job Search Strategy**
   - Cast a wide net initially
   - Use scoring to filter
   - Apply to top 20% matches
   - Customize resume for top 5% matches

## 🚀 Ready to Start?

```bash
# Test your setup
npm run test:apis

# Run your first search
npm run search -- --keywords "your dream job" --location "remote"
```

Good luck with your job search! 🎯
