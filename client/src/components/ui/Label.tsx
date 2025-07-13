import { clsx } from 'clsx';
import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref): React.ReactElement => (
      <label ref={ref} className={clsx('text-sm font-medium text-gray-700', className)} {...props}>
        {children}
        {required === true && <span className="text-red-500 ml-1">*</span>}
      </label>
    ),
);

Label.displayName = 'Label';
