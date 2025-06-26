import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Globe2, Eye, EyeOff } from 'lucide-react';

interface BilingualPlanViewProps {
  children: React.ReactNode;
  mode?: 'side-by-side' | 'toggle' | 'overlay';
  defaultMode?: 'side-by-side' | 'toggle' | 'overlay';
}

export default function BilingualPlanView({ 
  children, 
  mode: controlledMode,
  defaultMode = 'toggle' 
}: BilingualPlanViewProps) {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = React.useState(controlledMode || defaultMode);
  const [showEnglish, setShowEnglish] = React.useState(true);
  const [showFrench, setShowFrench] = React.useState(true);

  // Allow controlled mode
  const activeMode = controlledMode || viewMode;

  const renderSideBySide = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-t-lg">
          <h3 className="font-medium text-blue-900 flex items-center gap-2">
            <span className="text-lg">🇨🇦</span> English
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEnglish(!showEnglish)}
          >
            {showEnglish ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
        {showEnglish && (
          <div className="p-4 border border-t-0 rounded-b-lg">
            {React.cloneElement(children as React.ReactElement, { language: 'en' })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-t-lg">
          <h3 className="font-medium text-green-900 flex items-center gap-2">
            <span className="text-lg">🇫🇷</span> Français
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFrench(!showFrench)}
          >
            {showFrench ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
        {showFrench && (
          <div className="p-4 border border-t-0 rounded-b-lg">
            {React.cloneElement(children as React.ReactElement, { language: 'fr' })}
          </div>
        )}
      </div>
    </div>
  );

  const renderToggle = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium text-gray-700">{t('teaching_language')}:</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={language === 'en' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowEnglish(true) && setShowFrench(false)}
            className="flex items-center gap-2"
          >
            <span>🇨🇦</span> English
          </Button>
          <Button
            type="button"
            variant={language === 'fr' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFrench(true) && setShowEnglish(false)}
            className="flex items-center gap-2"
          >
            <span>🇫🇷</span> Français
          </Button>
        </div>
      </div>
      {children}
    </div>
  );

  const renderOverlay = () => (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-white rounded-lg shadow-sm border p-2 flex gap-2">
          <button
            type="button"
            onClick={() => setShowEnglish(!showEnglish)}
            className={`p-1.5 rounded ${showEnglish ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
            title="Toggle English"
          >
            <span className="text-sm">🇨🇦</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFrench(!showFrench)}
            className={`p-1.5 rounded ${showFrench ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}
            title="Toggle French"
          >
            <span className="text-sm">🇫🇷</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {showEnglish && showFrench ? (
          // Show both with visual distinction
          <div className="space-y-4">
            <div className="border-l-4 border-blue-400 pl-4">
              {React.cloneElement(children as React.ReactElement, { language: 'en' })}
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              {React.cloneElement(children as React.ReactElement, { language: 'fr' })}
            </div>
          </div>
        ) : showEnglish ? (
          React.cloneElement(children as React.ReactElement, { language: 'en' })
        ) : showFrench ? (
          React.cloneElement(children as React.ReactElement, { language: 'fr' })
        ) : (
          <div className="text-center text-gray-500 py-8">
            {t('no_language_selected', 'Please select at least one language to view')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bilingual-plan-view">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe2 className="h-5 w-5" />
          {t('bilingual_content')}
        </h2>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant={activeMode === 'side-by-side' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('side-by-side')}
          >
            {t('side_by_side', 'Side by Side')}
          </Button>
          <Button
            type="button"
            variant={activeMode === 'toggle' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('toggle')}
          >
            {t('toggle', 'Toggle')}
          </Button>
          <Button
            type="button"
            variant={activeMode === 'overlay' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overlay')}
          >
            {t('overlay', 'Overlay')}
          </Button>
        </div>
      </div>

      {activeMode === 'side-by-side' && renderSideBySide()}
      {activeMode === 'toggle' && renderToggle()}
      {activeMode === 'overlay' && renderOverlay()}
    </div>
  );
}