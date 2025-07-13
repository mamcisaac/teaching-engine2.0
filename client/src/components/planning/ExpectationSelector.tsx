import { Check, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

import type { CurriculumExpectation } from '../../hooks/useETFOPlanning';
import { useCurriculumExpectations } from '../../hooks/useETFOPlanning';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';

interface ExpectationSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  multiSelect?: boolean;
  grade?: number;
  subject?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

type GroupedExpectations = Record<string, Record<string, CurriculumExpectation[]>>;

export default function ExpectationSelector({
  selectedIds,
  onChange,
  multiSelect = true,
  grade,
  subject,
  label = 'Curriculum Expectations',
  placeholder = 'Select curriculum expectations...',
  className,
  error,
  required = false,
  disabled = false,
}: ExpectationSelectorProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStrands, setExpandedStrands] = useState<Set<string>>(new Set());

  // Fetch expectations with filters
  const { data: expectations = [], isLoading } = useCurriculumExpectations({
    grade,
    subject,
  });

  // Filter expectations based on search
  const filteredExpectations = useMemo(() => {
    if (searchQuery.trim() === '') {
return expectations;
}

    const query = searchQuery.toLowerCase();
    return expectations.filter(
      (exp) =>
        exp.code.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        exp.strand.toLowerCase().includes(query) ||
        (exp.substrand !== null && exp.substrand !== undefined ? exp.substrand.toLowerCase().includes(query) : false),
    );
  }, [expectations, searchQuery]);

  // Group expectations by strand and substrand
  const groupedExpectations = useMemo(() => {
    const grouped: GroupedExpectations = {};

    filteredExpectations.forEach((exp) => {
      if (grouped[exp.strand] === undefined) {
        grouped[exp.strand] = {};
      }
      const substrand = exp.substrand !== null && exp.substrand !== undefined && exp.substrand !== '' ? exp.substrand : 'General';
      if (grouped[exp.strand][substrand] === undefined) {
        grouped[exp.strand][substrand] = [];
      }
      grouped[exp.strand][substrand].push(exp);
    });

    return grouped;
  }, [filteredExpectations]);

  // Get selected expectations details
  const selectedExpectations = useMemo(() => expectations.filter((exp) => selectedIds.includes(exp.id)), [expectations, selectedIds]);

  // Auto-expand strands with selected expectations
  useEffect(() => {
    return () => { // Cleanup
    };

    const strandsWithSelected = new Set<string>();
    selectedExpectations.forEach((exp) => {
      strandsWithSelected.add(exp.strand);
    });
    setExpandedStrands(strandsWithSelected);
  }, [selectedExpectations]);

  const toggleStrand = (strand: string): void => {
    const newExpanded = new Set(expandedStrands);
    if (newExpanded.has(strand)) {
      newExpanded.delete(strand);
    } else {
      newExpanded.add(strand);
    }
    setExpandedStrands(newExpanded);
  };

  const toggleExpectation = (expectationId: string): void => {
    if (multiSelect) {
      if (selectedIds.includes(expectationId)) {
        onChange(selectedIds.filter((id) => id !== expectationId));
      } else {
        onChange([...selectedIds, expectationId]);
      }
    } else {
      onChange([expectationId]);
      setOpen(false);
    }
  };

  const removeExpectation = (expectationId: string): void => {
    onChange(selectedIds.filter((id) => id !== expectationId));
  };

  const clearAll = (): void => {
    onChange([]);
  };

  return (
    <div className={className}>
      {label !== null && label !== undefined && label !== '' && (
        <Label className={cn("mb-2", required ? "after:content-['*'] after:ml-1 after:text-red-500" : "")}>
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error !== undefined && error !== null ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "",
              className
            )}
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <span className="truncate">
              {selectedIds.length > 0
                ? `${selectedIds.length} expectation${selectedIds.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[600px] p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by code, description, or strand..."
                value={searchQuery}
                onChange={(e) => {
 setSearchQuery(e.target.value); 
}}
              />
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading expectations...
                </div>
              ) : Object.keys(groupedExpectations).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No expectations found</div>
              ) : (
                Object.entries(groupedExpectations).map(([strand, substrands]) => (
                  <div key={strand} className="mb-4">
                    <button
                      className="flex items-center gap-2 w-full text-left font-medium text-sm mb-2 hover:text-primary"
                      type="button"
                      onClick={() => {
 toggleStrand(strand); 
}}
                    >
                      {expandedStrands.has(strand) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {strand}
                    </button>

                    {expandedStrands.has(strand) ? (
                      <div className="ml-6 space-y-3">
                        {Object.entries(substrands).map(([substrand, expectations]) => (
                          <div key={substrand}>
                            {substrand !== 'General' ? (
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {substrand}
                              </div>
                            ) : null}
                            <div className="space-y-1">
                              {expectations.map((exp, _index) => (
                                <div
                                  key={exp.id}
                                  className={cn(
                                    'flex items-start gap-2 p-2 rounded-md hover:bg-accent cursor-pointer',
                                    selectedIds.includes(exp.id) && 'bg-accent',
                                  )}
                                  onClick={() => {
 toggleExpectation(exp.id); 
}}
                                >
                                  <div className="mt-0.5">
                                    {multiSelect ? (
                                      <div
                                        className={cn(
                                          'h-4 w-4 rounded border',
                                          selectedIds.includes(exp.id)
                                            ? 'bg-primary border-primary'
                                            : 'border-input',
                                        )}
                                      >
                                        {selectedIds.includes(exp.id) ? (
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        ) : null}
                                      </div>
                                    ) : (
                                      <div
                                        className={cn(
                                          'h-4 w-4 rounded-full border',
                                          selectedIds.includes(exp.id)
                                            ? 'border-primary'
                                            : 'border-input',
                                        )}
                                      >
                                        {selectedIds.includes(exp.id) ? (
                                          <div className="h-2 w-2 rounded-full bg-primary m-0.5" />
                                        ) : null}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge className="text-xs" variant="outline">
                                        {exp.code}
                                      </Badge>
                                      {exp.type !== null && exp.type !== undefined ? (
                                        <Badge className="text-xs" variant="secondary">
                                          {exp.type}
                                        </Badge>
                                      ) : null}
                                    </div>
                                    <p className="text-sm mt-1">{exp.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {multiSelect && selectedIds.length > 0 ? (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
                <Button aria-label="Click button" onClick={clearAll}>
                  Clear all
                </Button>
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      {/* Display selected expectations */}
      {selectedExpectations.length > 0 ? (
        <div className="mt-3 space-y-2">
          {selectedExpectations.map((exp, _index) => (
            <div
              key={exp.id}
              className="flex items-start justify-between gap-2 p-2 bg-muted rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className="text-xs" variant="outline">
                    {exp.code}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{exp.strand}</span>
                </div>
                <p className="text-sm mt-1">{exp.description}</p>
              </div>
              {multiSelect ? (
                <Button
                  className="h-auto p-1"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
 removeExpectation(exp.id); 
}}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Error display */}
      {error !== undefined && error !== null && error !== '' ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
