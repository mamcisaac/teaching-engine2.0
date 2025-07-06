import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
  description?: string;
}

export default function Dialog({
  open,
  onOpenChange,
  onClose,
  children,
  title,
  maxWidth = 'lg',
  description,
}: DialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={handleOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay aria-hidden="true" className="fixed inset-0 bg-black/50 z-50" />
        <RadixDialog.Content
          aria-describedby={description ? 'dialog-description' : undefined}
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center outline-none"
          role="dialog"
        >
          <div
            className={`bg-white rounded shadow w-full ${maxWidthClasses[maxWidth as keyof typeof maxWidthClasses] || maxWidthClasses.lg} mx-4`}
            onClick={(e) => {
 e.stopPropagation(); 
}}
          >
            {title && (
              <div className="px-6 py-4 border-b">
                <RadixDialog.Title asChild>
                  <h2 className="text-lg font-semibold" id="dialog-title">
                    {title}
                  </h2>
                </RadixDialog.Title>
              </div>
            )}
            {description && (
              <RadixDialog.Description asChild>
                <p className="sr-only" id="dialog-description">
                  {description}
                </p>
              </RadixDialog.Description>
            )}
            <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
