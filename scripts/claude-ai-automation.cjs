#!/usr/bin/env node
/**
 * CLAUDE.AI BROWSER AUTOMATION
 * Uses Puppeteer to generate lessons via Claude.ai with Max subscription
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  claudeUrl: 'https://claude.ai',
  promptsPath: path.join(__dirname, '../lessons/prompts/all-prompts-perfect.json'),
  outputPath: path.join(__dirname, '../lessons/generated'),
  progressPath: path.join(__dirname, '../lessons/progress.json'),
  
  // Rate limiting to respect Claude's limits
  delayBetweenPrompts: 5000, // 5 seconds between prompts
  delayBetweenUnits: 30000, // 30 seconds between units
  maxPromptsPerSession: 50, // Start new conversation after 50 prompts
  
  // Timeouts
  responseTimeout: 60000, // 60 seconds for Claude to respond
  typingDelay: 50, // Delay between keystrokes (ms)
  
  // Selectors (may need updating based on Claude's UI)
  selectors: {
    newChatButton: '[aria-label="New chat"]',
    messageInput: 'textarea[placeholder*="Message"]',
    sendButton: '[aria-label="Send message"]',
    responseContainer: '[data-testid="message-content"]',
    stopButton: '[aria-label="Stop generating"]'
  }
};

/**
 * Load or create progress tracking
 */
function loadProgress() {
  if (fs.existsSync(CONFIG.progressPath)) {
    return JSON.parse(fs.readFileSync(CONFIG.progressPath, 'utf-8'));
  }
  return {
    completedPrompts: [],
    currentSubject: null,
    currentUnit: null,
    currentLesson: null,
    startedAt: new Date().toISOString(),
    stats: {
      total: 0,
      completed: 0,
      failed: 0,
      skipped: 0
    }
  };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  fs.writeFileSync(CONFIG.progressPath, JSON.stringify(progress, null, 2));
}

/**
 * Type text with human-like delay
 */
async function typeWithDelay(page, text, selector) {
  await page.focus(selector);
  await page.evaluate(selector => {
    document.querySelector(selector).value = '';
  }, selector);
  
  for (const char of text) {
    await page.type(selector, char);
    await page.waitForTimeout(CONFIG.typingDelay);
  }
}

/**
 * Wait for Claude's response to complete
 */
async function waitForResponse(page) {
  // Wait for response to start
  await page.waitForSelector(CONFIG.selectors.responseContainer, {
    timeout: CONFIG.responseTimeout
  });
  
  // Wait for response to complete (no stop button visible)
  await page.waitForFunction(
    selector => !document.querySelector(selector),
    { timeout: CONFIG.responseTimeout },
    CONFIG.selectors.stopButton
  );
  
  // Additional wait to ensure complete
  await page.waitForTimeout(2000);
}

/**
 * Extract Claude's response
 */
async function extractResponse(page) {
  const responses = await page.$$eval(CONFIG.selectors.responseContainer, elements => {
    // Get the last response (most recent from Claude)
    const lastResponse = elements[elements.length - 1];
    return lastResponse ? lastResponse.innerText : '';
  });
  
  return responses;
}

/**
 * Create assessment prompt for the generated lesson
 */
function createAssessmentPrompt(lesson) {
  return `Please critically assess the lesson you just created and verify it meets ALL these requirements:

CRITICAL CHECKLIST:
☐ Duration is EXACTLY 45 minutes (8 min Minds On, 27 min Action, 10 min Consolidation)
☐ Contains EXACTLY the required number of vocabulary terms with gestures and visual cues
☐ Includes observable assessment with checkboxes
☐ Has differentiation for all 4 learner profiles
☐ Contains authentic Mi'kmaq perspective (100+ characters)
☐ Includes movement activity
☐ Uses only standard Grade 1 classroom materials
☐ Language instruction percentage matches requirement
☐ Safety protocols are addressed
☐ Builds on prior knowledge appropriately

If ANY requirement is not fully met, please provide an IMPROVED version that addresses all issues.
Otherwise, confirm the lesson is PERFECT by stating "LESSON VERIFIED: All requirements met."`;
}

/**
 * Process a single prompt
 */
