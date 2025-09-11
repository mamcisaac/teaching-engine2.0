#!/usr/bin/env node

/**
 * Clear Client Cache Script
 * 
 * The client uses Zustand with persist middleware that caches lesson data in localStorage.
 * This prevents updated learning objectives from being displayed.
 * 
 * Run this in the browser console to force refresh:
 */

console.log(`
🔧 CLIENT CACHE CLEAR INSTRUCTIONS
===================================

The issue: Your browser has cached old lesson data with "Développer les compétences"

The solution: Clear the Zustand persistent store cache

Run this in your browser console (F12 -> Console):

localStorage.removeItem('lesson-plan-storage');
location.reload();

Alternative (clears ALL localStorage):

localStorage.clear();
location.reload();

After running, the client will fetch fresh data from the API with the correct learning objectives.

Current database has correct objectives like:
- "Découvrir le concept de bonjour l'art!"
- "Créer les techniques artistiques appropriées"
- "Développer la créativité par l'expression créative"

The problem is NOT in the database or API - it's client-side caching!
`);