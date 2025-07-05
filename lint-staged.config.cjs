module.exports = {
  '*.{js,ts,tsx}': (filenames) => {
    // Filter out script files and test utilities
    const filteredFiles = filenames.filter(file => {
      // Exclude files in scripts directories (including root scripts/)
      if (file.includes('/scripts/') || file.startsWith('scripts/')) return false;
      // Exclude test script files (anywhere)
      if (file.match(/test-.*\.(js|cjs)$/)) return false;
      // Exclude standalone test files
      if (file.match(/\.(test|spec)\.(js|cjs)$/)) return false;
      return true;
    });
    
    if (filteredFiles.length === 0) return [];
    
    return [
      `eslint --fix ${filteredFiles.join(' ')}`,
      `prettier --write ${filteredFiles.join(' ')}`
    ];
  },
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
