#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route files
const routeFiles = glob.sync('server/src/routes/*.ts');

routeFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add asyncHandler import if not present
  if (!content.includes('asyncHandler') && content.includes('async (req')) {
    const importMatch = content.match(/(import.*from\s+['"]\.\.\/middleware\/errorHandler['"];?)/);
    if (importMatch) {
      // Already has import from errorHandler, add asyncHandler
      content = content.replace(
        importMatch[1],
        importMatch[1].replace('} from', ', asyncHandler } from')
      );
    } else {
      // Add new import after other middleware imports
      const middlewareImportMatch = content.match(/(import.*from\s+['"]\.\.\/middleware\/[^'"]+'["];?\n)/);
      if (middlewareImportMatch) {
        content = content.replace(
          middlewareImportMatch[1],
          middlewareImportMatch[1] + "import { asyncHandler } from '../middleware/errorHandler';\n"
        );
      } else {
        // Add after logger import
        const loggerImportMatch = content.match(/(import.*logger.*;\n)/);
        if (loggerImportMatch) {
          content = content.replace(
            loggerImportMatch[1],
            loggerImportMatch[1] + "import { asyncHandler } from '../middleware/errorHandler';\n"
          );
        }
      }
    }
    modified = true;
  }
  
  // Wrap async route handlers
  const routePattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]*['"]\s*,\s*(.*?,\s*)?async\s*\(/g;
  content = content.replace(routePattern, (match, method, middleware) => {
    modified = true;
    const middlewareStr = middleware || '';
    return `router.${method}(${match.includes("'") ? "'" : '"'}${match.match(/['"]([^'"]*)['"]/)[1]}${match.includes("'") ? "'" : '"'}, ${middlewareStr}asyncHandler(async (`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Modified ${filePath}`);
  } else {
    console.log(`  - No changes needed for ${filePath}`);
  }
});

console.log('Done!');