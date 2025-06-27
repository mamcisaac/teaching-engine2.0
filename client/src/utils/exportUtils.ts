/**
 * Export Utilities
 * Functions for exporting plans to various formats
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Type definitions - using minimal types to avoid complex imports
interface CurriculumExpectation {
  expectation: {
    code: string;
    description: string;
  };
}

interface LessonPlan {
  title: string;
  date?: Date | string;
  subject?: string;
  expectations?: CurriculumExpectation[];
  [key: string]: unknown;
}

interface UnitPlan {
  title: string;
  expectations?: CurriculumExpectation[];
  [key: string]: unknown;
}

interface DaybookEntry {
  date: Date | string;
  notes?: string;
  [key: string]: unknown;
}

interface ExportOptions {
  filename?: string;
  format?: 'pdf' | 'docx' | 'html';
  includeComments?: boolean;
}

/**
 * Generate a print-friendly HTML version of a lesson plan
 */
export function generatePrintableHTML(
  plan: LessonPlan | UnitPlan | DaybookEntry,
  options: ExportOptions = {},
): string {
  const { includeComments: _includeComments = false } = options;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${plan.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        h1 {
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        .section {
          margin: 20px 0;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #34495e;
          margin-bottom: 10px;
        }
        .content {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        .materials {
          list-style-type: disc;
          margin-left: 20px;
        }
        .metadata {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }
        .expectations {
          background-color: #e8f4f8;
          padding: 10px;
          border-left: 4px solid #3498db;
          margin: 10px 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 10px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>${plan.title}</h1>
      
      <div class="metadata">
        ${plan.date ? `<div><strong>Date:</strong> ${new Date(plan.date as string | Date).toLocaleDateString()}</div>` : ''}
        ${plan.duration ? `<div><strong>Duration:</strong> ${plan.duration} minutes</div>` : ''}
        ${plan.grade ? `<div><strong>Grade:</strong> ${plan.grade}</div>` : ''}
        ${plan.subject ? `<div><strong>Subject:</strong> ${plan.subject}</div>` : ''}
      </div>

      ${
        plan.learningGoals
          ? `
        <div class="section">
          <div class="section-title">Learning Goals</div>
          <div class="content">${plan.learningGoals}</div>
        </div>
      `
          : ''
      }

      ${
        plan.mindsOn
          ? `
        <div class="section">
          <div class="section-title">Minds On</div>
          <div class="content">${plan.mindsOn}</div>
        </div>
      `
          : ''
      }

      ${
        plan.action
          ? `
        <div class="section">
          <div class="section-title">Action</div>
          <div class="content">${plan.action}</div>
        </div>
      `
          : ''
      }

      ${
        plan.consolidation
          ? `
        <div class="section">
          <div class="section-title">Consolidation</div>
          <div class="content">${plan.consolidation}</div>
        </div>
      `
          : ''
      }

      ${
        plan.materials && Array.isArray(plan.materials) && plan.materials.length > 0
          ? `
        <div class="section">
          <div class="section-title">Materials</div>
          <ul class="materials">
            ${(plan.materials as string[]).map((m: string) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      ${
        plan.assessmentNotes
          ? `
        <div class="section">
          <div class="section-title">Assessment</div>
          <div class="content">${plan.assessmentNotes}</div>
        </div>
      `
          : ''
      }

      ${
        plan.expectations && Array.isArray(plan.expectations) && plan.expectations.length > 0
          ? `
        <div class="section">
          <div class="section-title">Curriculum Expectations</div>
          ${(plan.expectations as CurriculumExpectation[])
            .map(
              (exp) => `
            <div class="expectations">
              <strong>${exp.expectation.code}:</strong> ${exp.expectation.description}
            </div>
          `,
            )
            .join('')}
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;

  return html;
}

/**
 * Export plan as PDF
 */
export async function exportToPDF(
  plan: LessonPlan | UnitPlan | DaybookEntry,
  options: ExportOptions = {},
): Promise<void> {
  const { filename = `${plan.title}-lesson-plan.pdf` } = options;

  // Create a temporary container for the HTML
  const container = document.createElement('div');
  container.innerHTML = generatePrintableHTML(plan, options);
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF, handling multiple pages if needed
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(filename);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Export plan as Word document (simplified version)
 */
export function exportToWord(
  plan: LessonPlan | UnitPlan | DaybookEntry,
  options: ExportOptions = {},
): void {
  const { filename = `${plan.title}-lesson-plan.docx` } = options;

  // Generate HTML content
  const html = generatePrintableHTML(plan, options);

  // Create a blob with the HTML content
  const blob = new Blob([html], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open print dialog for a plan
 */
export function printPlan(
  plan: LessonPlan | UnitPlan | DaybookEntry,
  options: ExportOptions = {},
): void {
  const html = generatePrintableHTML(plan, options);

  // Open a new window with the printable content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (user can cancel)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }
}
