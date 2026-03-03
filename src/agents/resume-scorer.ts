/**
 * Resume-to-Job Posting Scoring Agent
 * Analyzes resume against job postings and provides match scores with actionable insights
 */

import { z } from 'zod';

// Input validation schemas
const ResumeSchema = z.object({
  text: z.string().min(50, 'Resume text too short'),
  sections: z.object({
    experience: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    education: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
  }).optional(),
});

const JobPostingSchema = z.object({
  title: z.string(),
  description: z.string().min(50, 'Job description too short'),
  requirements: z.array(z.string()).optional(),
  preferredQualifications: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

export interface ScoringResult {
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

export class ResumeScorerAgent {
  private commonTechSkills = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node.js',
    'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'git', 'ci/cd',
    'agile', 'scrum', 'api', 'rest', 'graphql', 'microservices',
  ];

  private commonSoftSkills = [
    'leadership', 'communication', 'teamwork', 'problem-solving',
    'analytical', 'creative', 'organized', 'detail-oriented',
  ];

  /**
   * Parses resume text into structured sections
   */
  parseResume(resumeText: string): {
    skills: string[];
    experience: string[];
    education: string[];
    certifications: string[];
  } {
    const sections = {
      skills: [] as string[],
      experience: [] as string[],
      education: [] as string[],
      certifications: [] as string[],
    };

    const lines = resumeText.toLowerCase().split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section headers
      if (trimmed.match(/^(skills|technical skills|core competencies)/)) {
        currentSection = 'skills';
        continue;
      }
      if (trimmed.match(/^(experience|work experience|employment)/)) {
        currentSection = 'experience';
        continue;
      }
      if (trimmed.match(/^(education|academic)/)) {
        currentSection = 'education';
        continue;
      }
      if (trimmed.match(/^(certifications|certificates)/)) {
        currentSection = 'certifications';
        continue;
      }

      // Add content to current section
      if (trimmed && currentSection) {
        sections[currentSection as keyof typeof sections].push(trimmed);
      }
    }

    return sections;
  }

  /**
   * Extracts keywords from job posting
   */
  extractJobKeywords(jobDescription: string, requirements: string[] = []): {
    technical: string[];
    soft: string[];
    critical: string[];
  } {
    const text = `${jobDescription} ${requirements.join(' ')}`.toLowerCase();

    const technical = this.commonTechSkills.filter(skill =>
      text.includes(skill)
    );

    const soft = this.commonSoftSkills.filter(skill =>
      text.includes(skill)
    );

    // Extract "required" or "must have" items
    const criticalMatches = text.match(/(?:required|must have|mandatory)[:\s]+([^\n.;]+)/gi) || [];
    const critical = criticalMatches.map(match =>
      match.replace(/^(?:required|must have|mandatory)[:\s]+/i, '').trim()
    );

    return { technical, soft, critical };
  }

  /**
   * Calculates skills match score
   */
  private calculateSkillsMatch(
    resumeSkills: string[],
    jobKeywords: { technical: string[]; soft: string[] }
  ): { score: number; matched: string[]; missing: string[] } {
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    const allJobSkills = [...jobKeywords.technical, ...jobKeywords.soft];

    const matched = allJobSkills.filter(skill =>
      resumeSkillsLower.some(rs => rs.includes(skill))
    );

    const missing = allJobSkills.filter(skill =>
      !resumeSkillsLower.some(rs => rs.includes(skill))
    );

    const score = allJobSkills.length > 0
      ? (matched.length / allJobSkills.length) * 100
      : 0;

    return { score, matched, missing };
  }

  /**
   * Calculates experience match score
   */
  private calculateExperienceMatch(
    resumeExperience: string[],
    jobDescription: string
  ): { score: number; matched: string[] } {
    const jobLower = jobDescription.toLowerCase();
    const experienceTerms = [
      'years of experience', 'yoe', 'experience with',
      'worked on', 'developed', 'managed', 'led',
    ];

    const matched = resumeExperience.filter(exp =>
      experienceTerms.some(term => exp.includes(term))
    );

    // Extract years of experience from job posting
    const yearsMatch = jobDescription.match(/(\d+)\+?\s*years?/i);
    const requiredYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;

    // Extract years from resume
    const resumeYearsMatches = resumeExperience
      .map(exp => exp.match(/(\d+)\+?\s*years?/i))
      .filter(Boolean);

    const resumeYears = resumeYearsMatches.length > 0
      ? Math.max(...resumeYearsMatches.map(m => parseInt(m![1])))
      : 0;

    const yearsScore = requiredYears > 0 && resumeYears >= requiredYears ? 100 : 50;
    const contentScore = resumeExperience.length > 0 ? (matched.length / resumeExperience.length) * 100 : 0;

    return {
      score: (yearsScore + contentScore) / 2,
      matched,
    };
  }

  /**
   * Calculates education match score
   */
  private calculateEducationMatch(
    resumeEducation: string[],
    jobDescription: string
  ): { score: number; matched: string[] } {
    const jobLower = jobDescription.toLowerCase();
    const degrees = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'bs', 'ms', 'mba'];

    const matched = resumeEducation.filter(edu =>
      degrees.some(degree => edu.includes(degree))
    );

    const hasRequiredDegree = degrees.some(degree => jobLower.includes(degree));
    const hasMatchingDegree = matched.length > 0;

    const score = !hasRequiredDegree ? 100 : (hasMatchingDegree ? 100 : 0);

    return { score, matched };
  }

  /**
   * Calculates ATS optimization score
   */
  private calculateAtsScore(resumeText: string, jobKeywords: string[]): number {
    const resumeLower = resumeText.toLowerCase();
    let score = 100;

    // Penalty for poor formatting indicators
    if (resumeLower.includes('│') || resumeLower.includes('┌')) score -= 20;
    if (resumeText.split('\n').some(line => line.length > 120)) score -= 10;

    // Bonus for keyword density
    const keywordCount = jobKeywords.filter(kw => resumeLower.includes(kw)).length;
    const keywordBonus = Math.min((keywordCount / jobKeywords.length) * 20, 20);
    score += keywordBonus;

    // Bonus for standard section headers
    const hasStandardSections = ['experience', 'education', 'skills'].every(
      section => resumeLower.includes(section)
    );
    if (hasStandardSections) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generates actionable recommendations
   */
  private generateRecommendations(
    result: Omit<ScoringResult, 'recommendations'>
  ): string[] {
    const recommendations: string[] = [];

    // Critical missing skills
    if (result.missingItems.criticalSkills.length > 0) {
      recommendations.push(
        `🔴 CRITICAL: Add these required skills: ${result.missingItems.criticalSkills.slice(0, 5).join(', ')}`
      );
    }

    // Skills improvements
    if (result.breakdown.skillsMatch < 70) {
      recommendations.push(
        `Add missing skills to your resume: ${result.missingItems.preferredSkills.slice(0, 5).join(', ')}`
      );
    }

    // Experience improvements
    if (result.breakdown.experienceMatch < 70) {
      recommendations.push(
        'Expand experience section with quantifiable achievements matching job requirements'
      );
    }

    // Keyword optimization
    if (result.breakdown.keywordMatch < 60) {
      recommendations.push(
        'Incorporate more job-specific keywords naturally throughout your resume'
      );
    }

    // ATS optimization
    if (result.atsOptimizationScore < 70) {
      recommendations.push(
        'Improve ATS compatibility: use standard section headers, avoid special characters, keep lines under 100 characters'
      );
    }

    // General recommendations
    if (result.overallScore >= 80) {
      recommendations.push(
        '✅ Strong match! Consider customizing your cover letter to highlight matched qualifications'
      );
    } else if (result.overallScore >= 60) {
      recommendations.push(
        '⚠️ Moderate match. Tailor your resume to emphasize relevant experience and skills'
      );
    } else {
      recommendations.push(
        '❌ Low match. Consider whether this role aligns with your experience or if significant upskilling is needed'
      );
    }

    return recommendations;
  }

  /**
   * Main scoring function
   */
  async scoreResume(
    resumeText: string,
    jobPosting: z.infer<typeof JobPostingSchema>
  ): Promise<ScoringResult> {
    // Validate inputs
    const validatedJob = JobPostingSchema.parse(jobPosting);

    // Parse resume
    const resumeSections = this.parseResume(resumeText);

    // Extract job keywords
    const jobKeywords = this.extractJobKeywords(
      validatedJob.description,
      validatedJob.requirements || []
    );

    // Calculate individual scores
    const skillsMatch = this.calculateSkillsMatch(
      resumeSections.skills,
      { technical: jobKeywords.technical, soft: jobKeywords.soft }
    );

    const experienceMatch = this.calculateExperienceMatch(
      resumeSections.experience,
      validatedJob.description
    );

    const educationMatch = this.calculateEducationMatch(
      resumeSections.education,
      validatedJob.description
    );

    // Keyword match (all keywords vs resume)
    const allKeywords = [...jobKeywords.technical, ...jobKeywords.soft];
    const resumeLower = resumeText.toLowerCase();
    const keywordMatches = allKeywords.filter(kw => resumeLower.includes(kw));
    const keywordScore = allKeywords.length > 0
      ? (keywordMatches.length / allKeywords.length) * 100
      : 0;

    // Calculate ATS score
    const atsScore = this.calculateAtsScore(resumeText, allKeywords);

    // Calculate overall score (weighted average)
    const overallScore = (
      skillsMatch.score * 0.35 +
      experienceMatch.score * 0.30 +
      educationMatch.score * 0.15 +
      keywordScore * 0.20
    );

    const result: Omit<ScoringResult, 'recommendations'> = {
      overallScore: Math.round(overallScore),
      breakdown: {
        skillsMatch: Math.round(skillsMatch.score),
        experienceMatch: Math.round(experienceMatch.score),
        educationMatch: Math.round(educationMatch.score),
        keywordMatch: Math.round(keywordScore),
      },
      matchedItems: {
        skills: skillsMatch.matched,
        experience: experienceMatch.matched,
        education: educationMatch.matched,
        keywords: keywordMatches,
      },
      missingItems: {
        criticalSkills: jobKeywords.critical,
        preferredSkills: skillsMatch.missing,
        qualifications: validatedJob.preferredQualifications || [],
      },
      atsOptimizationScore: Math.round(atsScore),
    };

    return {
      ...result,
      recommendations: this.generateRecommendations(result),
    };
  }

  /**
   * Batch score resume against multiple job postings
   */
  async scoreBatch(
    resumeText: string,
    jobPostings: z.infer<typeof JobPostingSchema>[]
  ): Promise<Array<ScoringResult & { jobTitle: string }>> {
    const results = await Promise.all(
      jobPostings.map(async job => {
        const score = await this.scoreResume(resumeText, job);
        return {
          ...score,
          jobTitle: job.title,
        };
      })
    );

    return results.sort((a, b) => b.overallScore - a.overallScore);
  }
}

export default ResumeScorerAgent;
