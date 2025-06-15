import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BilingualTextInputProps {
  label: string;
  valueEn: string;
  valueFr: string;
  onChangeEn: (value: string) => void;
  onChangeFr: (value: string) => void;
  placeholder?: string;
  placeholderEn?: string;
  placeholderFr?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export default function BilingualTextInput({
  label,
  valueEn,
  valueFr,
  onChangeEn,
  onChangeFr,
  placeholder,
  placeholderEn,
  placeholderFr,
  required = false,
  multiline = false,
  rows = 3,
  className = '',
}: BilingualTextInputProps) {
  const { t, language } = useLanguage();
  const [showBothLanguages, setShowBothLanguages] = useState(false);

  const InputComponent = multiline ? 'textarea' : 'input';

  const inputProps = {
    className:
      'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    required,
    ...(multiline ? { rows } : { type: 'text' }),
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowBothLanguages(!showBothLanguages)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
            />
          </svg>
          {t('bilingual_content')}
        </button>
      </div>

      {showBothLanguages ? (
        <div className="space-y-3">
          {/* English Input */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                🇨🇦 {t('english')}
              </span>
            </div>
            <InputComponent
              {...inputProps}
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder={placeholderEn || placeholder}
            />
          </div>

          {/* French Input */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                🇫🇷 {t('french')}
              </span>
            </div>
            <InputComponent
              {...inputProps}
              value={valueFr}
              onChange={(e) => onChangeFr(e.target.value)}
              placeholder={placeholderFr || placeholder}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
              {language === 'en' ? '🇨🇦 English' : '🇫🇷 Français'}
            </span>
          </div>
          <InputComponent
            {...inputProps}
            value={language === 'en' ? valueEn : valueFr}
            onChange={(e) =>
              language === 'en' ? onChangeEn(e.target.value) : onChangeFr(e.target.value)
            }
            placeholder={
              language === 'en' ? placeholderEn || placeholder : placeholderFr || placeholder
            }
          />
          {/* Show preview of other language if it exists */}
          {((language === 'en' && valueFr) || (language === 'fr' && valueEn)) && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <span className="font-medium">
                {language === 'en' ? '🇫🇷 French:' : '🇨🇦 English:'}
              </span>
              <div className="mt-1 italic">{language === 'en' ? valueFr : valueEn}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
