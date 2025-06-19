import React from 'react';
import { clsx } from 'clsx';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label ref={ref} className={clsx('text-sm font-medium text-gray-700', className)} {...props}>
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  },
);

Label.displayName = 'Label';
