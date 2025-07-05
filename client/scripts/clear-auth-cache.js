#!/usr/bin/env node

/**
 * Script to clear authentication cache and force re-login
 * Run this to ensure the app requires authentication
 */

console.log('🧹 Clearing authentication cache...\n');

console.log('To clear browser authentication data, run these commands in the browser console:');
console.log('----------------------------------------');
console.log(`
// 1. Clear all localStorage items related to auth
localStorage.removeItem('auth_access_token');
localStorage.removeItem('auth_refresh_token');
localStorage.removeItem('auth_user');
localStorage.removeItem('auth_expires_at');
localStorage.removeItem('token'); // Legacy token

// 2. Clear all cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// 3. Unregister service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});

// 4. Clear all caches
caches.keys().then(function(names) {
  for (let name of names) {
    caches.delete(name);
  }
});

// 5. Clear IndexedDB
indexedDB.deleteDatabase('TeachingEngineOffline');

// 6. Reload the page
window.location.reload(true);
`);
console.log('----------------------------------------\n');

console.log('Or use this one-liner to copy to clipboard:');
console.log('----------------------------------------');
console.log(`localStorage.removeItem('auth_access_token');localStorage.removeItem('auth_refresh_token');localStorage.removeItem('auth_user');localStorage.removeItem('auth_expires_at');localStorage.removeItem('token');document.cookie.split(";").forEach(function(c){document.cookie=c.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/");});navigator.serviceWorker.getRegistrations().then(function(registrations){for(let registration of registrations){registration.unregister();}});caches.keys().then(function(names){for(let name of names){caches.delete(name);}});indexedDB.deleteDatabase('TeachingEngineOffline');window.location.reload(true);`);
console.log('----------------------------------------\n');

console.log('✅ Instructions printed. Copy and run in browser console to clear auth cache.');