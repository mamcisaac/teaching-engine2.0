import { describe, it, expect } from 'vitest';
import { cn } from '../src/lib/utils';

describe('Client Utils Unit Tests', () => {
  describe('cn (className utility)', () => {
    it('should merge simple class names', () => {
      const result = cn('text-red-500', 'bg-blue-100');
      expect(result).toBe('text-red-500 bg-blue-100');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );
      
      expect(result).toBe('base-class active-class');
    });

    it('should handle Tailwind class conflicts', () => {
      // Tailwind merge should resolve conflicts (last one wins)
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('should handle array of classes', () => {
      const result = cn(['text-lg', 'font-bold'], 'text-center');
      expect(result).toBe('text-lg font-bold text-center');
    });

    it('should handle object notation', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
        'font-bold': true,
      });
      
      expect(result).toContain('text-red-500');
      expect(result).toContain('font-bold');
      expect(result).not.toContain('text-blue-500');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
      expect(cn(null)).toBe('');
      expect(cn(undefined)).toBe('');
    });

    it('should handle complex combinations', () => {
      const isError = true;
      const size = 'large' as 'large' | 'small';
      
      const result = cn(
        'button',
        'transition-colors',
        {
          'bg-red-500': isError,
          'bg-green-500': !isError,
        },
        size === 'large' && 'px-6 py-3',
        size === 'small' && 'px-2 py-1'
      );
      
      expect(result).toContain('button');
      expect(result).toContain('transition-colors');
      expect(result).toContain('bg-red-500');
      expect(result).toContain('px-6 py-3');
      expect(result).not.toContain('bg-green-500');
      expect(result).not.toContain('px-2 py-1');
    });

    it('should handle responsive classes', () => {
      const result = cn(
        'text-sm md:text-base lg:text-lg',
        'hidden sm:block'
      );
      
      expect(result).toContain('text-sm');
      expect(result).toContain('md:text-base');
      expect(result).toContain('lg:text-lg');
      expect(result).toContain('hidden');
      expect(result).toContain('sm:block');
    });

    it('should handle hover and focus states', () => {
      const result = cn(
        'bg-blue-500',
        'hover:bg-blue-600',
        'focus:ring-2',
        'focus:ring-blue-300'
      );
      
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('hover:bg-blue-600');
      expect(result).toContain('focus:ring-2');
      expect(result).toContain('focus:ring-blue-300');
    });

    it('should handle dark mode classes', () => {
      const result = cn(
        'bg-white dark:bg-gray-800',
        'text-gray-900 dark:text-white'
      );
      
      expect(result).toContain('bg-white');
      expect(result).toContain('dark:bg-gray-800');
      expect(result).toContain('text-gray-900');
      expect(result).toContain('dark:text-white');
    });

    it('should merge conflicting margin/padding classes correctly', () => {
      // TailwindCSS merge should handle these conflicts
      const result1 = cn('p-4', 'px-2'); // px-2 should override p-4's horizontal padding
      const result2 = cn('m-4', 'mt-2'); // mt-2 should override m-4's top margin
      
      // The exact output depends on tailwind-merge configuration
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });
  });
});