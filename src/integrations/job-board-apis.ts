/**
 * Job Board API Integrations
 * Real API implementations for major job boards
 */

import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private windowMs: number;

  constructor(requestsPerMinute: number = 60) {
    this.limit = requestsPerMinute;
    this.windowMs = 60000; // 1 minute
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkLimit();
    }

    this.requests.push(now);
  }
}

export interface JobBoardSearchParams {
  keywords: string;
  location?: string;
  radius?: number;
  jobType?: string;
  salaryMin?: number;
  maxResults?: number;
  page?: number;
}

export interface StandardizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  postedDate: Date;
  source: string;
  rawData?: any;
}

// ============================================================================
// ADZUNA API (Recommended - Free tier, easy setup)
// ============================================================================
export class AdzunaAPI {
  private appId: string;
  private appKey: string;
  private baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  private rateLimiter = new RateLimiter(60);

  constructor() {
    this.appId = process.env.ADZUNA_APP_ID || '';
    this.appKey = process.env.ADZUNA_APP_KEY || '';

    if (!this.appId || !this.appKey) {
      console.warn('Adzuna API credentials not found. Get free keys at https://developer.adzuna.com/');
    }
  }

  isConfigured(): boolean {
    return !!(this.appId && this.appKey);
  }

  async search(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    if (!this.isConfigured()) {
      throw new Error('Adzuna API not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY');
    }

    await this.rateLimiter.checkLimit();

    const country = 'us';
    const url = new URL(`${this.baseUrl}/${country}/search/${params.page || 1}`);

    url.searchParams.append('app_id', this.appId);
    url.searchParams.append('app_key', this.appKey);
    url.searchParams.append('what', params.keywords);

    if (params.location) {
      url.searchParams.append('where', params.location);
    }

    if (params.maxResults) {
      url.searchParams.append('results_per_page', params.maxResults.toString());
    }

    if (params.salaryMin) {
      url.searchParams.append('salary_min', params.salaryMin.toString());
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min)}-$${Math.round(job.salary_max)}`
        : undefined,
      postedDate: new Date(job.created),
      source: 'Adzuna',
      rawData: job,
    }));
  }
}

// ============================================================================
// THE MUSE API (Free, no key required for basic use)
// ============================================================================
export class TheMuseAPI {
  private baseUrl = 'https://www.themuse.com/api/public';
  private rateLimiter = new RateLimiter(60);

  async search(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    await this.rateLimiter.checkLimit();

    const url = new URL(`${this.baseUrl}/jobs`);

    if (params.keywords) {
      url.searchParams.append('category', params.keywords);
    }

    if (params.location) {
      url.searchParams.append('location', params.location);
    }

    url.searchParams.append('page', (params.page || 0).toString());
    url.searchParams.append('descending', 'true');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`The Muse API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((job: any) => ({
      id: job.id.toString(),
      title: job.name,
      company: job.company.name,
      location: job.locations.map((l: any) => l.name).join(', ') || 'Remote',
      description: job.contents,
      url: job.refs.landing_page,
      postedDate: new Date(job.publication_date),
      source: 'The Muse',
      rawData: job,
    }));
  }
}

// ============================================================================
// REMOTIVE API (Remote jobs - Free, no key required)
// ============================================================================
export class RemotiveAPI {
  private baseUrl = 'https://remotive.com/api/remote-jobs';
  private rateLimiter = new RateLimiter(60);

