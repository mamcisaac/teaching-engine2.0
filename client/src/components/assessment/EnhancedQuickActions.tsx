import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  PrinterIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { backupSystem } from '../../utils/backupSystem';
import { toast } from 'sonner';

interface EnhancedQuickActionsProps {
  students: Array<{ id: string; firstName: string; lastName: string }>;
  onImportComplete?: () => void;
}

export function EnhancedQuickActions({ students, onImportComplete }: EnhancedQuickActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    backupSystem.exportAllData();
    toast.success('Backup downloaded successfully!');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await backupSystem.importData(file);
    if (result.success) {
      toast.success(result.message);
      onImportComplete?.();
    } else {
      toast.error(result.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportReportCards = () => {
    backupSystem.exportReportCardData();
    toast.success('Report card data exported!');
  };

  const handleArchiveYear = () => {
    if (window.confirm('Are you sure you want to archive this school year and start fresh?')) {
      backupSystem.archiveAndStartNewYear();
      toast.success('School year archived. Please refresh to see the new year.');
      // Call the import complete callback to refresh the parent
      onImportComplete?.();
    }
  };

  const handleGenerateParentReport = () => {
    // For demo, generate for first student
    const student = students[0];
    if (student) {
      backupSystem.generateParentReport(
        student.id,
        `${student.firstName} ${student.lastName}`
      );
      toast.success(`Parent report generated for ${student.firstName}!`);
    }
  };

  const handlePrintGroups = () => {
    const groups = localStorage.getItem('tomorrow-groups');
    if (!groups) {
      toast.error('No groups to print. Create groups first!');
      return;
    }

    const data = JSON.parse(groups);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Differentiation Groups - ${new Date().toLocaleDateString()}</title>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { 
      color: #1e40af;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 10px;
    }
    .group { 
      margin: 20px 0; 
      padding: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      break-inside: avoid;
    }
    .group-title { 
      font-weight: bold; 
      color: #374151;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .student-list { 
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 10px 0;
    }
    .student {
      padding: 5px 10px;
      background: #f3f4f6;
      border-radius: 4px;
      font-size: 14px;
    }
    .strategy {
      margin-top: 10px;
      padding: 10px;
      background: #fef3c7;
      border-radius: 4px;
      font-size: 13px;
    }
    .reteaching { border-left: 4px solid #ef4444; }
    .support { border-left: 4px solid #f59e0b; }
    .independent { border-left: 4px solid #10b981; }
    .extension { border-left: 4px solid #3b82f6; }
    @media print {
      body { margin: 0; padding: 10px; }
      .group { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Differentiation Groups</h1>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>For:</strong> ${data.forDate || 'Tomorrow'}</p>
  
  <div class="group reteaching">
    <div class="group-title">🔴 Reteaching Group (${data.reteaching?.length || 0} students)</div>
    <div class="student-list">
      ${(data.reteaching || []).map((id: string) => {
        const student = students.find(s => s.id === id);
        return `<div class="student">${student ? `${student.firstName} ${student.lastName}` : id}</div>`;
      }).join('')}
    </div>
    <div class="strategy">
      <strong>Strategy:</strong> Use concrete manipulatives, break into smaller steps, provide visual aids
    </div>
  </div>

  <div class="group support">
    <div class="group-title">🟡 Support Group (${data.support?.length || 0} students)</div>
    <div class="student-list">
      ${(data.support || []).map((id: string) => {
        const student = students.find(s => s.id === id);
        return `<div class="student">${student ? `${student.firstName} ${student.lastName}` : id}</div>`;
      }).join('')}
    </div>
    <div class="strategy">
      <strong>Strategy:</strong> Provide scaffolding, use graphic organizers, offer guided practice
    </div>
  </div>

  <div class="group independent">
    <div class="group-title">🟢 Independent Group (${data.independent?.length || 0} students)</div>
    <div class="student-list">
      ${(data.independent || []).map((id: string) => {
        const student = students.find(s => s.id === id);
        return `<div class="student">${student ? `${student.firstName} ${student.lastName}` : id}</div>`;
      }).join('')}
    </div>
    <div class="strategy">
      <strong>Strategy:</strong> Provide choice menus, encourage peer collaboration, self-paced activities
    </div>
  </div>

  <div class="group extension">
    <div class="group-title">⭐ Extension Group (${data.extension?.length || 0} students)</div>
    <div class="student-list">
      ${(data.extension || []).map((id: string) => {
        const student = students.find(s => s.id === id);
        return `<div class="student">${student ? `${student.firstName} ${student.lastName}` : id}</div>`;
      }).join('')}
    </div>
    <div class="strategy">
      <strong>Strategy:</strong> Offer enrichment activities, encourage creative projects, provide leadership roles
    </div>
  </div>

  <script>window.print();</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <ChartBarIcon className="h-5 w-5" />
        Teacher Tools
      </button>

      {showActions && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Backup All Data</span>
            </button>

            <label className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
              <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Import Backup</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <div className="my-1 border-t border-gray-200" />

            <button
              onClick={handleGenerateParentReport}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Parent Report (Sample)</span>
            </button>

            <button
              onClick={handleExportReportCards}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Export Report Cards</span>
            </button>

            <button
              onClick={handlePrintGroups}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <PrinterIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Print Groups</span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            <button
              onClick={handleArchiveYear}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-md transition-colors text-red-600"
            >
              <ArchiveBoxIcon className="h-5 w-5" />
              <span className="text-sm">Archive School Year</span>
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
        <div className="grid grid-cols-2 gap-1">
          <div>↑↓←→ Navigate</div>
          <div>1-4 Set Level</div>
          <div>Space: Cycle</div>
          <div>G: Generate Groups</div>
          <div>S: Save</div>
          <div>Esc: Close</div>
        </div>
      </div>
    </div>
  );
}