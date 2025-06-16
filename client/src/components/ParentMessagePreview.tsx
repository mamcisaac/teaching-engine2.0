import React, { useState } from 'react';
import { ParentMessage } from '../types';

interface Props {
  message: ParentMessage;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ParentMessagePreview({ message, onEdit, onDelete }: Props) {
  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'en' | 'both'>('both');

  const handleExportPDF = () => {
    // Create a printable version of the newsletter
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = generatePrintableHTML(message, activeLanguage);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyHTML = async () => {
    const htmlContent = generateExportHTML(message, activeLanguage);
    try {
      await navigator.clipboard.writeText(htmlContent);
      // You could add a toast notification here
      alert('HTML content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy HTML:', err);
      // Fallback: create a text area and copy
      const textArea = document.createElement('textarea');
      textArea.value = htmlContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('HTML content copied to clipboard!');
    }
  };

  const handleCopyMarkdown = async () => {
    const markdownContent = generateMarkdown(message, activeLanguage);
    try {
      await navigator.clipboard.writeText(markdownContent);
      alert('Markdown content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy Markdown:', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = markdownContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Markdown content copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{message.title}</h1>
          <p className="text-gray-600">{message.timeframe}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(message.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveLanguage('both')}
            className={`px-3 py-2 text-sm rounded ${
              activeLanguage === 'both'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Both Languages
          </button>
          <button
            onClick={() => setActiveLanguage('fr')}
            className={`px-3 py-2 text-sm rounded ${
              activeLanguage === 'fr'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇫🇷 Français
          </button>
          <button
            onClick={() => setActiveLanguage('en')}
            className={`px-3 py-2 text-sm rounded ${
              activeLanguage === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇬🇧 English
          </button>
        </div>

        {/* Export Options */}
        <div className="flex space-x-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            📄 Print/PDF
          </button>
          <button
            onClick={handleCopyHTML}
            className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            📋 Copy HTML
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
          >
            📝 Copy Markdown
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="prose max-w-none">
        {(activeLanguage === 'both' || activeLanguage === 'fr') && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              🇫🇷 Version française
            </h2>
            <div
              className="newsletter-content bg-gray-50 p-4 rounded border"
              dangerouslySetInnerHTML={{ __html: message.contentFr }}
            />
          </div>
        )}

        {(activeLanguage === 'both' || activeLanguage === 'en') && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              🇬🇧 English Version
            </h2>
            <div
              className="newsletter-content bg-gray-50 p-4 rounded border"
              dangerouslySetInnerHTML={{ __html: message.contentEn }}
            />
          </div>
        )}

        {/* Linked Content Summary */}
        {(message.linkedOutcomes?.length || message.linkedActivities?.length) && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-800 mb-4">📚 Curriculum Connections</h3>

            {message.linkedOutcomes && message.linkedOutcomes.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">🎯 Learning Outcomes:</h4>
                <div className="flex flex-wrap gap-2">
                  {message.linkedOutcomes.map((item) => (
                    <span
                      key={item.outcome.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {item.outcome.code}: {item.outcome.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {message.linkedActivities && message.linkedActivities.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🏃‍♀️ Activities:</h4>
                <div className="flex flex-wrap gap-2">
                  {message.linkedActivities.map((item) => (
                    <span
                      key={item.activity.id}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {item.activity.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for generating export formats
function generatePrintableHTML(message: ParentMessage, language: 'fr' | 'en' | 'both'): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${message.title}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .language-header { background: #f0f0f0; padding: 10px; margin: 20px 0 10px 0; }
        .outcomes { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc; }
        .tag { background: #e0e0e0; padding: 4px 8px; margin: 2px; border-radius: 4px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${message.title}</h1>
        <p>${message.timeframe}</p>
      </div>
      
      ${
        language === 'both' || language === 'fr'
          ? `
        <div class="section">
          <div class="language-header"><h2>🇫🇷 Version française</h2></div>
          <div>${message.contentFr}</div>
        </div>
      `
          : ''
      }
      
      ${
        language === 'both' || language === 'en'
          ? `
        <div class="section">
          <div class="language-header"><h2>🇬🇧 English Version</h2></div>
          <div>${message.contentEn}</div>
        </div>
      `
          : ''
      }
      
      ${
        message.linkedOutcomes?.length || message.linkedActivities?.length
          ? `
        <div class="outcomes">
          <h3>📚 Curriculum Connections</h3>
          ${
            message.linkedOutcomes?.length
              ? `
            <h4>🎯 Learning Outcomes:</h4>
            ${message.linkedOutcomes.map((item) => `<span class="tag">${item.outcome.code}: ${item.outcome.description}</span>`).join('')}
          `
              : ''
          }
          ${
            message.linkedActivities?.length
              ? `
            <h4>🏃‍♀️ Activities:</h4>
            ${message.linkedActivities.map((item) => `<span class="tag">${item.activity.title}</span>`).join('')}
          `
              : ''
          }
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;
}

function generateExportHTML(message: ParentMessage, language: 'fr' | 'en' | 'both'): string {
  let content = `<div class="parent-newsletter">
    <h1>${message.title}</h1>
    <p class="timeframe">${message.timeframe}</p>
  `;

  if (language === 'both' || language === 'fr') {
    content += `
      <div class="french-version">
        <h2>🇫🇷 Version française</h2>
        <div class="content">${message.contentFr}</div>
      </div>
    `;
  }

  if (language === 'both' || language === 'en') {
    content += `
      <div class="english-version">
        <h2>🇬🇧 English Version</h2>
        <div class="content">${message.contentEn}</div>
      </div>
    `;
  }

  content += '</div>';
  return content;
}

function generateMarkdown(message: ParentMessage, language: 'fr' | 'en' | 'both'): string {
  let content = `# ${message.title}\n\n**${message.timeframe}**\n\n`;

  if (language === 'both' || language === 'fr') {
    content += `## 🇫🇷 Version française\n\n${stripHTML(message.contentFr)}\n\n`;
  }

  if (language === 'both' || language === 'en') {
    content += `## 🇬🇧 English Version\n\n${stripHTML(message.contentEn)}\n\n`;
  }

  if (message.linkedOutcomes?.length || message.linkedActivities?.length) {
    content += `## 📚 Curriculum Connections\n\n`;

    if (message.linkedOutcomes?.length) {
      content += `### 🎯 Learning Outcomes:\n`;
      message.linkedOutcomes.forEach((item) => {
        content += `- ${item.outcome.code}: ${item.outcome.description}\n`;
      });
      content += '\n';
    }

    if (message.linkedActivities?.length) {
      content += `### 🏃‍♀️ Activities:\n`;
      message.linkedActivities.forEach((item) => {
        content += `- ${item.activity.title}\n`;
      });
      content += '\n';
    }
  }

  return content;
}

function stripHTML(html: string): string {
  // Simple HTML stripping for markdown conversion
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
