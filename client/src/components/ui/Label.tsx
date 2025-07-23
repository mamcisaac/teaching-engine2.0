import { clsx } from 'clsx';
import { forwardRef, type LabelHTMLAttributes, type ReactElement } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref): ReactElement => (
      <label className={clsx('text-sm font-medium text-gray-700', className)} ref={ref} {...props}>
        {children}
        {required === true && <span className="text-red-500 ml-1">*</span>}
      </label>
    ),
);

Label.displayName = 'Label';
