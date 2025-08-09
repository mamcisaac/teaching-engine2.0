#!/usr/bin/env node

/**
 * Chunked PDF Extraction Script for PEI Grade 1 Curriculum
 * 
 * Purpose: Extract curriculum expectations from large PDFs by processing them in chunks
 * Specifically designed for PR 2766 and other large curriculum documents
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for PR 2766 - Main Program Document
const PR2766_SECTIONS = [
  {
    subject: 'Français langue première',
    keywords: ['français', 'communication orale', 'lecture', 'écriture'],
    expectedCount: 15
  },
  {
    subject: 'Mathématiques',
    keywords: ['mathématiques', 'nombres', 'géométrie', 'mesure', 'statistiques'],
    expectedCount: 20
  },
  {
    subject: 'Sciences de la nature',
    keywords: ['sciences', 'vivants', 'matière', 'énergie', 'univers'],
    expectedCount: 10
  },
  {
    subject: 'Sciences humaines',
    keywords: ['sciences humaines', 'société', 'histoire', 'géographie', 'citoyenneté'],
    expectedCount: 8
  },
  {
    subject: 'Arts',
    keywords: ['arts visuels', 'musique', 'danse', 'théâtre', 'arts'],
    expectedCount: 10
  },
  {
    subject: 'Formation personnelle et sociale',
    keywords: ['formation personnelle', 'santé', 'bien-être', 'relations'],
    expectedCount: 8
  }
];

// Template for extracted expectations
const EXPECTATION_TEMPLATE = {
  code: '',
  description: '',
  subject: '',
  strand: '',
  source: '',
  examples: ''
};

/**
 * Create extraction instructions for a specific section
 */
function createSectionPrompt(section, documentName) {
  return `
Extract Grade 1 curriculum expectations for ${section.subject} from this PDF.

Look for:
- Learning outcomes/expectations that start with codes like "1.1.1" or similar
- RAFs (Résultats d'apprentissage) for Grade 1/${section.subject}
- Keywords: ${section.keywords.join(', ')}

For each expectation found, extract:
1. Code (e.g., "1.1.1", "CO1", etc.)
2. Full description text
3. Subject: ${section.subject}
4. Strand/domain if mentioned
5. Examples or indicators if provided

Expected to find approximately ${section.expectedCount} expectations in this section.

Return as JSON array with this structure:
{
  "subject": "${section.subject}",
  "expectations": [
    {
      "code": "...",
      "description": "...",
      "subject": "${section.subject}",
      "strand": "...",
      "source": "${documentName}",
      "examples": "..."
    }
  ]
}

IMPORTANT: Only extract actual text from the document. Do not create or assume any expectations.
`;
}

/**
 * Save extraction results to file
 */
