# Job Board API Setup Guide

Complete guide to obtaining and configuring API keys for job board integrations.

## 📋 Quick Overview

| Job Board | Cost | Setup Time | Approval | Difficulty | Recommended |
|-----------|------|------------|----------|------------|-------------|
| **Adzuna** | Free (1000/mo) | 2 min | Instant | ⭐ Easy | ✅ YES |
| **The Muse** | Free | 0 min | None | ⭐ Easy | ✅ YES |
| **Remotive** | Free | 0 min | None | ⭐ Easy | ✅ YES |
| **USAJobs** | Free | 5 min | Instant | ⭐ Easy | ✅ YES |
| **Jooble** | Free | 5 min | 1-2 days | ⭐⭐ Medium | ✅ YES |
| **Reed** | Free | 5 min | 1-2 days | ⭐⭐ Medium | ⚠️ UK Only |
| **Indeed** | Paid | 15 min | 1-2 weeks | ⭐⭐⭐ Hard | ⚠️ Expensive |
| **LinkedIn** | Paid | 30 min | 1-2 weeks | ⭐⭐⭐⭐ Very Hard | ❌ Complex |
| **ZipRecruiter** | Paid | 15 min | 1-2 weeks | ⭐⭐⭐ Hard | ⚠️ Partner Only |
| **Glassdoor** | N/A | N/A | Restricted | ⭐⭐⭐⭐⭐ Impossible | ❌ No Longer Available |

## 🚀 Quick Start (5 Minutes)

### Step 1: Start with Free APIs (No Approval Needed)

These work immediately with zero setup:

```bash
# Copy the example env file
cp .env.example .env

# You can already use these:
# - The Muse (no key needed)
# - Remotive (no key needed)
```

### Step 2: Get Adzuna API (2 Minutes - Instant)

**Best free option - Instant approval, 1000 calls/month**

1. Go to https://developer.adzuna.com/
2. Click "Get API Key"
3. Fill out simple form (name, email, use case)
4. Receive keys instantly via email

Add to your `.env`:
```bash
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
```

### Step 3: Test Your Setup

```bash
npm run test:apis
```

You should now have access to 3 job boards (The Muse, Remotive, Adzuna)!

---

## 📝 Detailed Setup Instructions

### 1. Adzuna API ⭐ RECOMMENDED

**Why:** Free, instant approval, comprehensive coverage (50+ countries)

**Steps:**
1. Visit https://developer.adzuna.com/
2. Click "Sign up" or "Get API Key"
3. Complete the registration form:
   - Name
   - Email
   - Website (can use "https://github.com/yourusername")
   - Use case: "Personal job search application"
4. Check your email for credentials
5. Add to `.env`:
   ```bash
   ADZUNA_APP_ID=1234567
   ADZUNA_APP_KEY=abcdef1234567890
   ```

**Rate Limits:**
- Free tier: 1000 calls/month
- ~33 calls/day
- Perfect for personal use

**Coverage:**
- 50+ countries
- Millions of jobs
- Updated daily

---

### 2. The Muse API ⭐ RECOMMENDED

**Why:** No registration needed, completely free

**Steps:**
1. No setup required! Works immediately
2. Optional: Register at https://www.themuse.com/developers for higher limits

**Rate Limits:**
- Unlimited basic use
- Rate limiting applies if you make 100+ requests/minute

**Coverage:**
- Tech companies
- Startups
- Creative industries
- Company culture info included

---

### 3. Remotive API ⭐ RECOMMENDED

**Why:** Best source for remote jobs, no key required

**Steps:**
1. No setup required!
2. API documentation: https://remotive.com/api-documentation

