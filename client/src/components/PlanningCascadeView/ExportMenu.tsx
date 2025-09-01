import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import type { CascadeNode } from '../../stores/cascadeStore';

interface ExportMenuProps {
  nodes: CascadeNode[];
  expandedNodes: Set<string>;
  nodeChildren: Map<string, CascadeNode[]>;
}

export function ExportMenu({ nodes, expandedNodes, nodeChildren }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const collectAllNodes = (): Array<{ level: number; node: CascadeNode }> => {
    const result: Array<{ level: number; node: CascadeNode }> = [];
    
    const traverse = (nodes: CascadeNode[], level: number) => {
      nodes.forEach(node => {
        result.push({ level, node });
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) traverse(children, level + 1);
        }
      });
    };
    
    traverse(nodes, 0);
    return result;
  };
  
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const allNodes = collectAllNodes();
      
      // Create PDF content
      const content = allNodes.map(({ level, node }) => {
        const indent = '  '.repeat(level);
        const progress = node.progress 
          ? ` (${node.progress.completed}/${node.progress.total})`
          : '';
        return `${indent}• ${node.label}${progress}`;
      }).join('\n');
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning-cascade-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const allNodes = collectAllNodes();
      
      // Create CSV content
      const headers = ['Level', 'Type', 'Name', 'Progress', 'Total', 'Completed'];
      const rows = allNodes.map(({ level, node }) => [
        level,
        node.type,
        node.label,
        node.progress ? `${Math.round((node.progress.completed / node.progress.total) * 100)}%` : '',
        node.progress?.total || '',
        node.progress?.completed || '',
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning-cascade-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={isExporting}
      >
        <FileText className="h-4 w-4 mr-1" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        disabled={isExporting}
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 mr-1" />
        Print
      </Button>
    </div>
  );
}