  async search(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    await this.rateLimiter.checkLimit();

    const url = new URL(this.baseUrl);

    if (params.keywords) {
      url.searchParams.append('search', params.keywords);
    }

    if (params.jobType) {
      url.searchParams.append('category', params.jobType);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Remotive API error: ${response.status}`);
    }

    const data = await response.json();

    return data.jobs.slice(0, params.maxResults || 50).map((job: any) => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company_name,
      location: 'Remote',
      description: job.description,
      url: job.url,
      salary: job.salary,
      postedDate: new Date(job.publication_date),
      source: 'Remotive',
      rawData: job,
    }));
  }
}

// ============================================================================
// USAJOBS API (U.S. Government jobs - Free)
// ============================================================================
export class USAJobsAPI {
  private apiKey: string;
  private userAgent: string;
  private baseUrl = 'https://data.usajobs.gov/api/search';
  private rateLimiter = new RateLimiter(60);

  constructor() {
    this.apiKey = process.env.USAJOBS_API_KEY || '';
    this.userAgent = process.env.USAJOBS_USER_AGENT || 'job-search-agent@example.com';

    if (!this.apiKey) {
      console.warn('USAJobs API key not found. Get free key at https://developer.usajobs.gov/');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async search(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    if (!this.isConfigured()) {
      throw new Error('USAJobs API not configured. Set USAJOBS_API_KEY');
    }

    await this.rateLimiter.checkLimit();

    const url = new URL(this.baseUrl);

    if (params.keywords) {
      url.searchParams.append('Keyword', params.keywords);
    }

    if (params.location) {
      url.searchParams.append('LocationName', params.location);
    }

    url.searchParams.append('ResultsPerPage', (params.maxResults || 50).toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization-Key': this.apiKey,
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`USAJobs API error: ${response.status}`);
    }

    const data = await response.json();

    return data.SearchResult.SearchResultItems.map((item: any) => {
      const job = item.MatchedObjectDescriptor;
      return {
        id: job.PositionID,
        title: job.PositionTitle,
        company: job.OrganizationName,
        location: job.PositionLocationDisplay,
        description: job.UserArea.Details.JobSummary,
        url: job.PositionURI,
        salary: job.PositionRemuneration?.[0]?.Description,
        postedDate: new Date(job.PublicationStartDate),
        source: 'USAJobs',
        rawData: job,
      };
    });
  }
}

// ============================================================================
// JOOBLE API (Free tier)
// ============================================================================
export class JoobleAPI {
  private apiKey: string;
  private baseUrl = 'https://jooble.org/api';
  private rateLimiter = new RateLimiter(60);

  constructor() {
    this.apiKey = process.env.JOOBLE_API_KEY || '';

    if (!this.apiKey) {
      console.warn('Jooble API key not found. Get free key at https://jooble.org/api/about');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async search(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    if (!this.isConfigured()) {
      throw new Error('Jooble API not configured. Set JOOBLE_API_KEY');
    }

    await this.rateLimiter.checkLimit();

    const url = `${this.baseUrl}/${this.apiKey}`;

    const requestBody = {
      keywords: params.keywords,
      location: params.location || '',
      radius: params.radius || 25,
      page: (params.page || 1).toString(),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Jooble API error: ${response.status}`);
    }

    const data = await response.json();

    return data.jobs.slice(0, params.maxResults || 50).map((job: any) => ({
      id: job.id || `jooble-${Date.now()}-${Math.random()}`,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.snippet,
      url: job.link,
      salary: job.salary,
      postedDate: new Date(job.updated),
      source: 'Jooble',
      rawData: job,
    }));
  }
}

// ============================================================================
// REED API (UK-focused - Free)
// ============================================================================
export class ReedAPI {
  private apiKey: string;
  private baseUrl = 'https://www.reed.co.uk/api/1.0/search';
  private rateLimiter = new RateLimiter(60);

