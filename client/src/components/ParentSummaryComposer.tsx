import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import Dialog from './Dialog';
import {
  useStudents,
  useGenerateParentSummary,
  useSaveParentSummary,
  useRegenerateParentSummary,
} from '../api';

interface ParentSummaryComposerProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: number;
}

interface GeneratedSummary {
  french: string;
  english: string;
}

const focusOptions = [
  'oral language',
  'literacy',
  'numeracy',
  'science',
  'social studies',
  'arts',
  'physical education',
];

export default function ParentSummaryComposer({
  isOpen,
  onClose,
  preselectedStudentId,
}: ParentSummaryComposerProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    preselectedStudentId || null,
  );
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // Default to 3 months ago
    return date.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [customFocus, setCustomFocus] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState<GeneratedSummary | null>(null);
  const [editedFrench, setEditedFrench] = useState('');
  const [editedEnglish, setEditedEnglish] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  // API hooks
  const { data: students = [] } = useStudents();
  const generateSummary = useGenerateParentSummary();
  const regenerateSummary = useRegenerateParentSummary();
  const saveSummary = useSaveParentSummary();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStudentId(preselectedStudentId || null);
      setGeneratedSummary(null);
      setEditedFrench('');
      setEditedEnglish('');
      setIsEditing(false);
      setFocusAreas([]);
      setCustomFocus('');
    }
  }, [isOpen, preselectedStudentId]);

  // Update edited content when summary is generated
  useEffect(() => {
    if (generatedSummary) {
      setEditedFrench(generatedSummary.french);
      setEditedEnglish(generatedSummary.english);
    }
  }, [generatedSummary]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleGenerateSummary = async () => {
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }

    const allFocusAreas = [...focusAreas];
    if (customFocus.trim()) {
      allFocusAreas.push(customFocus.trim());
    }

    try {
      const result = await generateSummary.mutateAsync({
        studentId: selectedStudentId,
        from: new Date(dateFrom).toISOString(),
        to: new Date(dateTo).toISOString(),
        focus: allFocusAreas.length > 0 ? allFocusAreas : undefined,
      });

      setGeneratedSummary(result);
      toast.success('Parent summary generated successfully!');
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  const handleRegenerateSummary = async (tone: 'formal' | 'informal' = 'formal') => {
    if (!selectedStudentId || !generatedSummary) return;

    const allFocusAreas = [...focusAreas];
    if (customFocus.trim()) {
      allFocusAreas.push(customFocus.trim());
    }

    try {
      const result = await regenerateSummary.mutateAsync({
        originalFrench: editedFrench,
        originalEnglish: editedEnglish,
        studentId: selectedStudentId,
        from: new Date(dateFrom).toISOString(),
        to: new Date(dateTo).toISOString(),
        focus: allFocusAreas.length > 0 ? allFocusAreas : undefined,
        tone,
      });

      setGeneratedSummary(result);
      toast.success('Summary regenerated with variation!');
    } catch (error) {
      console.error('Failed to regenerate summary:', error);
    }
  };

  const handleSaveSummary = async () => {
    if (!selectedStudentId || !editedFrench || !editedEnglish) {
      toast.error('Please ensure all fields are filled');
      return;
    }

    const allFocusAreas = [...focusAreas];
    if (customFocus.trim()) {
      allFocusAreas.push(customFocus.trim());
    }

    try {
      await saveSummary.mutateAsync({
        studentId: selectedStudentId,
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        focus: allFocusAreas,
        contentFr: editedFrench,
        contentEn: editedEnglish,
        isDraft,
      });

      onClose();
    } catch (error) {
      console.error('Failed to save summary:', error);
    }
  };

  const handleFocusAreaToggle = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  const handleExport = (format: 'pdf' | 'html' | 'markdown') => {
    if (!generatedSummary || !selectedStudent) return;

    const content = `
# Parent Summary - ${selectedStudent.firstName} ${selectedStudent.lastName}

**Period:** ${dateFrom} to ${dateTo}
${focusAreas.length > 0 || customFocus ? `**Focus Areas:** ${[...focusAreas, customFocus].filter(Boolean).join(', ')}` : ''}

## French Summary
${editedFrench}

## English Summary
${editedEnglish}

---
Generated with Teaching Engine 2.0
    `;

    if (format === 'markdown') {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parent-summary-${selectedStudent.firstName}-${selectedStudent.lastName}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'html') {
      const htmlContent = content
        .replace(/# /g, '<h1>')
        .replace(/## /g, '<h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      const blob = new Blob([`<html><body>${htmlContent}</body></html>`], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parent-summary-${selectedStudent.firstName}-${selectedStudent.lastName}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'd need a PDF library - for now just show a message
      toast.info('PDF export would require additional library integration');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="AI Parent Summary Composer"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
          <select
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} (Grade {student.grade})
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Areas (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {focusOptions.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => handleFocusAreaToggle(area)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  focusAreas.includes(area)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add custom focus area..."
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Generate Button */}
        {!generatedSummary && (
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateSummary}
              disabled={!selectedStudentId || generateSummary.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {generateSummary.isPending ? (
                <>
                  <span className="animate-spin mr-2">🧠</span>
                  Generating Summary...
                </>
              ) : (
                <>🧠 Generate Summary</>
              )}
            </Button>
          </div>
        )}

        {/* Generated Summary Display */}
        {generatedSummary && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Generated Summary</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRegenerateSummary('formal')}
                  disabled={regenerateSummary.isPending}
                  variant="secondary"
                  size="sm"
                >
                  🔄 Regenerate
                </Button>
                <Button onClick={() => setIsEditing(!isEditing)} variant="secondary" size="sm">
                  ✏️ {isEditing ? 'Preview' : 'Edit'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* French Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  🇫🇷 French Summary
                </label>
                {isEditing ? (
                  <textarea
                    value={editedFrench}
                    onChange={(e) => setEditedFrench(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-3 border border-gray-300 rounded-md bg-gray-50 min-h-[200px] whitespace-pre-wrap">
                    {editedFrench}
                  </div>
                )}
              </div>

              {/* English Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  🇬🇧 English Summary
                </label>
                {isEditing ? (
                  <textarea
                    value={editedEnglish}
                    onChange={(e) => setEditedEnglish(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-3 border border-gray-300 rounded-md bg-gray-50 min-h-[200px] whitespace-pre-wrap">
                    {editedEnglish}
                  </div>
                )}
              </div>
            </div>

            {/* Draft Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDraft"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isDraft" className="text-sm text-gray-700">
                Save as draft
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button onClick={() => handleExport('markdown')} variant="secondary" size="sm">
                  📤 Export MD
                </Button>
                <Button onClick={() => handleExport('html')} variant="secondary" size="sm">
                  📤 Export HTML
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="secondary">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSummary}
                  disabled={saveSummary.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saveSummary.isPending ? 'Saving...' : '🗂️ Save to Student Profile'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
