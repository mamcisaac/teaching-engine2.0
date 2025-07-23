import * as RadixDialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type FC, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';

// Wrapper component for consistent API
interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

const DialogWrapper: FC<DialogProps> = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  children,
  className: _className,
}): ReactElement => {
  const isOpenValue = isOpen ?? open ?? false;
  const handleOpenChange = (newOpen: boolean): void => {
    if (!newOpen && onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <RadixDialog.Root onOpenChange={handleOpenChange} open={isOpenValue}>
      {children}
    </RadixDialog.Root>
  );
};

const Dialog = DialogWrapper;

const DialogTrigger = RadixDialog.Trigger;

const DialogPortal = RadixDialog.Portal;

const DialogOverlay = forwardRef<
  ElementRef<typeof RadixDialog.Overlay>,
  ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref): ReactElement => (
  <RadixDialog.Overlay
    className={clsx(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in',
      className,
    )}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = RadixDialog.Overlay.displayName;

const DialogContent = forwardRef<
  ElementRef<typeof RadixDialog.Content>,
  ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref): ReactElement => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      className={clsx(
        'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
        'bg-white rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95',
        'p-6',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
      <RadixDialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none">
        <span className="text-xl">×</span>
        <span className="sr-only">Close</span>
      </RadixDialog.Close>
    </RadixDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = RadixDialog.Content.displayName;

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={clsx('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={clsx('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = forwardRef<
  ElementRef<typeof RadixDialog.Title>,
  ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref): ReactElement => (
  <RadixDialog.Title
    className={clsx('text-lg font-semibold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = RadixDialog.Title.displayName;

const DialogDescription = forwardRef<
  ElementRef<typeof RadixDialog.Description>,
  ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref): ReactElement => (
  <RadixDialog.Description
    className={clsx('text-sm text-gray-500', className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = RadixDialog.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
