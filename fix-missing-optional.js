#!/usr/bin/env node

const fs = require('fs');

const filesToFix = [
  '/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/mesure-non-standard-full.json',
  '/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/strategies-calcul-full.json',
  '/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/regularites-et-relations-full.json'
];

const optionalSection = `
          "optional": [
            {
              "item": "Matériel d'enrichissement",
              "quantity": "Selon les besoins",
              "purpose": "Pour approfondir l'apprentissage"
            }
          ]`;

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add optional section after required section closes
    content = content.replace(
      /(\s*)\]\s*\n(\s*)\}/g, 
      (match, indent1, indent2) => {
        return `${indent1}],${optionalSection}\n${indent2}}`;
      }
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log('✅ All materials structures now consistent!');