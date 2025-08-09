#!/usr/bin/env node

/**
 * PDF Text Extraction Script for Large Curriculum Documents
 * 
 * Purpose: Extract text from PDFs that are too large for direct LLM processing
 * Created after synthetic data incident on 2025-08-08
 * 
 * This script extracts text from PDFs and saves it to smaller chunk files
 * that can be processed without causing context overflow.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CHUNK_SIZE = 10; // Pages per chunk
const OUTPUT_DIR = path.join(__dirname, '..', 'pdf-text-chunks');

// Main extraction function
async function extractPdfText(pdfPath, outputPrefix) {
  try {
    console.log(`📄 Reading PDF: ${pdfPath}`);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ File not found: ${pdfPath}`);
      return;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer, {
      // Options to extract text page by page
      pagerender: function(pageData) {
        return pageData.getTextContent().then(function(textContent) {
          let text = '';
          for (let item of textContent.items) {
            text += item.str + ' ';
          }
          return text;
        });
      }
    });

    console.log(`📊 PDF Info:`);
    console.log(`   Total pages: ${data.numpages}`);
    console.log(`   Text length: ${data.text.length} characters`);

    // Split text into chunks
    const pages = data.text.split('\n\n'); // Rough page splitting
    const chunks = [];
    
    for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
      const chunk = pages.slice(i, i + CHUNK_SIZE).join('\n\n');
      chunks.push(chunk);
    }

    console.log(`📦 Creating ${chunks.length} text chunks...`);

    // Save chunks to files
    chunks.forEach((chunk, index) => {
      const chunkFile = path.join(OUTPUT_DIR, `${outputPrefix}_chunk_${index + 1}.txt`);
      fs.writeFileSync(chunkFile, chunk, 'utf8');
      console.log(`   ✅ Saved: ${chunkFile} (${chunk.length} chars)`);
    });

    // Save metadata
    const metadata = {
      source: pdfPath,
      extractionDate: new Date().toISOString(),
      totalPages: data.numpages,
      totalChunks: chunks.length,
      chunkSize: CHUNK_SIZE,
      chunks: chunks.map((chunk, index) => ({
        file: `${outputPrefix}_chunk_${index + 1}.txt`,
        size: chunk.length,
        pageRange: `${index * CHUNK_SIZE + 1}-${Math.min((index + 1) * CHUNK_SIZE, data.numpages)}`
      }))
    };

    const metadataFile = path.join(OUTPUT_DIR, `${outputPrefix}_metadata.json`);
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    console.log(`\n📋 Metadata saved to: ${metadataFile}`);

    console.log(`\n✅ Extraction complete!`);
    console.log(`   Text chunks saved to: ${OUTPUT_DIR}`);
    console.log(`   You can now process each chunk with Claude without context overflow.`);

  } catch (error) {
    console.error('❌ Error extracting PDF:', error.message);
    if (error.message.includes('Cannot read property')) {
      console.error('   This might be a scanned PDF. OCR may be required.');
    }
  }
}

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage: node extract-pdf-text.js <command> [options]

Commands:
  pr2766    Extract PR 2766 main curriculum document
  health    Extract Grade 1 Health Curriculum
  pe        Extract K-6 Physical Education Curriculum
  custom <path> <name>    Extract custom PDF

Examples:
  node extract-pdf-text.js pr2766
  node extract-pdf-text.js custom "path/to/file.pdf" "my-document"
  `);
  process.exit(0);
}

const command = args[0];

switch(command) {
  case 'pr2766':
    const pr2766Path = path.join(__dirname, '..', 'resources', 'PE_Grade1_Fr', 
      'PR 2766 - Prog. Immersion 1re année 5.30.19.pdf');
    extractPdfText(pr2766Path, 'pr2766');
    break;

  case 'health':
    const healthPath = path.join(__dirname, '..', 'resources', 'PE_Grade1_Fr',
      'Grade 1 Health Curriculum.pdf');
    extractPdfText(healthPath, 'health_grade1');
    break;

  case 'pe':
    const pePath = path.join(__dirname, '..', 'resources', 'PE_Grade1_Fr',
      'K-6 Physical Education Curriculum.pdf');
    extractPdfText(pePath, 'pe_k6');
    break;

  case 'custom':
    if (args.length < 3) {
      console.error('❌ Custom command requires path and name arguments');
      process.exit(1);
    }
    extractPdfText(args[1], args[2]);
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    process.exit(1);
}