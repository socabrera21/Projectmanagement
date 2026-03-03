#!/usr/bin/env node
/**
 * API Testing Utility
 * Tests all configured job board APIs and displays status
 */

import { JobBoardAPIManager } from '../src/integrations/job-board-apis';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAPIs() {
  console.log('═'.repeat(70));
  console.log('JOB BOARD API CONFIGURATION TEST');
  console.log('═'.repeat(70));
  console.log();

  const manager = new JobBoardAPIManager();

  // Check configuration status
  console.log('API Configuration Status:');
  console.log('─'.repeat(70));
  console.log();

  const status = manager.getStatus();

  status.forEach(api => {
    const icon = api.configured ? '✅' : '❌';
    const freeIcon = api.free ? '🆓' : '💰';

    console.log(`${icon} ${freeIcon} ${api.name}`);
    console.log(`   Status: ${api.configured ? 'Configured' : 'Not Configured'}`);
    console.log(`   ${api.notes}`);
    console.log();
  });

  const configured = manager.getConfiguredAPIs();
  const unconfigured = manager.getUnconfiguredAPIs();

  console.log('─'.repeat(70));
  console.log(`Configured APIs: ${configured.length}`);
  console.log(`Unconfigured APIs: ${unconfigured.length}`);
  console.log();

  if (configured.length === 0) {
    console.log('⚠️  No APIs configured!');
    console.log();
    console.log('Quick Start:');
    console.log('1. Copy .env.example to .env');
    console.log('   cp .env.example .env');
    console.log();
    console.log('2. Get free Adzuna API key (takes 2 minutes):');
    console.log('   https://developer.adzuna.com/');
    console.log();
    console.log('3. Add to .env:');
    console.log('   ADZUNA_APP_ID=your_id');
    console.log('   ADZUNA_APP_KEY=your_key');
    console.log();
    console.log('See docs/API-SETUP-GUIDE.md for detailed instructions');
    console.log('═'.repeat(70));
    return;
  }

  // Test each configured API
  console.log('═'.repeat(70));
  console.log('TESTING CONFIGURED APIS');
  console.log('═'.repeat(70));
  console.log();

  const testParams = {
    keywords: 'software engineer',
    location: 'remote',
    maxResults: 5,
  };

  console.log('Test Search Parameters:');
  console.log(`  Keywords: ${testParams.keywords}`);
  console.log(`  Location: ${testParams.location}`);
  console.log(`  Max Results: ${testParams.maxResults}`);
  console.log();
  console.log('─'.repeat(70));
  console.log();

  for (const apiName of configured) {
    try {
      console.log(`Testing ${apiName}...`);

      const startTime = Date.now();
      const results = await manager.searchAPI(apiName, testParams);
      const duration = Date.now() - startTime;

      console.log(`✅ ${apiName}: SUCCESS`);
      console.log(`   Found: ${results.length} jobs`);
      console.log(`   Response time: ${duration}ms`);

      if (results.length > 0) {
        const sample = results[0];
        console.log(`   Sample: ${sample.title} at ${sample.company}`);
      }

      console.log();
    } catch (error) {
      console.log(`❌ ${apiName}: FAILED`);
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
    }
  }

  // Test searching all APIs at once
  if (configured.length > 1) {
    console.log('─'.repeat(70));
    console.log('Testing all APIs together (parallel search)...');
    console.log();

    try {
      const startTime = Date.now();
      const allResults = await manager.searchAll(testParams);
      const duration = Date.now() - startTime;

      console.log(`✅ Combined Search: SUCCESS`);
      console.log(`   Total jobs found: ${allResults.length}`);
      console.log(`   Total time: ${duration}ms`);
      console.log(`   Average per API: ${Math.round(duration / configured.length)}ms`);
      console.log();

      // Show breakdown by source
      const bySource = allResults.reduce((acc, job) => {
        acc[job.source] = (acc[job.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('   Results by source:');
      Object.entries(bySource).forEach(([source, count]) => {
        console.log(`     ${source}: ${count} jobs`);
      });
      console.log();

    } catch (error) {
      console.log(`❌ Combined Search: FAILED`);
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
    }
  }

  // Summary
  console.log('═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  console.log();

  if (configured.length >= 3) {
    console.log('🎉 Great! You have multiple job boards configured.');
    console.log('   You can now search thousands of jobs.');
    console.log();
  } else if (configured.length > 0) {
    console.log('✅ Good start! You have some APIs configured.');
    console.log('   Consider adding more for better coverage.');
    console.log();
  }

  if (unconfigured.length > 0) {
    console.log('💡 Tip: Add more APIs for better job coverage:');
    console.log();

    unconfigured.forEach(name => {
      const apiInfo = status.find(s => s.name.toLowerCase() === name);
      if (apiInfo && apiInfo.free) {
        console.log(`   • ${apiInfo.name} (Free) - ${apiInfo.notes}`);
      }
    });
    console.log();
    console.log('   See docs/API-SETUP-GUIDE.md for instructions');
  }

  console.log('═'.repeat(70));
  console.log();

  console.log('Next Steps:');
  console.log('1. Run a real job search:');
  console.log('   npm run search -- --keywords "your job title" --location "your city"');
  console.log();
  console.log('2. Score jobs against your resume:');
  console.log('   npm run score-jobs -- --resume ./my-resume.txt');
  console.log();
  console.log('3. See all available commands:');
  console.log('   npm run help');
  console.log();
  console.log('═'.repeat(70));
}

// Run tests
testAPIs().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
