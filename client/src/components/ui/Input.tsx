import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes, type ReactElement } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref): ReactElement => (
      <input
        className={clsx(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error === true && 'border-red-500 focus:ring-red-500',
          className,
        )}
        ref={ref}
        {...props}
      />
    ),
);

Input.displayName = 'Input';