  constructor() {
    this.apiKey = process.env.REED_API_KEY || '';

    if (!this.apiKey) {
      console.warn('Reed API key not found. Get free key at https://www.reed.co.uk/developers');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async search(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    if (!this.isConfigured()) {
      throw new Error('Reed API not configured. Set REED_API_KEY');
    }

    await this.rateLimiter.checkLimit();

    const url = new URL(this.baseUrl);

    if (params.keywords) {
      url.searchParams.append('keywords', params.keywords);
    }

    if (params.location) {
      url.searchParams.append('locationName', params.location);
    }

    url.searchParams.append('resultsToTake', (params.maxResults || 50).toString());

    const authString = Buffer.from(`${this.apiKey}:`).toString('base64');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Reed API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((job: any) => ({
      id: job.jobId.toString(),
      title: job.jobTitle,
      company: job.employerName,
      location: job.locationName,
      description: job.jobDescription,
      url: job.jobUrl,
      salary: job.minimumSalary && job.maximumSalary
        ? `£${job.minimumSalary}-£${job.maximumSalary}`
        : undefined,
      postedDate: new Date(job.date),
      source: 'Reed',
      rawData: job,
    }));
  }
}

// ============================================================================
// Unified Job Board Manager
// ============================================================================
export class JobBoardAPIManager {
  private apis: Map<string, any>;

  constructor() {
    this.apis = new Map();

    // Initialize all available APIs
    this.apis.set('adzuna', new AdzunaAPI());
    this.apis.set('themuse', new TheMuseAPI());
    this.apis.set('remotive', new RemotiveAPI());
    this.apis.set('usajobs', new USAJobsAPI());
    this.apis.set('jooble', new JoobleAPI());
    this.apis.set('reed', new ReedAPI());
  }

  /**
   * Get all configured (ready to use) APIs
   */
  getConfiguredAPIs(): string[] {
    const configured: string[] = [];

    this.apis.forEach((api, name) => {
      if (!api.isConfigured || api.isConfigured()) {
        configured.push(name);
      }
    });

    return configured;
  }

  /**
   * Get APIs that need configuration
   */
  getUnconfiguredAPIs(): string[] {
    const unconfigured: string[] = [];

    this.apis.forEach((api, name) => {
      if (api.isConfigured && !api.isConfigured()) {
        unconfigured.push(name);
      }
    });

    return unconfigured;
  }

  /**
   * Search a specific API
   */
  async searchAPI(apiName: string, params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    const api = this.apis.get(apiName.toLowerCase());

    if (!api) {
      throw new Error(`API '${apiName}' not found`);
    }

    if (api.isConfigured && !api.isConfigured()) {
      throw new Error(`API '${apiName}' is not configured`);
    }

    return api.search(params);
  }

  /**
   * Search all configured APIs in parallel
   */
  async searchAll(params: JobBoardSearchParams): Promise<StandardizedJob[]> {
    const configuredAPIs = this.getConfiguredAPIs();

    console.log(`Searching ${configuredAPIs.length} job boards: ${configuredAPIs.join(', ')}`);

    const results = await Promise.allSettled(
      configuredAPIs.map(apiName => this.searchAPI(apiName, params))
    );

    const allJobs: StandardizedJob[] = [];

    results.forEach((result, index) => {
      const apiName = configuredAPIs[index];

      if (result.status === 'fulfilled') {
        console.log(`✓ ${apiName}: Found ${result.value.length} jobs`);
        allJobs.push(...result.value);
      } else {
        console.error(`✗ ${apiName}: ${result.reason.message}`);
      }
    });

    return allJobs;
  }

  /**
   * Get status of all APIs
   */
  getStatus(): { name: string; configured: boolean; free: boolean; notes: string }[] {
    return [
      {
        name: 'Adzuna',
        configured: this.apis.get('adzuna').isConfigured(),
        free: true,
        notes: '1000 calls/month free - Instant approval',
      },
      {
        name: 'The Muse',
        configured: true,
        free: true,
        notes: 'No key required - Unlimited use',
      },
      {
        name: 'Remotive',
        configured: true,
        free: true,
        notes: 'Remote jobs only - No key required',
      },
      {
        name: 'USAJobs',
        configured: this.apis.get('usajobs').isConfigured(),
        free: true,
        notes: 'U.S. Government jobs - Free API',
      },
      {
        name: 'Jooble',
        configured: this.apis.get('jooble').isConfigured(),
        free: true,
        notes: 'Free tier available',
      },
      {
        name: 'Reed',
        configured: this.apis.get('reed').isConfigured(),
        free: true,
        notes: 'UK-focused - Free API',
      },
    ];
  }
}

export default JobBoardAPIManager;
