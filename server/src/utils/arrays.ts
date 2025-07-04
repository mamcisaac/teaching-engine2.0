// Array and data transformation utilities

// Array manipulation
export const arrayUtils = {
  // Remove duplicates
  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },
  
  // Group by key
  groupBy: <T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  // Sort by multiple fields
  sortBy: <T>(
    array: T[],
    fields: Array<{
      key: keyof T | ((item: T) => unknown);
      order?: 'asc' | 'desc';
    }>
  ): T[] => {
    return [...array].sort((a, b) => {
      for (const { key, order = 'asc' } of fields) {
        const aValue = typeof key === 'function' ? key(a) : a[key];
        const bValue = typeof key === 'function' ? key(b) : b[key];
        
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },
  
  // Chunk array
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  // Flatten nested arrays
  flattenDeep: <T>(array: unknown[]): T[] => {
    return array.reduce<T[]>((flat, item) => {
      return flat.concat(Array.isArray(item) ? arrayUtils.flattenDeep<T>(item) : [item as T]);
    }, []);
  },
  
  // Intersection of arrays
  intersection: <T>(...arrays: T[][]): T[] => {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];
    
    return arrays.reduce((result, array) => {
      return result.filter(item => array.includes(item));
    });
  },
  
  // Difference between arrays
  difference: <T>(array: T[], ...others: T[][]): T[] => {
    const otherValues = new Set(others.flat());
    return array.filter(item => !otherValues.has(item));
  },
  
  // Partition array by predicate
  partition: <T>(
    array: T[],
    predicate: (item: T, index: number) => boolean
  ): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];
    
    array.forEach((item, index) => {
      if (predicate(item, index)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    });
    
    return [truthy, falsy];
  },
};

// Object transformation utilities
export const objectUtils = {
  // Pick specific keys
  pick: <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },
  
  // Omit specific keys
  omit: <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result as Omit<T, K>;
  },
  
  // Deep merge objects
  deepMerge: <T extends object>(...objects: Partial<T>[]): T => {
    const result = {} as T;
    
    for (const obj of objects) {
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          (result as unknown)[key] = objectUtils.deepMerge(
            (result as unknown)[key] || {},
            value
          );
        } else {
          (result as unknown)[key] = value;
        }
      }
    }
    
    return result;
  },
  
  // Remove null/undefined values
  compact: <T extends object>(obj: T): Partial<T> => {
    const result: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        (result as unknown)[key] = value;
      }
    }
    
    return result;
  },
  
  // Map object values
  mapValues: <T extends object, R>(
    obj: T,
    mapper: (value: T[keyof T], key: keyof T) => R
  ): Record<keyof T, R> => {
    const result = {} as Record<keyof T, R>;
    
    for (const [key, value] of Object.entries(obj)) {
      result[key as keyof T] = mapper(value as T[keyof T], key as keyof T);
    }
    
    return result;
  },
};

// String transformation utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // Convert to title case
  titleCase: (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
  
  // Convert to slug
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  // Truncate with ellipsis
  truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  },
  
  // Remove HTML tags
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },
  
  // Escape special characters
  escapeRegex: (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  
  // Generate random string
  randomString: (length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};

// Number utilities
export const numberUtils = {
  // Round to decimal places
  round: (num: number, decimals: number = 2): number => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
  
  // Format as percentage
  toPercentage: (num: number, decimals: number = 0): string => {
    return `${(num * 100).toFixed(decimals)}%`;
  },
  
  // Format with commas
  formatNumber: (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  // Clamp between min and max
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
  },
  
  // Check if within range
  inRange: (num: number, min: number, max: number): boolean => {
    return num >= min && num <= max;
  },
  
  // Calculate average
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },
  
  // Calculate sum
  sum: (numbers: number[]): number => {
    return numbers.reduce((total, num) => total + num, 0);
  },
};

// Common transformations for API responses
export const transformUtils = {
  // Convert to select options
  toSelectOptions: <T>(
    items: T[],
    labelKey: keyof T,
    valueKey: keyof T
  ): Array<{ label: string; value: string }> => {
    return items.map(item => ({
      label: String(item[labelKey]),
      value: String(item[valueKey]),
    }));
  },
  
  // Convert to key-value pairs
  toKeyValue: <T>(
    items: T[],
    keyField: keyof T,
    valueField: keyof T
  ): Record<string, unknown> => {
    return items.reduce((acc, item) => {
      acc[String(item[keyField])] = item[valueField];
      return acc;
    }, {} as Record<string, unknown>);
  },
  
  // Normalize array to object
  normalize: <T extends { id: string | number }>(
    items: T[]
  ): { byId: Record<string | number, T>; allIds: Array<string | number> } => {
    const byId: Record<string | number, T> = {};
    const allIds: Array<string | number> = [];
    
    items.forEach(item => {
      byId[item.id] = item;
      allIds.push(item.id);
    });
    
    return { byId, allIds };
  },
  
  // Convert nested structure to flat
  flatten: <T>(
    items: T[],
    childrenKey: keyof T = 'children' as keyof T
  ): T[] => {
    const result: T[] = [];
    
    const processItem = (item: T) => {
      const { [childrenKey]: children, ...rest } = item;
      result.push(rest as T);
      
      if (Array.isArray(children)) {
        children.forEach(processItem);
      }
    };
    
    items.forEach(processItem);
    return result;
  },
};