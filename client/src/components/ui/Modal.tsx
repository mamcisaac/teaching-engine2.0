import React from 'react';
import Dialog from '../Dialog';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className={`${sizeClasses[size]} w-full`}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        
        <div className="mb-6">{children}</div>
        
        {actions && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            {actions}
          </div>
        )}
      </div>
    </Dialog>
  );
}

interface ModalActionProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export function ModalActions({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
}: ModalActionProps) {
  return (
    <>
      {onCancel && (
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      )}
    </>
  );
}