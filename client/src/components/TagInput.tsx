import { useState } from 'react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder }: Props) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="px-1 bg-gray-200 text-sm flex items-center gap-1">
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((c) => c !== t))}
              aria-label={`Remove ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="border p-1 mt-1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
