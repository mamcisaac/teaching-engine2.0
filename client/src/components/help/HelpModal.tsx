import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { HelpModalProps } from '../../types/help';
import { useHelp } from '../../contexts/HelpContext';

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  category,
  showProgress = false,
  nextAction
}) => {
  const { markHelpPageViewed } = useHelp();

  React.useEffect(() => {
    if (isOpen && title) {
      markHelpPageViewed(title);
    }
  }, [isOpen, title, markHelpPageViewed]);

  const renderContent = () => {
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
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {nextAction && (
          <Button variant="primary" onClick={nextAction.action}>
            {nextAction.label}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={footer}
    >
      <div className="space-y-4">
        {renderContent()}
      </div>
    </Modal>
  );
};