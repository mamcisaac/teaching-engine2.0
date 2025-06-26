import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Undo, Redo, Type, Save, Send,
  Eye, Edit3, Languages, Trash2, RefreshCw
} from 'lucide-react';
import { NewsletterSection, NewsletterDraft, NewsletterTone } from '../types/newsletter';
import { cn } from '../lib/utils';

interface NewsletterEditorProps {
  draft: NewsletterDraft;
  isGenerating?: boolean;
  onSave: (draft: NewsletterDraft) => void;
  onSend?: (draft: NewsletterDraft) => void;
  onRegenerate?: (tone?: NewsletterTone) => void;
  className?: string;
}

export default function NewsletterEditor({
  draft,
  isGenerating = false,
  onSave,
  onSend,
  onRegenerate,
  className,
}: NewsletterEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [previewMode, setPreviewMode] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localDraft, setLocalDraft] = useState<NewsletterDraft>(draft);
  
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Update local draft when prop changes
  useEffect(() => {
    setLocalDraft(draft);
    setUnsavedChanges(false);
  }, [draft]);

  // Auto-save functionality
  useEffect(() => {
    if (unsavedChanges) {
      const timer = setTimeout(() => {
        onSave(localDraft);
        setUnsavedChanges(false);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [localDraft, unsavedChanges, onSave]);

  const updateSection = (sectionId: string, field: 'content' | 'contentFr', value: string) => {
    const updatedSections = localDraft.sections.map(section =>
      section.id === sectionId
        ? { ...section, [field]: value }
        : section
    );
    
    setLocalDraft({ ...localDraft, sections: updatedSections });
    setUnsavedChanges(true);
  };

  const updateTitle = (field: 'title' | 'titleFr', value: string) => {
    setLocalDraft({ ...localDraft, [field]: value });
    setUnsavedChanges(true);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const removeSection = (sectionId: string) => {
    const updatedSections = localDraft.sections.filter(section => section.id !== sectionId);
    setLocalDraft({ ...localDraft, sections: updatedSections });
    setUnsavedChanges(true);
  };

  const addNewSection = () => {
    const newSection: NewsletterSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      titleFr: 'Nouvelle Section',
      content: 'Start typing your content here...',
      contentFr: 'Commencez à taper votre contenu ici...',
      isEditable: true,
      order: localDraft.sections.length,
    };
    
    setLocalDraft({
      ...localDraft,
      sections: [...localDraft.sections, newSection]
    });
    setUnsavedChanges(true);
    setEditingSection(newSection.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, _sectionId: string, _field: 'content' | 'contentFr') => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 's':
          e.preventDefault();
          onSave(localDraft);
          setUnsavedChanges(false);
          break;
      }
    }
  };

  const renderToolbar = (_sectionId: string) => (
    <div className="flex items-center gap-1 p-2 border-b bg-gray-50 rounded-t-lg">
      <button
        onClick={() => formatText('bold')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText('italic')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText('underline')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => formatText('insertUnorderedList')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText('insertOrderedList')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => formatText('undo')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText('redo')}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="flex-1" />
      
      <button
        onClick={() => setEditingSection(null)}
        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium"
      >
        Done
      </button>
    </div>
  );

  const renderSection = (section: NewsletterSection) => {
    const isEditing = editingSection === section.id;
    const content = language === 'en' ? section.content : section.contentFr;
    const title = language === 'en' ? section.title : section.titleFr;

    return (
      <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
          <div className="flex-1">
            {isEditing && section.isEditable ? (
              <input
                type="text"
                value={title}
                onChange={(e) => updateSection(
                  section.id, 
                  language === 'en' ? 'title' : 'titleFr', 
                  e.target.value
                )}
                className="w-full px-2 py-1 text-sm font-medium bg-white border border-gray-300 rounded"
                placeholder="Section title..."
              />
            ) : (
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {section.isEditable && (
              <>
                <button
                  onClick={() => setEditingSection(isEditing ? null : section.id)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                  title={isEditing ? "Stop editing" : "Edit section"}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeSection(section.id)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section content */}
        {isEditing && section.isEditable ? (
          <div>
            {renderToolbar(section.id)}
            <div
              ref={(el) => editorRefs.current[section.id] = el}
              contentEditable
              className="p-4 min-h-[100px] focus:outline-none prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
              onBlur={(e) => updateSection(
                section.id,
                language === 'en' ? 'content' : 'contentFr',
                e.currentTarget.innerHTML
              )}
              onKeyDown={(e) => handleKeyDown(e, section.id, language === 'en' ? 'content' : 'contentFr')}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
        ) : (
          <div 
            className="p-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Header controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Editor</h1>
          {unsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">
              Unsaved changes...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              "border border-gray-300 hover:bg-gray-50"
            )}
          >
            <Languages className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'en' ? 'English' : 'Français'}
            </span>
          </button>

          {/* Preview toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              previewMode
                ? "bg-blue-600 text-white"
                : "border border-gray-300 hover:bg-gray-50"
            )}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              {previewMode ? 'Edit' : 'Preview'}
            </span>
          </button>

          {/* Action buttons */}
          {!previewMode && (
            <>
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate()}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                  <span className="text-sm font-medium">Regenerate</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  onSave(localDraft);
                  setUnsavedChanges(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save</span>
              </button>
              
              {onSend && (
                <button
                  onClick={() => onSend(localDraft)}
                  disabled={localDraft.isDraft}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-medium">Send</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Newsletter title */}
      <div className="mb-6">
        {!previewMode ? (
          <input
            type="text"
            value={language === 'en' ? localDraft.title : localDraft.titleFr}
            onChange={(e) => updateTitle(
              language === 'en' ? 'title' : 'titleFr',
              e.target.value
            )}
            className="w-full text-3xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            placeholder="Newsletter title..."
          />
        ) : (
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'en' ? localDraft.title : localDraft.titleFr}
          </h1>
        )}
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">Generating newsletter content...</span>
          </div>
        </div>
      )}

      {/* Newsletter sections */}
      <div className="space-y-6">
        {localDraft.sections
          .sort((a, b) => a.order - b.order)
          .map(renderSection)}
        
        {/* Add section button */}
        {!previewMode && (
          <button
            onClick={addNewSection}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Type className="w-5 h-5" />
              <span className="font-medium">Add New Section</span>
            </div>
          </button>
        )}
      </div>

      {/* Footer info */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <div className="flex justify-between items-center">
          <div>
            Recipients: {localDraft.studentIds.length} parents | 
            Date range: {localDraft.dateFrom.toLocaleDateString()} - {localDraft.dateTo.toLocaleDateString()} |
            Tone: {localDraft.tone}
          </div>
          <div>
            {localDraft.isDraft ? 'Draft' : 'Finalized'} • 
            Last updated: {localDraft.updatedAt?.toLocaleString() || 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
}