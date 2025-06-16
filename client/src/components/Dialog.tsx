import { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

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
        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" />
        <RadixDialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-describedby={description ? 'dialog-description' : undefined}
        >
          <div
            className={`bg-white rounded shadow w-full ${maxWidthClasses[maxWidth as keyof typeof maxWidthClasses] || maxWidthClasses.lg} mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="px-6 py-4 border-b">
                <RadixDialog.Title asChild>
                  <h2 id="dialog-title" className="text-lg font-semibold">
                    {title}
                  </h2>
                </RadixDialog.Title>
              </div>
            )}
            {description && (
              <RadixDialog.Description asChild>
                <p id="dialog-description" className="sr-only">
                  {description}
                </p>
              </RadixDialog.Description>
            )}
            <div className="p-6">{children}</div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
