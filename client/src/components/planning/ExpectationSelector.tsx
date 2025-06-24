import React, { useState, useMemo, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { useCurriculumExpectations, CurriculumExpectation } from '../../hooks/useETFOPlanning';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import { ScrollArea } from '../ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';

interface ExpectationSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  multiSelect?: boolean;
  grade?: number;
  subject?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface GroupedExpectations {
  [strand: string]: {
    [substrand: string]: CurriculumExpectation[];
  };
}

export default function ExpectationSelector({
  selectedIds,
  onChange,
  multiSelect = true,
  grade,
  subject,
  label = 'Curriculum Expectations',
  placeholder = 'Select curriculum expectations...',
  className,
}: ExpectationSelectorProps) {
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
    if (!searchQuery.trim()) return expectations;

    const query = searchQuery.toLowerCase();
    return expectations.filter(
      (exp) =>
        exp.code.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        exp.strand.toLowerCase().includes(query) ||
        (exp.substrand && exp.substrand.toLowerCase().includes(query)),
    );
  }, [expectations, searchQuery]);

  // Group expectations by strand and substrand
  const groupedExpectations = useMemo(() => {
    const grouped: GroupedExpectations = {};

    filteredExpectations.forEach((exp) => {
      if (!grouped[exp.strand]) {
        grouped[exp.strand] = {};
      }
      const substrand = exp.substrand || 'General';
      if (!grouped[exp.strand][substrand]) {
        grouped[exp.strand][substrand] = [];
      }
      grouped[exp.strand][substrand].push(exp);
    });

    return grouped;
  }, [filteredExpectations]);

  // Get selected expectations details
  const selectedExpectations = useMemo(() => {
    return expectations.filter((exp) => selectedIds.includes(exp.id));
  }, [expectations, selectedIds]);

  // Auto-expand strands with selected expectations
  useEffect(() => {
    const strandsWithSelected = new Set<string>();
    selectedExpectations.forEach((exp) => {
      strandsWithSelected.add(exp.strand);
    });
    setExpandedStrands(strandsWithSelected);
  }, [selectedExpectations]);

  const toggleStrand = (strand: string) => {
    const newExpanded = new Set(expandedStrands);
    if (newExpanded.has(strand)) {
      newExpanded.delete(strand);
    } else {
      newExpanded.add(strand);
    }
    setExpandedStrands(newExpanded);
  };

  const toggleExpectation = (expectationId: string) => {
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

  const removeExpectation = (expectationId: string) => {
    onChange(selectedIds.filter((id) => id !== expectationId));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedIds.length > 0
                ? `${selectedIds.length} expectation${selectedIds.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by code, description, or strand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
                      type="button"
                      onClick={() => toggleStrand(strand)}
                      className="flex items-center gap-2 w-full text-left font-medium text-sm mb-2 hover:text-primary"
                    >
                      {expandedStrands.has(strand) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {strand}
                    </button>

                    {expandedStrands.has(strand) && (
                      <div className="ml-6 space-y-3">
                        {Object.entries(substrands).map(([substrand, expectations]) => (
                          <div key={substrand}>
                            {substrand !== 'General' && (
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {substrand}
                              </div>
                            )}
                            <div className="space-y-1">
                              {expectations.map((exp) => (
                                <div
                                  key={exp.id}
                                  className={cn(
                                    'flex items-start gap-2 p-2 rounded-md hover:bg-accent cursor-pointer',
                                    selectedIds.includes(exp.id) && 'bg-accent',
                                  )}
                                  onClick={() => toggleExpectation(exp.id)}
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
                                        {selectedIds.includes(exp.id) && (
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        )}
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
                                        {selectedIds.includes(exp.id) && (
                                          <div className="h-2 w-2 rounded-full bg-primary m-0.5" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {exp.code}
                                      </Badge>
                                      {exp.type && (
                                        <Badge variant="secondary" className="text-xs">
                                          {exp.type}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm mt-1">{exp.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {multiSelect && selectedIds.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Display selected expectations */}
      {selectedExpectations.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedExpectations.map((exp) => (
            <div
              key={exp.id}
              className="flex items-start justify-between gap-2 p-2 bg-muted rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {exp.code}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{exp.strand}</span>
                </div>
                <p className="text-sm mt-1">{exp.description}</p>
              </div>
              {multiSelect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExpectation(exp.id)}
                  className="h-auto p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
