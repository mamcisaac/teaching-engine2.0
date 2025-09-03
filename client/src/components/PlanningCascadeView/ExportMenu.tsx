import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import type { CascadeNode } from '../../stores/cascadeStore';

interface ExportMenuProps {
  nodes: CascadeNode[];
  expandedNodes: Set<string>;
  nodeChildren: Map<string, CascadeNode[]>;
}

export function ExportMenu({ nodes, expandedNodes, nodeChildren }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const collectVisibleNodes = (): Array<{ level: number; node: CascadeNode }> => {
    const result: Array<{ level: number; node: CascadeNode }> = [];
    
    const traverse = (nodes: CascadeNode[], level: number) => {
      nodes.forEach(node => {
        result.push({ level, node });
        // Only include expanded children in export
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) traverse(children, level + 1);
        }
      });
    };
    
    traverse(nodes, 0);
    return result;
  };
  
  const exportAsText = async () => {
    setIsExporting(true);
    try {
      const visibleNodes = collectVisibleNodes();
      
      // Create well-formatted text content
      const content = [
        'Planning Cascade Export',
        `Generated: ${new Date().toLocaleString()}`,
        `Total Items: ${visibleNodes.length}`,
        '='.repeat(60),
        '',
        ...visibleNodes.map(({ level, node }) => {
          const indent = '  '.repeat(level);
          const typeLabel = `[${node.type.toUpperCase()}]`;
          const progress = node.progress 
            ? ` - Progress: ${node.progress.completed}/${node.progress.total} (${Math.round((node.progress.completed / node.progress.total) * 100)}%)`
            : '';
          return `${indent}${typeLabel} ${node.label}${progress}`;
        })
      ].join('\n');
      
      // Download as text file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cascade-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportAsCSV = async () => {
    setIsExporting(true);
    try {
      const visibleNodes = collectVisibleNodes();
      
      // Create proper CSV with escaping
      const headers = ['Level', 'Type', 'Name', 'Completed', 'Total', 'Percentage'];
      const rows = visibleNodes.map(({ level, node }) => [
        level,
        node.type,
        // Properly escape quotes in labels
        node.label.includes(',') || node.label.includes('"') 
          ? `"${node.label.replace(/"/g, '""')}"` 
          : node.label,
        node.progress?.completed || 0,
        node.progress?.total || 0,
        node.progress 
          ? Math.round((node.progress.completed / node.progress.total) * 100) + '%'
          : 'N/A',
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Download as CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cascade-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      const visibleNodes = collectVisibleNodes();
      const content = visibleNodes.map(({ level, node }) => {
        const indent = '  '.repeat(level);
        const progress = node.progress 
          ? ` [${node.progress.completed}/${node.progress.total}]`
          : '';
        return `${indent}• ${node.label}${progress}`;
      }).join('\n');
      
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };
  
  const handlePrint = () => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area { position: absolute; left: 0; top: 0; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Clean up
    document.head.removeChild(style);
  };
  
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsText}
        disabled={isExporting}
        title="Export as text file"
      >
        <FileText className="h-4 w-4 mr-1" />
        Text
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsCSV}
        disabled={isExporting}
        title="Export as CSV (opens in Excel)"
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        title="Copy to clipboard"
      >
        <Copy className="h-4 w-4 mr-1" />
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        title="Print current view"
      >
        <Printer className="h-4 w-4 mr-1" />
        Print
      </Button>
    </div>
  );
}