function saveExtraction(filename, data) {
  const outputPath = path.join(__dirname, '..', filename);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved extraction to ${filename}`);
  return outputPath;
}

/**
 * Load existing extraction if available
 */
function loadExistingExtraction(filename) {
  const filePath = path.join(__dirname, '..', filename);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`📄 Loaded existing extraction from ${filename}`);
    return data;
  }
  return null;
}

/**
 * Merge multiple extraction files
 */
function mergeExtractions(files) {
  const merged = {
    metadata: {
      extractionDate: new Date().toISOString(),
      method: 'chunked',
      files: files
    },
    expectations: []
  };

  files.forEach(file => {
    const data = loadExistingExtraction(file);
    if (data && data.expectations) {
      merged.expectations.push(...data.expectations);
    }
  });

  // Remove duplicates based on code + description
  const unique = new Map();
  merged.expectations.forEach(exp => {
    const key = `${exp.code}_${exp.description}`;
    if (!unique.has(key)) {
      unique.set(key, exp);
    }
  });

  merged.expectations = Array.from(unique.values());
  merged.metadata.totalExpectations = merged.expectations.length;

  return merged;
}

/**
 * Update extraction status file
 */
function updateStatus(document, status, expectations = 0, notes = '') {
  const statusFile = path.join(__dirname, '..', 'CURRICULUM_EXTRACTION_STATUS.md');
  
  if (fs.existsSync(statusFile)) {
    let content = fs.readFileSync(statusFile, 'utf-8');
    
    // Update the specific document line
    const lines = content.split('\n');
    const docIndex = lines.findIndex(line => line.includes(document));
    
    if (docIndex > -1) {
      // Parse existing line to update status
      const parts = lines[docIndex].split('|').map(p => p.trim());
      if (parts.length >= 7) {
        parts[1] = ` ${status} `;
        parts[5] = ` ${expectations} `;
        if (notes) {
          parts[6] = ` ${notes} `;
        }
        lines[docIndex] = parts.join('|');
      }
    }
    
    fs.writeFileSync(statusFile, lines.join('\n'));
    console.log(`📊 Updated status for ${document}: ${status}`);
  }
}

/**
 * Main extraction orchestrator
 */
async function extractPR2766() {
  console.log('🚀 Starting chunked extraction for PR 2766...\n');
  
  const documentName = 'PR 2766 - Prog. Immersion 1re année 5.30.19.pdf';
  const extractionFiles = [];
  let totalExpectations = 0;

  // Update status to in progress
  updateStatus(documentName, '🔄 In Progress', 0, 'Chunked extraction started');

  // Process each section
  for (const section of PR2766_SECTIONS) {
    const outputFile = `extraction_pr2766_${section.subject.toLowerCase().replace(/\s+/g, '_')}.json`;
    
    console.log(`\n📖 Processing section: ${section.subject}`);
    console.log(`   Expected: ~${section.expectedCount} expectations`);
    
    // Check if already extracted
    const existing = loadExistingExtraction(outputFile);
    if (existing) {
      console.log(`   ✅ Already extracted: ${existing.expectations?.length || 0} expectations`);
      extractionFiles.push(outputFile);
      totalExpectations += existing.expectations?.length || 0;
      continue;
    }

    // Create extraction prompt
    const prompt = createSectionPrompt(section, documentName);
    
    // Save prompt for reference
    const promptFile = outputFile.replace('.json', '_prompt.txt');
    fs.writeFileSync(path.join(__dirname, '..', promptFile), prompt);
    
    console.log(`   📝 Prompt saved to ${promptFile}`);
    console.log(`   ⏳ Ready for extraction (use Task tool with this prompt)`);
    
    // Note: Actual extraction will be done via Task tool
    // This script prepares the prompts and manages the results
    
    extractionFiles.push(outputFile);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 Extraction Plan Summary:');
  console.log(`   Document: ${documentName}`);
  console.log(`   Sections: ${PR2766_SECTIONS.length}`);
  console.log(`   Expected total: ~68 expectations`);
  console.log(`   Existing extractions: ${totalExpectations} expectations`);
  console.log('='.repeat(60));

  // If all sections are complete, merge them
  const allComplete = extractionFiles.every(file => loadExistingExtraction(file));
  if (allComplete) {
    console.log('\n✅ All sections extracted! Merging results...');
    const merged = mergeExtractions(extractionFiles);
    saveExtraction('extraction_pr2766_complete.json', merged);
    
    // Update status to complete
    updateStatus(documentName, '✅ Complete', merged.metadata.totalExpectations, 
                 `Chunked extraction complete - ${merged.metadata.totalExpectations} expectations`);
    
    console.log(`\n🎉 Extraction complete! Total expectations: ${merged.metadata.totalExpectations}`);
  } else {
    console.log('\n⏳ Sections pending extraction. Run Task tool with the generated prompts.');
  }
}

/**
 * Extract from other large documents
 */
async function extractLargeDocument(documentPath, documentName) {
  console.log(`\n📚 Preparing extraction for: ${documentName}`);
  
  const sections = [
    {
      subject: 'All Grade 1 Content',
      keywords: ['Grade 1', 'Grade One', 'Primary', 'première année'],
      expectedCount: 10
    }
  ];

  const outputFile = `extraction_${documentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
  
  // Check if already extracted
  const existing = loadExistingExtraction(outputFile);
  if (existing) {
    console.log(`✅ Already extracted: ${existing.expectations?.length || 0} expectations`);
    return existing;
  }

  // Create prompt
  const prompt = createSectionPrompt(sections[0], documentName);
  const promptFile = outputFile.replace('.json', '_prompt.txt');
  fs.writeFileSync(path.join(__dirname, '..', promptFile), prompt);
  
  console.log(`📝 Prompt saved to ${promptFile}`);
  console.log(`⏳ Ready for extraction (use Task tool with this prompt)`);
  
  return null;
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'pr2766') {
  extractPR2766();
} else if (command === 'health') {
  extractLargeDocument(
    'resources/PE_Grade1_Fr/Grade 1 Health Curriculum.pdf',
    'Grade 1 Health Curriculum.pdf'
  );
} else if (command === 'pe') {
  extractLargeDocument(
    'resources/PE_Grade1_Fr/K-6 Physical Education Curriculum.pdf',
    'K-6 Physical Education Curriculum.pdf'
  );
} else if (command === 'merge') {
  // Merge all extraction files
  const allFiles = fs.readdirSync(path.join(__dirname, '..'))
    .filter(f => f.startsWith('extraction_') && f.endsWith('.json'));
  
  const merged = mergeExtractions(allFiles);
  saveExtraction('MERGED_ALL_EXPECTATIONS.json', merged);
  
  console.log(`\n✅ Merged ${allFiles.length} files`);
  console.log(`📊 Total unique expectations: ${merged.metadata.totalExpectations}`);
} else {
  console.log(`
PEI Grade 1 Curriculum - Chunked Extraction Tool

Usage:
  node extract-chunked.js pr2766    - Extract from main program document
  node extract-chunked.js health    - Extract from Health curriculum
  node extract-chunked.js pe        - Extract from Physical Education
  node extract-chunked.js merge     - Merge all extraction files

This script prepares extraction prompts for large PDF documents.
Use the generated prompts with the Task tool to perform actual extraction.
  `);
}