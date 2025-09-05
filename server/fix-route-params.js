#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to add null checks for route parameters
function addNullChecks(content) {
  let modified = content;
  
  // Pattern 1: const { id } = req.params; followed by usage in function calls
  const idPatterns = [
    {
      from: /const \{ id \} = req\.params;\s*\n(\s+)const/g,
      to: 'const { id } = req.params;\n$1if (!id) {\n$1  res.status(400).json({ error: "ID parameter is required" });\n$1  return;\n$1}\n$1const'
    },
    {
      from: /const \{ importId \} = req\.params;\s*\n(\s+)const/g,
      to: 'const { importId } = req.params;\n$1if (!importId) {\n$1  res.status(400).json({ error: "Import ID parameter is required" });\n$1  return;\n$1}\n$1const'
    },
    {
      from: /const importId = req\.params\.id;\s*\n(\s+)if \(req\.user/g,
      to: 'const importId = req.params.id;\n$1if (!importId) {\n$1  res.status(400).json({ error: "Import ID parameter is required" });\n$1  return;\n$1}\n$1if (req.user'
    }
  ];
  
  for (const pattern of idPatterns) {
    modified = modified.replace(pattern.from, pattern.to);
  }
  
  return modified;
}

// List of files to process
const filesToProcess = [
  'src/routes/curriculumImport.ts',
  'src/routes/ETFOLessonPlansRouteHandler.ts',
  'src/routes/substitutePlanService.ts'
];

filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const modified = addNullChecks(content);
    if (modified !== content) {
      fs.writeFileSync(fullPath, modified);
      console.log(`Fixed route parameters in: ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Route parameter fixes applied');