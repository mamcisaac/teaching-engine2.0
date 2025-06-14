import { useState, useEffect } from 'react';
import { api } from '../api';
import type { Outcome } from '../types';

interface Props {
  value: string[];
  onChange: (codes: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

export default function OutcomeSelect({ value, onChange, multiple = true, placeholder = 'Search outcomes...' }: Props) {
  const [search, setSearch] = useState('');
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch outcomes based on search term
  useEffect(() => {
    if (!search) return;
    
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/outcomes?search=${encodeURIComponent(search)}`);
        setOutcomes(res.data);
      } catch (error) {
        console.error('Error fetching outcomes:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (code: string) => {
    if (multiple) {
      // Add to array if not already selected
      if (!value.includes(code)) {
        onChange([...value, code]);
      }
    } else {
      // Just replace the single value
      onChange([code]);
      setOpen(false);
    }
    setSearch('');
  };

  const handleRemove = (code: string) => {
    onChange(value.filter(c => c !== code));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 p-2 border rounded min-h-10">
        {value.map(code => (
          <div key={code} className="flex items-center bg-blue-100 px-2 py-0.5 rounded">
            <span>{code}</span>
            <button 
              type="button"
              className="ml-1 text-gray-500 hover:text-gray-700"
              onClick={() => handleRemove(code)}
            >
              &times;
            </button>
          </div>
        ))}
        
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={value.length ? '' : placeholder}
          className="flex-1 min-w-24 border-none focus:outline-none"
        />
      </div>
      
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {loading && <div className="p-2 text-center text-gray-500">Loading...</div>}
          
          {!loading && outcomes.length === 0 && search && (
            <div className="p-2 text-center text-gray-500">No outcomes found</div>
          )}
          
          {outcomes.map(outcome => (
            <div 
              key={outcome.id} 
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(outcome.code)}
            >
              <div className="font-medium">{outcome.code}</div>
              <div className="text-sm text-gray-600">{outcome.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}