// Stub for analytics cache service
export const analyticsCache = {
  clear: () => {
    console.log('Analytics cache cleared');
  },

  get: (key) => {
    return null;
  },

  set: (key, value) => {
    return true;
  },

  has: (key) => {
    return false;
  },

  delete: (key) => {
    return true;
  },
};
