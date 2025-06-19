import { useState } from 'react';
import { useStudents, useGenerateParentSummary } from '../api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

interface ParentSummary {
  french: string;
  english: string;
}

export function ParentSummaryComposer() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [focus, setFocus] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState<ParentSummary | null>(null);
  const [editedSummary, setEditedSummary] = useState<ParentSummary | null>(null);

  const { data: students = [] } = useStudents();
  const generateSummary = useGenerateParentSummary();

  const handleGenerateSummary = async () => {
    if (!selectedStudentId || !fromDate || !toDate) {
      return;
    }

    try {
      const summary = await generateSummary.mutateAsync({
        studentId: selectedStudentId,
        from: fromDate,
        to: toDate,
        focus,
      });
      setGeneratedSummary(summary);
      setEditedSummary(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleAddFocus = () => {
    if (focusInput.trim() && !focus.includes(focusInput.trim())) {
      setFocus([...focus, focusInput.trim()]);
      setFocusInput('');
    }
  };

  const handleRemoveFocus = (item: string) => {
    setFocus(focus.filter((f) => f !== item));
  };

  const handleExport = (format: 'pdf' | 'html' | 'markdown') => {
    if (!editedSummary) return;

    const content = `# Parent Summary

## French
${editedSummary.french}

## English
${editedSummary.english}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parent-summary-${selectedStudentId}-${fromDate}-to-${toDate}.${format === 'markdown' ? 'md' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Parent Summary Composer</h2>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="student">Student</Label>
            <select
              id="student"
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="toDate">To Date</Label>
              <Input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Focus Areas Section */}
        <div className="mb-6">
          <Label htmlFor="focus">Focus Areas (optional)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="focus"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="e.g., oral language, literacy"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFocus()}
            />
            <Button type="button" onClick={handleAddFocus} variant="outline">
              Add
            </Button>
          </div>
          {focus.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {focus.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveFocus(item)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateSummary}
          disabled={!selectedStudentId || !fromDate || !toDate || generateSummary.isPending}
          className="w-full md:w-auto"
        >
          {generateSummary.isPending ? '🧠 Generating...' : '🧠 Generate Summary'}
        </Button>
      </div>

      {/* Generated Summary Section */}
      {generatedSummary && editedSummary && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Summary</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* French Summary */}
            <div>
              <Label htmlFor="french-summary">🇫🇷 French Summary</Label>
              <Textarea
                id="french-summary"
                value={editedSummary.french}
                onChange={(e) =>
                  setEditedSummary({
                    ...editedSummary,
                    french: e.target.value,
                  })
                }
                rows={8}
                className="w-full"
              />
            </div>

            {/* English Summary */}
            <div>
              <Label htmlFor="english-summary">🇬🇧 English Summary</Label>
              <Textarea
                id="english-summary"
                value={editedSummary.english}
                onChange={(e) =>
                  setEditedSummary({
                    ...editedSummary,
                    english: e.target.value,
                  })
                }
                rows={8}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button onClick={() => setEditedSummary(generatedSummary)} variant="outline">
              🔄 Reset to Original
            </Button>
            <Button
              onClick={handleGenerateSummary}
              variant="outline"
              disabled={generateSummary.isPending}
            >
              🔄 Regenerate
            </Button>
            <Button onClick={() => handleExport('markdown')} variant="outline">
              📤 Export (Markdown)
            </Button>
            <Button onClick={() => handleExport('html')} variant="outline">
              📤 Export (HTML)
            </Button>
            <Button
              onClick={() =>
                navigator.clipboard?.writeText(
                  `French:\n${editedSummary.french}\n\nEnglish:\n${editedSummary.english}`,
                )
              }
              variant="outline"
            >
              📋 Copy to Clipboard
            </Button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Summaries</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select a meaningful date range (e.g., term or month)</li>
          <li>• Add focus areas to target specific subjects or skills</li>
          <li>• Edit the generated text to add personal observations</li>
          <li>• Use these summaries for parent-teacher conferences or report cards</li>
        </ul>
      </div>
    </div>
  );
}
