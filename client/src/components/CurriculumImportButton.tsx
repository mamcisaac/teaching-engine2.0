import React, { useState } from 'react';

import { CurriculumImportWizard } from './planning/CurriculumImportWizard';
import { Button } from './ui/Button';

interface CurriculumImportButtonProps {
  onImportSuccess?: () => void;
  className?: string;
}

export function CurriculumImportButton({ onImportSuccess, className }: CurriculumImportButtonProps): React.ReactElement {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleImportSuccess = (): void => {
    if (onImportSuccess !== undefined) {
      onImportSuccess();
    }
  };

  return (
    <>
      <Button
        className={className}
        variant="outline"
        onClick={() => {
 setIsWizardOpen(true); 
}}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
        Import Curriculum
      </Button>

      <CurriculumImportWizard
        isOpen={isWizardOpen}
        onClose={() => {
 setIsWizardOpen(false); 
}}
        onSuccess={handleImportSuccess}
      />
    </>
  );
}