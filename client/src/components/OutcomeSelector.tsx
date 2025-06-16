import { useState, useEffect } from 'react';
import { useOutcomes } from '../api';
import { Outcome } from '../types';

interface Props {
  selectedOutcomes: string[];
  onChange: (outcomes: string[]) => void;
  className?: string;
}

export function OutcomeSelector({ selectedOutcomes, onChange, className = '' }: Props) {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const { data: outcomes = [], isLoading } = useOutcomes({
    subject: selectedSubject || undefined,
    search: search || undefined,
  });
  const [availableOutcomes, setAvailableOutcomes] = useState<Outcome[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Extract unique subjects for the dropdown
  const subjects = [...new Set(outcomes.map((o) => o.subject))];

  // Filter and sort outcomes
  useEffect(() => {
    const filtered = outcomes.sort((a, b) => a.code.localeCompare(b.code));
    setAvailableOutcomes(filtered);
  }, [outcomes]);

  // Toggle an outcome selection
  const toggleOutcome = (code: string) => {
    if (selectedOutcomes.includes(code)) {
      onChange(selectedOutcomes.filter((c) => c !== code));
    } else {
      onChange([...selectedOutcomes, code]);
    }
  };

  // Get outcome details by code
  const getOutcomeByCode = (code: string): Outcome | undefined => {
    return outcomes.find((o) => o.code === code);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Curriculum Outcomes</label>

      {/* Selected outcomes display */}
      <div className="mb-2 flex flex-wrap gap-1">
        {selectedOutcomes.map((code) => {
          const outcome = getOutcomeByCode(code);
          return (
            <div
              key={code}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
              title={outcome?.description || ''}
            >
              <span className="font-mono">{code}</span>
              <button
                className="ml-1 text-blue-600 hover:text-blue-800"
                onClick={() => toggleOutcome(code)}
              >
                ×
              </button>
            </div>
          );
        })}
        {selectedOutcomes.length === 0 && (
          <span className="text-sm text-gray-500 italic">No outcomes selected</span>
        )}
      </div>

      {/* Dropdown selector */}
      <div className="relative">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Search outcomes..."
            className="p-2 border rounded flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="p-2 border rounded bg-gray-100"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownOpen ? '▲' : '▼'}
          </button>
        </div>

        {dropdownOpen && (
          <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-center text-gray-500">Loading outcomes...</div>
            ) : availableOutcomes.length === 0 ? (
              <div className="p-2 text-center text-gray-500">No outcomes found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availableOutcomes.map((outcome) => (
                  <li
                    key={outcome.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      selectedOutcomes.includes(outcome.code) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleOutcome(outcome.code)}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedOutcomes.includes(outcome.code)}
                        onChange={() => toggleOutcome(outcome.code)}
                        className="mt-1 mr-2"
                      />
                      <div>
                        <div className="font-mono text-sm">{outcome.code}</div>
                        <div className="text-sm">{outcome.description}</div>
                        <div className="text-xs text-gray-500">
                          {outcome.subject} - Grade {outcome.grade}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
