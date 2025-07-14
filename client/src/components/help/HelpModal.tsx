
import React from 'react';

import { useHelp } from '../../contexts/HelpContext';
import type { HelpModalProps } from '../../types/help';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  category,
  showProgress = false,
  nextAction
}): React.ReactElement => {
  const { markHelpPageViewed } = useHelp();

  React.useEffect((): void => {
    if (isOpen && title) {
      markHelpPageViewed(title);
    }
  }, [isOpen, title, markHelpPageViewed]);

  const renderContent = (): React.ReactNode => {
    if (typeof content === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }
    return content;
  };

  const footer = (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        {category && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {category}
          </span>
        )}
        {showProgress && (
          <span className="text-sm text-gray-500">
            Progress saved automatically
          </span>
        )}
      </div>
      <div className="flex space-x-3">
        <Button aria-label="Click button" onClick={onClose}>
          Close
        </Button>
        {nextAction && (
          <Button aria-label="Click button" onClick={nextAction.action}>
            {nextAction.label}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      footer={footer}
      isOpen={isOpen}
      size="lg"
      title={title}
      onClose={onClose}
    >
      <div className="space-y-4">
        {renderContent()}
      </div>
    </Modal>
  );
};