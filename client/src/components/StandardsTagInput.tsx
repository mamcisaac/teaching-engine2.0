import { useState } from 'react';

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

export default function StandardsTagInput({ value, onChange }: Props) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed) && value.length < 10) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };
  return (
    <div className="border p-2 rounded">
      <div className="flex flex-wrap gap-1 mb-1">
        {value.map((c) => (
          <span key={c} className="px-1 bg-blue-200 rounded text-sm">
            {c}
            <button
              type="button"
              className="ml-1 text-red-600"
              onClick={() => onChange(value.filter((v) => v !== c))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Add code"
        className="border p-1 w-full"
      />
    </div>
  );
}
