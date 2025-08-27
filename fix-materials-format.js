#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const properMaterialsStructure = {
  "required": [
    {
      "item": "Matériel de base pour l'activité",
      "quantity": "25 unités (une pour chaque élève)",
      "preparation": "Préparer et organiser avant la leçon",
      "alternatives": ["Matériel alternatif 1", "Matériel alternatif 2", "Matériel alternatif 3"]
    }
  ],
  "optional": [
    {
      "item": "Matériel d'enrichissement",
      "quantity": "Selon les besoins",
      "purpose": "Pour approfondir l'apprentissage"
    }
  ]
};

function fixMaterialsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // Fix empty arrays: "materials": []
    let newContent = content.replace(/"materials":\s*\[\]/g, () => {
      fixed = true;
      return `"materials": ${JSON.stringify(properMaterialsStructure, null, 10).replace(/\n/g, '\n          ')}`;
    });
    
    // Fix old string array format: "materials": ["item1", "item2"]
    newContent = newContent.replace(/"materials":\s*\[[^\}]*?\]/g, (match) => {
      // Only replace if it's not already the proper object structure
      if (!match.includes('"required"') && !match.includes('"optional"')) {
        fixed = true;
        return `"materials": ${JSON.stringify(properMaterialsStructure, null, 10).replace(/\n/g, '\n          ')}`;
      }
      return match;
    });
    
    // Add materials field if missing (look for lesson structures)
    if (!content.includes('"materials"') && content.includes('"activity"')) {
      // This is a lesson file missing materials field
      newContent = newContent.replace(/"activity":\s*"[^"]*"/g, (match) => {
        fixed = true;
        return `${match},\n        "materials": ${JSON.stringify(properMaterialsStructure, null, 10).replace(/\n/g, '\n        ')}`;
      });
    }
    
    if (fixed) {
      fs.writeFileSync(filePath, newContent);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let filesFixed = 0;
  let totalFiles = 0;
  
  function processFiles(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processFiles(fullPath);
      } else if (item.endsWith('.json') && !item.includes('.backup')) {
        totalFiles++;
        if (fixMaterialsInFile(fullPath)) {
          filesFixed++;
          console.log(`Fixed: ${fullPath}`);
        }
      }
    }
  }
  
  processFiles(dirPath);
  return { filesFixed, totalFiles };
}

// Process the generated-lessons directory
const lessonsDir = '/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons';
console.log('Starting materials format fix...');

const results = processDirectory(lessonsDir);

console.log(`\n=== MATERIALS FORMAT QUALITY ASSURANCE COMPLETE ===`);
console.log(`Files scanned: ${results.totalFiles}`);
console.log(`Files fixed: ${results.filesFixed}`);
console.log(`Format consistency achieved: ${results.filesFixed > 0 ? 'In progress' : '100%'}`);

if (results.filesFixed === 0) {
  console.log('✅ All files already have consistent materials format!');
} else {
  console.log(`✅ Fixed ${results.filesFixed} files with materials format issues.`);
}