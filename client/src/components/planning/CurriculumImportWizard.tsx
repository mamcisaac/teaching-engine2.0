import React, { useState, useCallback } from 'react';

import { logger } from '../../utils/logger';
import { Dialog } from '../Dialog';
import { Button } from '../ui/Button';
import { useToast } from '../ui/use-toast';
interface ParsedExpectation {
  code: string;
  description: string;
  strand?: string;
  substrand?: string;
}

interface ParsedCurriculum {
  subject: string;
  grade: number;
  expectations: ParsedExpectation[]; // Updated for ETFO alignment
}

interface ImportStatus {
  status: 'UPLOADING' | 'PROCESSING' | 'READY_FOR_REVIEW' | 'CONFIRMED' | 'FAILED';
  parsedData?: ParsedCurriculum;
  errorMessage?: string;
  originalName: string;
}

interface ImportResult {
  expectationsCount: number;
  success: boolean;
  message?: string;
}

interface CurriculumImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CurriculumImportWizard({
  isOpen,
  onClose,
  onSuccess,
}: CurriculumImportWizardProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<
    'upload' | 'processing' | 'review' | 'confirmation'
  >('upload');
  const [importId, setImportId] = useState<number | null>(null);
  const [, setImportStatus] = useState<ImportStatus | null>(null);
  const [reviewedData, setReviewedData] = useState<ParsedCurriculum | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const resetWizard = useCallback(() => {
    setCurrentStep('upload');
    setImportId(null);
    setImportStatus(null);
    setReviewedData(null);
    setIsUploading(false);
    setIsConfirming(false);
  }, [])

  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [resetWizard, onClose]);

  const pollImportStatus = useCallback(
    async (id: number) => {
      const token = localStorage.getItem('token');
      const maxAttempts = 30; // 5 minutes with 10 second intervals
      let attempts = 0;

      const poll = async (): Promise<void> => {
        try {
          const response = await fetch(`/api/curriculum/import/${id}/status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to check status');
          }

          const status = await response.json() as ImportStatus;
          setImportStatus(status);

          if (status.status === 'READY_FOR_REVIEW') {
            setReviewedData(status.parsedData ?? null);
            setCurrentStep('review');
            return;
          }

          if (status.status === 'FAILED') {
            setCurrentStep('upload');
            toast({
              title: 'Processing Failed',
              description: status.errorMessage ?? 'Failed to process document',
              variant: 'destructive',
            });
            return;
          }

          // Continue polling if still processing
          if (status.status === 'PROCESSING' && attempts < maxAttempts) {
            attempts++;
            setTimeout((): void => {
 void poll(); 
}, 10000); // Poll every 10 seconds
          } else if (attempts >= maxAttempts) {
            toast({
              title: 'Processing Timeout',
              description: 'Document processing is taking longer than expected. Please try again.',
              variant: 'destructive',
            });
            setCurrentStep('upload');
          }
        } catch (_error) {
          logger.error('Status poll error:', _error);
          toast({
            title: 'Status Check Failed',
            description: 'Failed to check processing status',
            variant: 'destructive',
          });
          setCurrentStep('upload');
        }
      };

      await poll();
    },
    [toast],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('document', file);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/curriculum/import/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json() as { importId: number };
        setImportId(result.importId);
        setCurrentStep('processing');

        // Start polling for status
        void pollImportStatus(result.importId);

        toast({
          title: 'Upload Successful',
          description: 'Your curriculum document is being processed...',
        });
      } catch (_error) {
        logger.error('Upload error:', _error);
        toast({
          title: 'Upload Failed',
          description: _error instanceof Error ? _error.message : 'Failed to upload document',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast, pollImportStatus],
  );

  const handleConfirmImport = useCallback(async () => {
    if (importId === null || reviewedData === null) {
return;
}

    setIsConfirming(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/curriculum/import/${importId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm import');
      }

      const result = await response.json() as ImportResult;
      setCurrentStep('confirmation');

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${result.expectationsCount} curriculum expectations`,
      });

      const timeoutId = setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2000);
      
      // Store timeout ID for cleanup
      return (): void => {
 clearTimeout(timeoutId); 
};
    } catch (_error) {
      logger.error('Confirm import error:', _error);
      toast({
        title: 'Import Failed',
        description: _error instanceof Error ? _error.message : 'Failed to import curriculum',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  }, [importId, reviewedData, toast, handleClose, onSuccess]);

  const handleExpectationEdit = useCallback(
    (index: number, field: keyof ParsedExpectation, value: string) => {
      if (reviewedData === null) {
return;
}

      const updatedExpectations = [...reviewedData.expectations];
      updatedExpectations[index] = { ...updatedExpectations[index], [field]: value };

      setReviewedData({
        ...reviewedData,
        expectations: updatedExpectations,
      });
    },
    [reviewedData],
  );

  const handleSubjectGradeEdit = useCallback(
    (field: 'subject' | 'grade', value: string | number) => {
      if (reviewedData === null) {
return;
}

      setReviewedData({
        ...reviewedData,
        [field]: value,
      });
    },
    [reviewedData],
  );

  const renderUploadStep = (): JSX.Element => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Curriculum</h2>
        <p className="text-gray-600">
          Upload your curriculum document (PDF, DOC, DOCX, or TXT) and our AI will extract the
          learning outcomes for you.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          disabled={isUploading}
          id="curriculum-file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
void handleFileUpload(file);
}
          }}
          type="file"
        />
        <label className="cursor-pointer block" htmlFor="curriculum-file">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Drop your file here or click to browse
          </h3>
          <p className="mt-2 text-sm text-gray-600">PDF, DOC, DOCX, or TXT (max 10MB)</p>
        </label>
      </div>

      {isUploading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Uploading document...</p>
        </div>
      ) : null}
    </div>
  );

  const renderProcessingStep = (): JSX.Element => (
    <div className="text-center space-y-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Document</h2>
        <p className="text-gray-600 mb-4">
          Our AI is analyzing your curriculum document and extracting learning outcomes.
        </p>
        <p className="text-sm text-gray-500">
          This usually takes 1-3 minutes depending on document size.
        </p>
      </div>
    </div>
  );

  const renderReviewStep = (): JSX.Element | null => {
    if (reviewedData === null) {
return null;
}

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Extracted Data</h2>
          <p className="text-gray-600">
            Please review and edit the extracted curriculum data before importing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="curriculum-subject">Subject</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="curriculum-subject"
              onChange={(e) => {
 handleSubjectGradeEdit('subject', e.target.value); 
}}
              type="text"
              value={reviewedData.subject}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="curriculum-grade">Grade Level</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="curriculum-grade"
              max="12"
              min="1"
              onChange={(e) => {
 handleSubjectGradeEdit('grade', parseInt(e.target.value)); 
}}
              type="number"
              value={reviewedData.grade}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Curriculum Expectations ({reviewedData.expectations.length})
          </h3>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Strand
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewedData.expectations.map((expectation, index) => (
                  <tr className="hover:bg-gray-50" key={index}>
                    <td className="px-4 py-2">
                      <input
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
 handleExpectationEdit(index, 'code', e.target.value); 
}}
                        type="text"
                        value={expectation.code}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <textarea
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
 handleExpectationEdit(index, 'description', e.target.value); 
}
                        }
                        rows={2}
                        value={expectation.description}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
 handleExpectationEdit(index, 'strand', e.target.value); 
}}
                        placeholder="Optional"
                        type="text"
                        value={expectation.strand ?? ''}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between">
          <Button aria-label="Click button" onClick={() => {
 setCurrentStep('upload'); 
}}>
            Back to Upload
          </Button>
          <Button
            disabled={isConfirming || reviewedData.subject === '' || reviewedData.expectations.length === 0}
            onClick={(): void => {
 void handleConfirmImport(); 
}}
          >
            {isConfirming
              ? 'Importing...'
              : `Import ${reviewedData.expectations.length} Expectations`}
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = (): JSX.Element => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h2>
        <p className="text-gray-600">
          Your curriculum has been successfully imported. You can now start creating long-range
          plans and unit plans.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Curriculum Import Wizard</h1>
            <button className="text-gray-400 hover:text-gray-600" onClick={handleClose}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center">
              {(['upload', 'processing', 'review', 'confirmation'] as const).map((step, index) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      currentStep === step ||
                      index <
                        ['upload', 'processing', 'review', 'confirmation'].indexOf(currentStep)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 ? (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index <
                        ['upload', 'processing', 'review', 'confirmation'].indexOf(currentStep)
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Upload</span>
              <span>Processing</span>
              <span>Review</span>
              <span>Complete</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 'upload' ? renderUploadStep() : null}
          {currentStep === 'processing' ? renderProcessingStep() : null}
          {currentStep === 'review' ? renderReviewStep() : null}
          {currentStep === 'confirmation' ? renderConfirmationStep() : null}
        </div>
      </div>
    </Dialog>
  );
}

export { CurriculumImportWizard };