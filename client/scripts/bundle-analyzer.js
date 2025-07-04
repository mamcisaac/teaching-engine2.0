#!/usr/bin/env node

/**
 * Bundle Analysis Script for Teaching Engine 2.0
 * Analyzes Vite build output and provides insights on bundle size and code splitting
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '../dist');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getFileStats(dirPath, extensions = ['.js', '.css']) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await getFileStats(fullPath, extensions);
        files.push(...subFiles);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        const stats = await fs.stat(fullPath);
        files.push({
          name: entry.name,
          path: fullPath.replace(distPath, ''),
          size: stats.size,
          type: entry.name.endsWith('.js') ? 'js' : 'css'
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
  
  return files;
}

function analyzeFiles(files) {
  const analysis = {
    total: { count: 0, size: 0 },
    js: { count: 0, size: 0, files: [] },
    css: { count: 0, size: 0, files: [] },
    chunks: [],
    lazy: [],
    vendor: []
  };

  files.forEach(file => {
    analysis.total.count++;
    analysis.total.size += file.size;
    
    if (file.type === 'js') {
      analysis.js.count++;
      analysis.js.size += file.size;
      analysis.js.files.push(file);
      
      // Categorize JS files
      if (file.name.includes('vendor') || file.name.includes('node_modules')) {
        analysis.vendor.push(file);
      } else if (file.name.includes('lazy') || file.name.includes('chunk')) {
        analysis.lazy.push(file);
      } else if (file.name.includes('index') || file.name.includes('main')) {
        analysis.chunks.push(file);
      }
    } else if (file.type === 'css') {
      analysis.css.count++;
      analysis.css.size += file.size;
      analysis.css.files.push(file);
    }
  });

  // Sort files by size
  analysis.js.files.sort((a, b) => b.size - a.size);
  analysis.css.files.sort((a, b) => b.size - a.size);

  return analysis;
}

function generateRecommendations(analysis) {
  const recommendations = [];
  const mainBundle = analysis.js.files.find(f => f.name.includes('index') || f.name.includes('main'));
  
  if (mainBundle && mainBundle.size > 1024 * 1024) { // > 1MB
    recommendations.push({
      type: 'warning',
      message: 'Main bundle is larger than 1MB. Consider code splitting.',
      details: `Main bundle: ${formatBytes(mainBundle.size)}`
    });
  }
  
  if (analysis.js.files.length < 3) {
    recommendations.push({
      type: 'info',
      message: 'Consider implementing more code splitting for better caching.',
      details: 'Separate vendor code and lazy load heavy components.'
    });
  }
  
  if (analysis.lazy.length === 0) {
    recommendations.push({
      type: 'warning',
      message: 'No lazy-loaded chunks detected. Implement lazy loading for better performance.',
      details: 'Use React.lazy() and dynamic imports for route-based and component-based code splitting.'
    });
  }
  
  const largeFiles = analysis.js.files.filter(f => f.size > 500 * 1024); // > 500KB
  if (largeFiles.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `Found ${largeFiles.length} large JavaScript files (>500KB).`,
      details: largeFiles.map(f => `${f.name}: ${formatBytes(f.size)}`).join('\n  ')
    });
  }
  
  return recommendations;
}

function printReport(analysis) {
  console.log('\n' + colorize('📊 Bundle Analysis Report', 'cyan'));
  console.log(colorize('='.repeat(50), 'cyan'));
  
  // Overview
  console.log('\n' + colorize('📋 Overview', 'blue'));
  console.log(`Total files: ${analysis.total.count}`);
  console.log(`Total size: ${colorize(formatBytes(analysis.total.size), 'green')}`);
  console.log(`JavaScript: ${analysis.js.count} files (${colorize(formatBytes(analysis.js.size), 'green')})`);
  console.log(`CSS: ${analysis.css.count} files (${colorize(formatBytes(analysis.css.size), 'green')})`);
  
  // JavaScript files breakdown
  console.log('\n' + colorize('📄 JavaScript Files (Top 10)', 'blue'));
  analysis.js.files.slice(0, 10).forEach(file => {
    const sizeColor = file.size > 1024 * 1024 ? 'red' : file.size > 500 * 1024 ? 'yellow' : 'green';
    console.log(`  ${file.name.padEnd(40)} ${colorize(formatBytes(file.size), sizeColor)}`);
  });
  
  // Code splitting analysis
  console.log('\n' + colorize('🔄 Code Splitting Analysis', 'blue'));
  console.log(`Main chunks: ${analysis.chunks.length}`);
  console.log(`Lazy chunks: ${analysis.lazy.length}`);
  console.log(`Vendor chunks: ${analysis.vendor.length}`);
  
  if (analysis.lazy.length > 0) {
    console.log('\n' + colorize('  Lazy-loaded chunks:', 'magenta'));
    analysis.lazy.forEach(file => {
      console.log(`    ${file.name} (${formatBytes(file.size)})`);
    });
  }
  
  // CSS files
  if (analysis.css.files.length > 0) {
    console.log('\n' + colorize('🎨 CSS Files', 'blue'));
    analysis.css.files.forEach(file => {
      console.log(`  ${file.name.padEnd(40)} ${colorize(formatBytes(file.size), 'green')}`);
    });
  }
}

function printRecommendations(recommendations) {
  if (recommendations.length === 0) {
    console.log('\n' + colorize('✅ No recommendations - bundle looks good!', 'green'));
    return;
  }
  
  console.log('\n' + colorize('💡 Recommendations', 'yellow'));
  console.log(colorize('='.repeat(50), 'yellow'));
  
  recommendations.forEach((rec, index) => {
    const icon = rec.type === 'warning' ? '⚠️' : 'ℹ️';
    const color = rec.type === 'warning' ? 'yellow' : 'blue';
    
    console.log(`\n${index + 1}. ${icon} ${colorize(rec.message, color)}`);
    if (rec.details) {
      console.log(`   ${rec.details}`);
    }
  });
}

async function runBundleAnalysis() {
  try {
    console.log(colorize('🚀 Starting bundle analysis...', 'cyan'));
    
    // Check if dist directory exists
    try {
      await fs.access(distPath);
    } catch {
      console.log(colorize('⚠️  No dist directory found. Running build first...', 'yellow'));
      execSync('npm run build', { stdio: 'inherit', cwd: join(__dirname, '..') });
    }
    
    // Get all relevant files
    const files = await getFileStats(distPath);
    
    if (files.length === 0) {
      console.log(colorize('❌ No build files found. Please run `npm run build` first.', 'red'));
      process.exit(1);
    }
    
    // Analyze files
    const analysis = analyzeFiles(files);
    
    // Generate recommendations
    const recommendations = generateRecommendations(analysis);
    
    // Print results
    printReport(analysis);
    printRecommendations(recommendations);
    
    // Performance score
    const performanceScore = calculatePerformanceScore(analysis);
    console.log('\n' + colorize('📈 Performance Score', 'cyan'));
    console.log(colorize('='.repeat(50), 'cyan'));
    
    const scoreColor = performanceScore >= 90 ? 'green' : performanceScore >= 70 ? 'yellow' : 'red';
    console.log(`Bundle Performance: ${colorize(performanceScore + '/100', scoreColor)}`);
    
    console.log('\n' + colorize('✨ Analysis complete!', 'green'));
    
  } catch (error) {
    console.error(colorize('❌ Error during bundle analysis:', 'red'), error.message);
    process.exit(1);
  }
}

function calculatePerformanceScore(analysis) {
  let score = 100;
  
  // Penalize large main bundle
  const mainBundle = analysis.js.files.find(f => f.name.includes('index') || f.name.includes('main'));
  if (mainBundle) {
    if (mainBundle.size > 2 * 1024 * 1024) score -= 30; // > 2MB
    else if (mainBundle.size > 1024 * 1024) score -= 20; // > 1MB
    else if (mainBundle.size > 500 * 1024) score -= 10; // > 500KB
  }
  
  // Reward code splitting
  if (analysis.lazy.length === 0) score -= 20;
  else if (analysis.lazy.length < 3) score -= 10;
  else score += 10; // Bonus for good splitting
  
  // Penalize too many small files (over-splitting)
  const smallFiles = analysis.js.files.filter(f => f.size < 10 * 1024); // < 10KB
  if (smallFiles.length > 5) score -= 10;
  
  // Reward vendor separation
  if (analysis.vendor.length > 0) score += 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Run the analysis
runBundleAnalysis();