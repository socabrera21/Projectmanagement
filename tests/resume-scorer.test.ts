/**
 * Resume Scorer Agent - Unit Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ResumeScorerAgent } from '../src/agents/resume-scorer';

describe('ResumeScorerAgent', () => {
  let agent: ResumeScorerAgent;

  beforeEach(() => {
    agent = new ResumeScorerAgent();
  });

  describe('parseResume', () => {
    it('should parse resume with standard sections', () => {
      const resume = `
        SKILLS
        JavaScript, TypeScript, React

        EXPERIENCE
        Software Engineer at Tech Corp
        5 years of experience

        EDUCATION
        Bachelor of Science in Computer Science
      `;

      const result = agent.parseResume(resume);

      expect(result.skills.length).toBeGreaterThan(0);
      expect(result.experience.length).toBeGreaterThan(0);
      expect(result.education.length).toBeGreaterThan(0);
    });

    it('should handle resume without clear sections', () => {
      const resume = 'Random text without sections';
      const result = agent.parseResume(resume);

      expect(result.skills).toEqual([]);
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
    });
  });

  describe('extractJobKeywords', () => {
    it('should extract technical keywords', () => {
      const description = 'We need someone with React, TypeScript, and Node.js experience';
      const result = agent.extractJobKeywords(description);

      expect(result.technical).toContain('react');
      expect(result.technical).toContain('typescript');
      expect(result.technical).toContain('node.js');
    });

    it('should extract soft skills', () => {
      const description = 'Strong leadership and communication skills required';
      const result = agent.extractJobKeywords(description);

      expect(result.soft).toContain('leadership');
      expect(result.soft).toContain('communication');
    });

    it('should extract critical requirements', () => {
      const description = 'Required: 5 years experience. Must have Docker knowledge.';
      const result = agent.extractJobKeywords(description);

      expect(result.critical.length).toBeGreaterThan(0);
    });
  });

  describe('scoreResume', () => {
    const sampleResume = `
      SKILLS
      JavaScript, TypeScript, React, Node.js, Docker, AWS

      EXPERIENCE
      Senior Software Engineer | Tech Corp | 2019-Present
      5 years of experience building web applications
      Led team of 4 developers

      EDUCATION
      Bachelor of Science in Computer Science
    `;

    const sampleJob = {
      title: 'Senior Software Engineer',
      description: `
        Looking for a senior engineer with 5+ years of experience.
        Must have React, TypeScript, and Node.js skills.
        AWS and Docker experience required.
      `,
      requirements: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    };

    it('should return valid scoring result', async () => {
      const result = await agent.scoreResume(sampleResume, sampleJob);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.breakdown.skillsMatch).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.experienceMatch).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.educationMatch).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.keywordMatch).toBeGreaterThanOrEqual(0);
    });

    it('should identify matched skills', async () => {
      const result = await agent.scoreResume(sampleResume, sampleJob);

      expect(result.matchedItems.skills).toContain('react');
      expect(result.matchedItems.skills).toContain('typescript');
      expect(result.matchedItems.skills).toContain('node.js');
    });

    it('should provide recommendations', async () => {
      const result = await agent.scoreResume(sampleResume, sampleJob);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should score high for strong match', async () => {
      const result = await agent.scoreResume(sampleResume, sampleJob);

      expect(result.overallScore).toBeGreaterThan(60);
    });

    it('should score low for poor match', async () => {
      const poorResume = `
        SKILLS
        PHP, Ruby, Perl
      `;

      const result = await agent.scoreResume(poorResume, sampleJob);

      expect(result.overallScore).toBeLessThan(60);
    });
  });

  describe('scoreBatch', () => {
    const resume = `
      SKILLS
      React, TypeScript, Node.js

      EXPERIENCE
      Software Engineer | 3 years
    `;

    const jobs = [
      {
        title: 'Frontend Developer',
        description: 'React and TypeScript required',
        requirements: ['React', 'TypeScript'],
      },
      {
        title: 'Backend Developer',
        description: 'Node.js and Python required',
        requirements: ['Node.js', 'Python'],
      },
      {
        title: 'DevOps Engineer',
        description: 'AWS and Kubernetes required',
        requirements: ['AWS', 'Kubernetes'],
      },
    ];

    it('should score multiple jobs', async () => {
      const results = await agent.scoreBatch(resume, jobs);

      expect(results.length).toBe(3);
      expect(results[0].jobTitle).toBeDefined();
      expect(results[0].overallScore).toBeDefined();
    });

    it('should sort results by score', async () => {
      const results = await agent.scoreBatch(resume, jobs);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].overallScore).toBeGreaterThanOrEqual(
          results[i + 1].overallScore
        );
      }
    });

    it('should rank frontend job highest', async () => {
      const results = await agent.scoreBatch(resume, jobs);

      expect(results[0].jobTitle).toBe('Frontend Developer');
    });
  });

  describe('edge cases', () => {
    it('should handle empty resume', async () => {
      const job = {
        title: 'Test Job',
        description: 'Test description',
      };

      await expect(
        agent.scoreResume('', job)
      ).rejects.toThrow();
    });

    it('should handle job with no requirements', async () => {
      const resume = 'SKILLS\nJavaScript';
      const job = {
        title: 'Test Job',
        description: 'We are hiring',
      };

      const result = await agent.scoreResume(resume, job);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle resume with special characters', async () => {
      const resume = `
        SKILLS
        ────────
        │ React │
        └───────┘
      `;

      const job = {
        title: 'Test',
        description: 'React developer',
      };

      const result = await agent.scoreResume(resume, job);

      expect(result.atsOptimizationScore).toBeLessThan(100);
    });
  });
});
