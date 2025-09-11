#!/usr/bin/env node

/**
 * COMPREHENSIVE CACHE DIAGNOSTIC
 * 
 * Run this script, then execute the browser console commands to fully diagnose
 * why learning objectives still show 'Développer les compétences'
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const databaseUrl = `file:${path.resolve(__dirname, 'prisma/prisma/dev.db')}`;
const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

console.log(`
🔍 COMPREHENSIVE CACHE DIAGNOSTIC
=====================================

STEP 1: DATABASE CHECK
----------------------`);

async function checkDatabase() {
  const testLessonId = 'cmf43u3t5006xvj9tcs0fj7y4';
  
  const lesson = await prisma.eTFOLessonPlan.findFirst({
    where: { id: testLessonId }
  });
  
  if (lesson) {
    console.log(`✅ Database has lesson: ${lesson.title}`);
    console.log(`✅ Learning Goals: "${lesson.learningGoals?.substring(0, 100)}..."`);
    
    if (lesson.learningGoals === 'Développer les compétences') {
      console.log(`❌ ERROR: Database still has generic objectives!`);
    } else {
      console.log(`✅ Database has CORRECT specific objectives`);
    }
  } else {
    console.log(`❌ Lesson not found in database`);
  }
  
  console.log(`
STEP 2: RUN IN BROWSER CONSOLE (F12)
-------------------------------------

// 1. Check all localStorage keys
console.log('=== localStorage Keys ===');
Object.keys(localStorage).forEach(key => {
  console.log(key, ':', localStorage[key]?.substring(0, 100));
});

// 2. Check sessionStorage
console.log('\\n=== sessionStorage Keys ===');
Object.keys(sessionStorage).forEach(key => {
  console.log(key, ':', sessionStorage[key]?.substring(0, 100));
});

// 3. Check React Query cache
console.log('\\n=== React Query Cache ===');
// This requires React DevTools
// Go to React DevTools > Components > Search for "QueryClientProvider"
// Look at the cache state

// 4. Check Service Workers
console.log('\\n=== Service Workers ===');
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active Service Workers:', registrations.length);
  registrations.forEach(reg => {
    console.log('SW Scope:', reg.scope);
    console.log('SW State:', reg.active?.state);
  });
});

// 5. Check Cache Storage
console.log('\\n=== Cache Storage ===');
caches.keys().then(names => {
  console.log('Cache Names:', names);
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(\`Cache "\${name}" has \${requests.length} entries\`);
        requests.forEach(req => {
          if (req.url.includes('lesson')) {
            console.log('  - Cached lesson URL:', req.url);
          }
        });
      });
    });
  });
});

// 6. Force clear EVERYTHING
console.log('\\n=== NUCLEAR CLEAR (if needed) ===');
console.log('Run this to clear EVERYTHING:');
console.log(\`
// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Unregister service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Clear IndexedDB (if used)
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});

// Force reload
location.reload(true);
\`);

STEP 3: CHECK NETWORK TAB
-------------------------
1. Open Network tab (F12 > Network)
2. Navigate to the lesson page
3. Look for: GET /api/lessons/cmf43u3t5006xvj9tcs0fj7y4
4. Check the Response tab - what does learningGoals show?
5. Check "Disable cache" checkbox and reload

STEP 4: TEST API DIRECTLY
------------------------
Run this curl command in terminal:

curl -s "http://localhost:3001/api/lessons/cmf43u3t5006xvj9tcs0fj7y4" \\
  -H "Cookie: authToken=YOUR_TOKEN_HERE" | \\
  grep -o '"learningGoals":"[^"]*"'

Replace YOUR_TOKEN_HERE with your actual auth token from browser cookies.
`);
  
  await prisma.$disconnect();
}

checkDatabase().catch(console.error);