**Rate Limits:**
- No official limit
- Be respectful (don't spam)

**Coverage:**
- Remote-only positions
- Tech-focused
- Global companies

---

### 4. USAJobs API

**Why:** Official U.S. government job board, free API

**Steps:**
1. Visit https://developer.usajobs.gov/
2. Click "Get Started"
3. Complete the request form:
   - Email address
   - Purpose: "Personal job search tool"
4. Receive API key via email (instant)
5. Add to `.env`:
   ```bash
   USAJOBS_API_KEY=your_key_here
   USAJOBS_USER_AGENT=your_email@example.com
   ```

**Rate Limits:**
- Free unlimited use
- Must include User-Agent header

**Coverage:**
- U.S. federal government jobs
- State and local government
- Contractors

---

### 5. Jooble API

**Why:** Free tier, good international coverage

**Steps:**
1. Visit https://jooble.org/api/about
2. Fill out the API request form:
   - Company/Personal name
   - Website (can use GitHub profile)
   - Email
   - Use case: "Job search aggregation tool"
3. Wait 1-2 business days for approval
4. Receive API key via email
5. Add to `.env`:
   ```bash
   JOOBLE_API_KEY=your_key_here
   ```

**Rate Limits:**
- Free tier: Check your account
- Typically generous for personal use

**Coverage:**
- 69 countries
- Multiple languages
- Aggregates from many sources

---

### 6. Reed API (UK-focused)

**Why:** Best for UK job searches, free API

**Steps:**
1. Visit https://www.reed.co.uk/developers
2. Click "Register"
3. Create account and verify email
4. Request API access
5. Receive API key (1-2 days)
6. Add to `.env`:
   ```bash
   REED_API_KEY=your_key_here
   ```

**Rate Limits:**
- Free unlimited use for personal projects

**Coverage:**
- UK jobs primarily
- Some international

---

### 7. Indeed API ⚠️ DIFFICULT

**Why:** Huge job inventory, but expensive and restrictive

**Status:** Indeed shut down their public API in 2021. Current options:

1. **Publisher Program** (Paid):
   - Must be approved as a publisher
   - Revenue sharing model
   - Apply at https://www.indeed.com/publisher
   - Requires business website
   - Approval takes 1-2 weeks

2. **Alternative - RSS Feeds** (Free):
   ```typescript
   const rssUrl = `https://www.indeed.com/rss?q=${keywords}&l=${location}`;
   // Use RSS parser library
   ```

**Not Recommended:** Complex, expensive, restrictive terms

---

### 8. LinkedIn API ❌ VERY DIFFICULT

**Why:** Most comprehensive professional network, but very restricted access

**Status:** LinkedIn has severely restricted API access. Current situation:

**Requirements:**
- Must be a registered company
- Need company LinkedIn page
- OAuth 2.0 implementation required
- Application review takes 2+ weeks
- Very limited free tier

**Steps (if you still want to try):**
1. Create LinkedIn company page
2. Visit https://www.linkedin.com/developers/
3. Create an app
4. Apply for "Jobs" product access
5. Wait for review (often rejected)
6. Implement OAuth flow

**Reality Check:**
- LinkedIn Jobs API is restricted to partners only
- Individual developers rarely get approved
- Not worth the effort for personal projects

**Better Alternative:**
- Use Adzuna (includes LinkedIn jobs)
- Use The Muse (includes LinkedIn company data)

---

### 9. ZipRecruiter API ⚠️ PARTNER ONLY

**Status:** Requires partnership approval

**Steps:**
1. Visit https://www.ziprecruiter.com/zr-api
2. Apply for partner program
3. Must demonstrate:
   - Established website/product
   - Meaningful traffic/users
   - Professional use case
4. Wait for approval (1-2 weeks)

**Reality:** Difficult to get approved for personal use

---

### 10. Glassdoor API ❌ NO LONGER AVAILABLE

**Status:** Glassdoor has shut down public API access

**Alternatives:**
- Use Adzuna (includes Glassdoor jobs)
- Scrape public RSS feeds (check robots.txt)
- Use The Muse for company reviews

---

## 🎯 Recommended Setup Strategy

### Tier 1: Start Here (0-5 minutes)
```bash
✅ The Muse - No setup
✅ Remotive - No setup
✅ Adzuna - 2 min signup
```

This gives you access to thousands of jobs immediately!

### Tier 2: Add These (1-2 days)
```bash
⏳ USAJobs - Instant (if in US)
⏳ Jooble - 1-2 day approval
⏳ Reed - 1-2 day approval (if in UK)
```

### Tier 3: Skip These
```bash
❌ Indeed - Too expensive/restrictive
❌ LinkedIn - Too difficult to get approved
❌ ZipRecruiter - Partner program only
❌ Glassdoor - API shut down
```

---

## 🔧 Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Edit `.env` File

Add your API keys:

```bash
# Minimum setup (works immediately)
ADZUNA_APP_ID=12345
ADZUNA_APP_KEY=abcdef123456

# Optional (add as you get them)
USAJOBS_API_KEY=your_key
USAJOBS_USER_AGENT=your_email@example.com
JOOBLE_API_KEY=your_key
REED_API_KEY=your_key
```

### 3. Test Configuration

```bash
npm run test:apis
```

Expected output:
```
✓ The Muse: Configured
✓ Remotive: Configured
✓ Adzuna: Configured
✗ USAJobs: Not configured
✗ Jooble: Not configured
✗ Reed: Not configured
```

---

## 🧪 Testing Your APIs

### Test Individual API

```typescript
import { JobBoardAPIManager } from './src/integrations/job-board-apis';

const manager = new JobBoardAPIManager();

// Test Adzuna
const jobs = await manager.searchAPI('adzuna', {
  keywords: 'software engineer',
  location: 'San Francisco',
  maxResults: 10
});

console.log(`Found ${jobs.length} jobs`);
```

### Test All Configured APIs

```typescript
const allJobs = await manager.searchAll({
  keywords: 'senior developer',
  location: 'remote',
  maxResults: 20
});

console.log(`Total jobs from all sources: ${allJobs.length}`);
```

### Check API Status

```typescript
const status = manager.getStatus();
status.forEach(api => {
  console.log(`${api.name}: ${api.configured ? '✅' : '❌'}`);
  console.log(`  ${api.notes}`);
});
```

---

## 📊 Rate Limiting & Best Practices

### Rate Limits Summary

| API | Limit | Window | Enforcement |
|-----|-------|--------|-------------|
| Adzuna | 1000 calls | Monthly | Hard |
| The Muse | ~60 requests | Minute | Soft |
| Remotive | Unlimited | - | Be respectful |
| USAJobs | Unlimited | - | None |
| Jooble | Varies | Daily | Check your account |
| Reed | Unlimited | - | Fair use |

### Best Practices

1. **Cache Results**
   ```typescript
   // Results are cached for 15 minutes by default
   // Don't search the same query repeatedly
   ```

2. **Respect Rate Limits**
   ```typescript
   // Built-in rate limiter
   // Automatically delays requests when needed
   ```

3. **Use Batch Searches**
   ```typescript
   // Search all APIs at once
   await manager.searchAll(params);
   // More efficient than sequential searches
   ```

4. **Handle Errors Gracefully**
   ```typescript
   // APIs can fail - always have fallbacks
   try {
     const jobs = await api.search(params);
   } catch (error) {
     console.error('API failed, continuing with other sources');
   }
   ```

---

## 🐛 Troubleshooting

### "API not configured" Error

**Problem:** Missing API keys in `.env`

**Solution:**
```bash
# Check your .env file exists
ls -la .env

# Verify keys are set
cat .env | grep ADZUNA

# Make sure no quotes around values
# WRONG: ADZUNA_APP_ID="12345"
# RIGHT: ADZUNA_APP_ID=12345
```

### "Rate limit exceeded" Error

**Problem:** Too many requests

**Solution:**
```typescript
// Wait before retrying
await new Promise(r => setTimeout(r, 60000)); // 1 minute

// Or reduce maxResults
const jobs = await api.search({
  keywords: 'developer',
  maxResults: 10 // Instead of 100
});
```

### "Invalid API key" Error

**Problem:** Wrong key or expired

**Solution:**
1. Check for typos in `.env`
2. Verify key at provider's dashboard
3. Some keys expire - regenerate if needed
4. Make sure no extra spaces in `.env`

### No Results Returned

**Problem:** Search too specific or API has no matching jobs

**Solution:**
```typescript
// Broaden search
keywords: 'developer' // Instead of 'Senior React TypeScript Developer'

// Try multiple locations
location: 'Remote' // Instead of 'San Francisco, CA'

// Remove salary filters
// salaryMin: 100000 // Remove this
```

### API Returns Different Job Count Each Time

**Problem:** Job boards update frequently

**Solution:** This is normal! Job postings change constantly.

---

## 💡 Tips for Success

### 1. Start Small
- Begin with free APIs (Adzuna, The Muse, Remotive)
- Add more as needed
- Don't overcomplicate

### 2. Monitor Usage
- Check API dashboards monthly
- Watch for rate limit warnings
- Upgrade if you hit limits

### 3. Diversify Sources
- Don't rely on one API
- Different boards have different jobs
- Use 3-4 sources minimum

### 4. Cache Aggressively
- Save search results locally
- Don't re-search same query
- Update every 24 hours max

### 5. Be a Good API Citizen
- Respect rate limits
- Don't scrape unnecessarily
- Read terms of service
- Provide attribution when required

---

## 📞 Support & Resources

### API Documentation Links

- **Adzuna:** https://developer.adzuna.com/docs/search
- **The Muse:** https://www.themuse.com/developers/api/v2
- **Remotive:** https://remotive.com/api-documentation
- **USAJobs:** https://developer.usajobs.gov/api-reference
- **Jooble:** https://jooble.org/api/about
- **Reed:** https://www.reed.co.uk/developers/jobseeker

### Community

- GitHub Issues: Report bugs
- Stack Overflow: Tag `job-board-api`
- Reddit: r/cscareerquestions

### Legal

Always:
- Read terms of service
- Respect rate limits
- Don't resell data
- Provide attribution if required
- Check robots.txt before scraping

---

## 🎉 You're Ready!

With Adzuna, The Muse, and Remotive configured, you have access to:
- ✅ Thousands of jobs daily
- ✅ Multiple countries
- ✅ Remote opportunities
- ✅ Tech and non-tech roles
- ✅ 100% free

Start searching:
```bash
npm run search -- --keywords "software engineer" --location "remote"
```

Good luck with your job search! 🚀
