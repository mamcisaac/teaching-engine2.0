import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import Dialog from '../Dialog';
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

interface CurriculumImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CurriculumImportWizard({
  isOpen,
  onClose,
  onSuccess,
}: CurriculumImportWizardProps) {
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
  }, []);

  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [resetWizard, onClose]);

  const pollImportStatus = useCallback(
    async (id: number) => {
      const token = localStorage.getItem('token');
      const maxAttempts = 30; // 5 minutes with 10 second intervals
      let attempts = 0;

      const poll = async () => {
        try {
          const response = await fetch(`/api/curriculum/import/${id}/status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to check status');
          }

          const status: ImportStatus = await response.json();
          setImportStatus(status);

          if (status.status === 'READY_FOR_REVIEW') {
            setReviewedData(status.parsedData || null);
            setCurrentStep('review');
            return;
          }

          if (status.status === 'FAILED') {
            setCurrentStep('upload');
            toast({
              title: 'Processing Failed',
              description: status.errorMessage || 'Failed to process document',
              variant: 'destructive',
            });
            return;
          }

          // Continue polling if still processing
          if (status.status === 'PROCESSING' && attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else if (attempts >= maxAttempts) {
            toast({
              title: 'Processing Timeout',
              description: 'Document processing is taking longer than expected. Please try again.',
              variant: 'destructive',
            });
            setCurrentStep('upload');
          }
        } catch (error) {
          console.error('Status poll error:', error);
          toast({
            title: 'Status Check Failed',
            description: 'Failed to check processing status',
            variant: 'destructive',
          });
          setCurrentStep('upload');
        }
      };

      poll();
    },
    [toast],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

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

        const result = await response.json();
        setImportId(result.importId);
        setCurrentStep('processing');

        // Start polling for status
        pollImportStatus(result.importId);

        toast({
          title: 'Upload Successful',
          description: 'Your curriculum document is being processed...',
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload Failed',
          description: error instanceof Error ? error.message : 'Failed to upload document',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast, pollImportStatus],
  );

  const handleConfirmImport = useCallback(async () => {
    if (!importId || !reviewedData) return;

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

      const result = await response.json();
      setCurrentStep('confirmation');

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${result.expectationsCount} curriculum expectations`,
      });

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Confirm import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import curriculum',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  }, [importId, reviewedData, toast, handleClose, onSuccess]);

  const handleExpectationEdit = useCallback(
    (index: number, field: keyof ParsedExpectation, value: string) => {
      if (!reviewedData) return;

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
      if (!reviewedData) return;

      setReviewedData({
        ...reviewedData,
        [field]: value,
      });
    },
    [reviewedData],
  );

  const renderUploadStep = () => (
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
          type="file"
          id="curriculum-file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          disabled={isUploading}
          className="hidden"
        />
        <label htmlFor="curriculum-file" className="cursor-pointer block">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Drop your file here or click to browse
          </h3>
          <p className="mt-2 text-sm text-gray-600">PDF, DOC, DOCX, or TXT (max 10MB)</p>
        </label>
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading document...</p>
        </div>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
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

  const renderReviewStep = () => {
    if (!reviewedData) return null;

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={reviewedData.subject}
              onChange={(e) => handleSubjectGradeEdit('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <input
              type="number"
              min="1"
              max="12"
              value={reviewedData.grade}
              onChange={(e) => handleSubjectGradeEdit('grade', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={expectation.code}
                        onChange={(e) => handleExpectationEdit(index, 'code', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <textarea
                        value={expectation.description}
                        onChange={(e) =>
                          handleExpectationEdit(index, 'description', e.target.value)
                        }
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={expectation.strand || ''}
                        onChange={(e) => handleExpectationEdit(index, 'strand', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('upload')}>
            Back to Upload
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={isConfirming || !reviewedData.subject || !reviewedData.expectations.length}
          >
            {isConfirming
              ? 'Importing...'
              : `Import ${reviewedData.expectations.length} Expectations`}
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Curriculum Import Wizard</h1>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
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
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index <
                        ['upload', 'processing', 'review', 'confirmation'].indexOf(currentStep)
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
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
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'processing' && renderProcessingStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </div>
      </div>
    </Dialog>
  );
}

export default CurriculumImportWizard;
