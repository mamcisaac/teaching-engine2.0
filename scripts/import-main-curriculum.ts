#!/usr/bin/env tsx

/**
 * Import Main French Curriculum
 * Focuses on the primary Grade 1 French Immersion curriculum document
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import * as pdfParse from 'pdf-parse';

const prisma = new PrismaClient();

async function importMainCurriculum() {
  console.log('🚀 Importing main Grade 1 French Immersion curriculum');
  
  try {
    // Target the main curriculum document
    const mainCurriculumFile = 'PR 2766 - Prog. Immersion 1re annÃ©e 5.30.19.pdf';
    const filePath = join(process.cwd(), 'resources', 'PE_Grade1_Fr', mainCurriculumFile);
    
    console.log(`📖 Processing: ${mainCurriculumFile}`);
    
    // Read and parse the PDF
    const fileBuffer = await readFile(filePath);
    const pdfData = await pdfParse.default(fileBuffer);
    
    console.log(`📄 PDF contains ${pdfData.numpages} pages`);
    console.log(`📝 Extracted ${pdfData.text.length} characters of text`);
    
    // Extract curriculum expectations from the text
    const expectations = extractExpectationsFromText(pdfData.text);
    
    console.log(`🎯 Found ${expectations.length} curriculum expectations`);
    
    // Import expectations into database
    let importedCount = 0;
    for (const expectation of expectations) {
      try {
        await prisma.curriculumExpectation.create({
          data: {
            code: expectation.code,
            description: expectation.description,
            descriptionFr: expectation.descriptionFr || expectation.description,
            strand: expectation.strand,
            strandFr: expectation.strandFr || expectation.strand,
            substrand: expectation.substrand,
            subject: expectation.subject,
            grade: 1,
            type: expectation.type || 'specific'
          }
        });
        importedCount++;
      } catch (error) {
        console.warn(`⚠️ Skipped duplicate expectation: ${expectation.code}`);
      }
    }
    
    console.log(`✅ Successfully imported ${importedCount} new curriculum expectations`);
    
    // Verify total count in database
    const totalCount = await prisma.curriculumExpectation.count();
    console.log(`🗄️ Database now contains ${totalCount} total curriculum expectations`);
    
    if (totalCount > 50) {
      console.log('🎉 SUCCESS: Database now has substantial curriculum data!');
    }
    
  } catch (error) {
    console.error('💥 Error importing curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Extract curriculum expectations from PDF text
 */
function extractExpectationsFromText(text: string) {
  const expectations = [];
  const lines = text.split('\n');
  
  let currentStrand = '';
  let currentSubject = 'Français langue première';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Detect strand/subject headers
    if (isStrandHeader(line)) {
      currentStrand = cleanStrandName(line);
      continue;
    }
    
    // Look for expectation codes (e.g., CO1, L1.1, É2.3)
    const expectationMatch = line.match(/^([A-ZÉ]+\d+(?:\.\d+)?)\s*[:-]?\s*(.+)/);
    if (expectationMatch) {
      const [, code, description] = expectationMatch;
      
      // Clean up the description
      const cleanDescription = description
        .replace(/\s+/g, ' ')
        .replace(/[""]/g, '"')
        .trim();
      
      if (cleanDescription && cleanDescription.length > 10) {
        expectations.push({
          code: code.trim(),
          description: cleanDescription,
          descriptionFr: cleanDescription, // Same for French immersion
          strand: currentStrand || 'Communication orale',
          strandFr: currentStrand || 'Communication orale',
          substrand: extractSubstrand(line),
          subject: currentSubject,
          type: code.includes('.') ? 'specific' : 'overall'
        });
      }
    }
  }
  
  // If we didn't find many expectations, try alternative parsing
  if (expectations.length < 10) {
    console.log('🔄 Trying alternative parsing approach...');
    return parseAlternativeFormat(text);
  }
  
  return expectations;
}

/**
 * Alternative parsing for different PDF formats
 */
function parseAlternativeFormat(text: string) {
  const expectations = [];
  
  // Look for bullet points or numbered items that might be expectations
  const bulletPatterns = [
    /•\s*(.+)/g,
    /-\s*(.+)/g,
    /\d+\.\s*(.+)/g,
    /[A-Z]\.\s*(.+)/g
  ];
  
  for (const pattern of bulletPatterns) {
    const matches = text.matchAll(pattern);
    let codeCounter = 1;
    
    for (const match of matches) {
      const description = match[1].trim();
      
      // Filter for educational content
      if (isLikelyExpectation(description)) {
        expectations.push({
          code: `FR1.${codeCounter}`,
          description: description,
          descriptionFr: description,
          strand: 'Français langue première',
          strandFr: 'Français langue première',
          subject: 'Français langue première',
          type: 'specific'
        });
        codeCounter++;
      }
    }
    
    if (expectations.length > 5) break; // Use the first successful pattern
  }
  
  return expectations;
}

/**
 * Check if a line is a strand/section header
 */
function isStrandHeader(line: string): boolean {
  const strandKeywords = [
    'communication orale',
    'lecture',
    'écriture',
    'mathématiques',
    'sciences',
    'études sociales',
    'éducation physique',
    'arts',
    'overall expectations',
    'specific expectations',
    'résultats d\'apprentissage'
  ];
  
  const lowerLine = line.toLowerCase();
  return strandKeywords.some(keyword => lowerLine.includes(keyword)) && line.length < 100;
}

/**
 * Clean strand name
 */
function cleanStrandName(line: string): string {
  return line
    .replace(/^\d+\.?\s*/, '') // Remove leading numbers
    .replace(/[:-]+$/, '') // Remove trailing colons/dashes
    .trim();
}

/**
 * Extract substrand if present
 */
function extractSubstrand(line: string): string | undefined {
  // Look for sub-categories in parentheses or after dashes
  const substrandMatch = line.match(/\(([^)]+)\)|[-–]\s*([^-–]+?)(?:\s|$)/);
  return substrandMatch ? (substrandMatch[1] || substrandMatch[2])?.trim() : undefined;
}

/**
 * Check if text looks like a curriculum expectation
 */
function isLikelyExpectation(text: string): boolean {
  if (text.length < 20 || text.length > 500) return false;
  
  const educationalKeywords = [
    'élève', 'apprenant', 'comprendre', 'identifier', 'utiliser', 'développer',
    'student', 'learn', 'understand', 'identify', 'use', 'develop',
    'communiquer', 'lire', 'écrire', 'compter', 'observer'
  ];
  
  const lowerText = text.toLowerCase();
  return educationalKeywords.some(keyword => lowerText.includes(keyword));
}

// Run the import if this script is executed directly
if (require.main === module) {
  importMainCurriculum()
    .then(() => {
      console.log('\n🎯 Main curriculum import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import failed:', error);
      process.exit(1);
    });
}