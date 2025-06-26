import React from 'react';
import { clsx } from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
  label
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const switchClasses = clsx(
    'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    {
      'bg-blue-600': checked && !disabled,
      'bg-gray-200': !checked && !disabled,
      'bg-gray-300 cursor-not-allowed opacity-50': disabled,
      'h-6 w-11': size === 'md',
      'h-5 w-9': size === 'sm'
    },
    className
  );

  const knobClasses = clsx(
    'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
    {
      'translate-x-5': checked && size === 'md',
      'translate-x-0': !checked && size === 'md',
      'translate-x-4': checked && size === 'sm',
      'translate-x-0': !checked && size === 'sm',
      'h-5 w-5': size === 'md',
      'h-4 w-4': size === 'sm'
    }
  );

  return (
    <label className={clsx('flex items-center', { 'cursor-pointer': !disabled })}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={switchClasses}
        onClick={handleChange}
        disabled={disabled}
      >
        <span className={knobClasses} />
      </button>
      {label && (
        <span className={clsx('ml-3 text-sm', {
          'text-gray-900': !disabled,
          'text-gray-500': disabled
        })}>
          {label}
        </span>
      )}
    </label>
  );
};