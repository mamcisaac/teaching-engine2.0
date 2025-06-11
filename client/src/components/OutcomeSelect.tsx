import { useState } from 'react';
import { useOutcomeSearch } from '../api';

interface Props {
  selected: string[];
  onChange: (codes: string[]) => void;
}

export default function OutcomeSelect({ selected, onChange }: Props) {
  const [search, setSearch] = useState('');
  const { data = [] } = useOutcomeSearch(search);

  const add = (code: string) => {
    if (!selected.includes(code)) onChange([...selected, code]);
    setSearch('');
  };

  const remove = (code: string) => {
    onChange(selected.filter((c) => c !== code));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1">
        {selected.map((c) => (
          <span key={c} className="px-1 bg-gray-200 text-sm flex items-center gap-1">
            {c}
            <button type="button" onClick={() => remove(c)} aria-label={`Remove ${c}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="border p-1 mt-1 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search outcomes"
      />
      {search && data.length > 0 && (
        <ul className="absolute z-10 bg-white border mt-1 max-h-40 overflow-auto w-full">
          {data.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="block w-full text-left hover:bg-blue-100 px-1"
                onClick={() => add(o.code)}
              >
                {o.code} - {o.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