async function processPrompt(page, promptData, progress) {
  const promptId = promptData.id;
  
  // Check if already completed
  if (progress.completedPrompts.includes(promptId)) {
    console.log(`    ⏭️  Skipping ${promptId} (already completed)`);
    progress.stats.skipped++;
    return null;
  }
  
  console.log(`    📝 Processing ${promptId}...`);
  
  try {
    // Send the prompt
    await typeWithDelay(page, promptData.prompt, CONFIG.selectors.messageInput);
    await page.click(CONFIG.selectors.sendButton);
    
    // Wait for response
    await waitForResponse(page);
    const initialResponse = await extractResponse(page);
    
    // Send assessment prompt
    await typeWithDelay(page, createAssessmentPrompt(initialResponse), CONFIG.selectors.messageInput);
    await page.click(CONFIG.selectors.sendButton);
    
    // Wait for assessment response
    await waitForResponse(page);
    const assessmentResponse = await extractResponse(page);
    
    // Determine if we need iteration
    let finalResponse = initialResponse;
    if (!assessmentResponse.includes('LESSON VERIFIED')) {
      console.log(`      🔄 Lesson needs improvement, using revised version...`);
      finalResponse = assessmentResponse;
    }
    
    // Save the lesson
    const lesson = {
      id: promptId,
      subject: promptData.subject,
      unitPlanId: promptData.unitPlanId,
      unitTitle: promptData.unitTitle,
      lessonNumber: promptData.lessonNumber,
      totalLessonsInUnit: promptData.totalLessonsInUnit,
      month: promptData.month,
      lessonType: promptData.lessonType,
      generatedAt: new Date().toISOString(),
      prompt: promptData.prompt,
      response: finalResponse,
      verified: assessmentResponse.includes('LESSON VERIFIED')
    };
    
    // Save to file
    const subjectDir = promptData.subject.toLowerCase().replace(/[éèç() ]/g, '-');
    const outputDir = path.join(CONFIG.outputPath, subjectDir);
    fs.mkdirSync(outputDir, { recursive: true });
    
    const filename = path.join(outputDir, `${promptId}.json`);
    fs.writeFileSync(filename, JSON.stringify(lesson, null, 2));
    
    // Update progress
    progress.completedPrompts.push(promptId);
    progress.stats.completed++;
    saveProgress(progress);
    
    console.log(`      ✅ Saved lesson ${promptId}`);
    
    // Rate limiting
    await page.waitForTimeout(CONFIG.delayBetweenPrompts);
    
    return lesson;
    
  } catch (error) {
    console.error(`      ❌ Error processing ${promptId}:`, error.message);
    progress.stats.failed++;
    saveProgress(progress);
    return null;
  }
}

/**
 * Start a new conversation
 */
async function startNewConversation(page) {
  console.log('  🔄 Starting new conversation...');
  
  try {
    await page.click(CONFIG.selectors.newChatButton);
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('  ⚠️  Could not find new chat button, continuing...');
  }
}

/**
 * Main automation function
 */
async function automateGeneration() {
  console.log('🤖 CLAUDE.AI LESSON GENERATION AUTOMATION');
  console.log('=' .repeat(60));
  console.log('⚠️  IMPORTANT: This script requires you to be logged into Claude.ai');
  console.log('Please log in manually when the browser opens.\n');
  
  // Load prompts and progress
  const allPrompts = JSON.parse(fs.readFileSync(CONFIG.promptsPath, 'utf-8'));
  const progress = loadProgress();
  
  // Calculate total prompts
  let totalPrompts = 0;
  for (const subject of Object.values(allPrompts)) {
    totalPrompts += subject.length;
  }
  
  progress.stats.total = totalPrompts;
  console.log(`📊 Total prompts to process: ${totalPrompts}`);
  console.log(`✅ Already completed: ${progress.completedPrompts.length}`);
  console.log(`📋 Remaining: ${totalPrompts - progress.completedPrompts.length}\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Must be false to allow manual login
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.goto(CONFIG.claudeUrl);
  
  // Wait for manual login
  console.log('👤 Please log into Claude.ai in the opened browser...');
  console.log('Press Enter when ready to continue...');
  
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('\n🚀 Starting automated generation...\n');
  
  let promptsInSession = 0;
  
  // Process each subject
  for (const [subject, subjectPrompts] of Object.entries(allPrompts)) {
    console.log(`\n📚 Processing ${subject} (${subjectPrompts.length} lessons)...`);
    
    // Group by unit
    const unitGroups = {};
    for (const prompt of subjectPrompts) {
      if (!unitGroups[prompt.unitPlanId]) {
        unitGroups[prompt.unitPlanId] = [];
      }
      unitGroups[prompt.unitPlanId].push(prompt);
    }
    
    // Process each unit
    for (const [unitId, unitPrompts] of Object.entries(unitGroups)) {
      const unitTitle = unitPrompts[0].unitTitle;
      console.log(`\n  📂 Unit: ${unitTitle} (${unitPrompts.length} lessons)`);
      
      // Start new conversation for each unit
      await startNewConversation(page);
      promptsInSession = 0;
      
      // Process each lesson in unit
      for (const prompt of unitPrompts) {
        // Check if we need a new conversation
        if (promptsInSession >= CONFIG.maxPromptsPerSession) {
          await startNewConversation(page);
          promptsInSession = 0;
        }
        
        await processPrompt(page, prompt, progress);
        promptsInSession++;
      }
      
      // Delay between units
      console.log(`  ⏱️  Waiting before next unit...`);
      await page.waitForTimeout(CONFIG.delayBetweenUnits);
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ AUTOMATION COMPLETE!');
  console.log(`📊 Statistics:`);
  console.log(`  - Total: ${progress.stats.total}`);
  console.log(`  - Completed: ${progress.stats.completed}`);
  console.log(`  - Skipped: ${progress.stats.skipped}`);
  console.log(`  - Failed: ${progress.stats.failed}`);
  console.log('='.repeat(60));
  
  // Keep browser open for review
  console.log('\n📋 Browser will remain open for review.');
  console.log('Press Enter to close...');
  
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  automateGeneration().catch(console.error);
}

module.exports = { processPrompt, createAssessmentPrompt };