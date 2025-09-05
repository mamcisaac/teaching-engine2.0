import { useMutation } from '@tanstack/react-query';
import { X, Download, Printer, FileText } from 'lucide-react';
import { useState } from 'react';

import { substituteApi, type SubstitutePlan } from '../api/domains/substitute';
import { useToast } from '../hooks/useToast';
import { printHTML, downloadHTML } from '../utils/printUtils';

interface Props {
  date?: Date;
  onClose: () => void;
}

export function SubPlanGenerator({ date: initialDate, onClose }: Props): React.ReactElement {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => 
    (initialDate || new Date()).toISOString().slice(0, 10)
  );
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [planData, setPlanData] = useState<SubstitutePlan | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const [plan, html] = await Promise.all([
        substituteApi.generateSubPlan(selectedDate),
        substituteApi.generateSubPlanPDF(selectedDate)
      ]);
      return { plan, html };
    },
    onSuccess: ({ plan, html }) => {
      setPlanData(plan);
      setHtmlContent(html);
      toast({
        title: 'Success',
        description: 'Substitute plan generated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate substitute plan',
        variant: 'destructive',
      });
      console.error('Failed to generate substitute plan:', error);
    },
  });

  const handlePrint = () => {
    if (htmlContent) {
      printHTML(htmlContent);
    }
  };

  const handleDownload = () => {
    if (htmlContent) {
      const filename = `substitute-plan-${selectedDate}`;
      downloadHTML(htmlContent, filename);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Generate Substitute Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <label htmlFor="substitute-date" className="block text-sm font-medium mb-2">Date for Substitute Plan</label>
              <input
                id="substitute-date"
                className="border rounded p-2 w-full"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Generate Button */}
            {!htmlContent && (
              <button
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generating...' : 'Generate Plan'}
              </button>
            )}

            {/* Preview Section */}
            {htmlContent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Plan Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Plan Summary */}
                {planData && (
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(planData.dateFor).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Grade:</span> {planData.grade}
                      </div>
                      <div>
                        <span className="font-medium">Total Lessons:</span> {planData.lessons.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Subject:</span> {planData.subject}
                      </div>
                    </div>
                  </div>
                )}

                {/* HTML Preview */}
                <div className="border rounded overflow-hidden">
                  <iframe 
                    className="w-full h-96" 
                    srcDoc={htmlContent}
                    title="Substitute plan preview"
                  />
                </div>

                {/* Regenerate Button */}
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => {
                    setHtmlContent(null);
                    setPlanData(null);
                  }}
                >
                  Generate New Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
