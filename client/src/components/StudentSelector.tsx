import { useState, useMemo } from 'react';
import { Check, Search, X, Users, User } from 'lucide-react';
import { Student } from '../types/newsletter';
import { cn } from '../lib/utils';

interface NewsletterRecipientSelectorProps {
  recipients: Student[];
  selectedRecipientIds: number[];
  onChange: (recipientIds: number[]) => void;
  isLoading?: boolean;
  helpText?: string;
}

export default function NewsletterRecipientSelector({
  recipients: students,
  selectedRecipientIds: selectedStudentIds,
  onChange,
  isLoading = false,
  helpText,
}: NewsletterRecipientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Group students by grade
  const studentsByGrade = useMemo(() => {
    const grouped = students.reduce((acc, student) => {
      const grade = `Grade ${student.grade}`;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(student);
      return acc;
    }, {} as Record<string, Student[]>);

    // Sort grades and students within each grade
    const sortedGrades = Object.keys(grouped).sort((a, b) => {
      const gradeA = parseInt(a.replace('Grade ', ''));
      const gradeB = parseInt(b.replace('Grade ', ''));
      return gradeA - gradeB;
    });

    sortedGrades.forEach(grade => {
      grouped[grade].sort((a, b) => a.lastName.localeCompare(b.lastName));
    });

    return { grouped, sortedGrades };
  }, [students]);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const term = searchTerm.toLowerCase();
    return students.filter(student => 
      student.firstName.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(term) ||
      `Grade ${student.grade}`.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  const toggleStudent = (studentId: number) => {
    if (selectedStudentIds.includes(studentId)) {
      onChange(selectedStudentIds.filter(id => id !== studentId));
    } else {
      onChange([...selectedStudentIds, studentId]);
    }
  };

  const selectAllInGrade = (grade: string) => {
    const gradeStudents = studentsByGrade.grouped[grade];
    const gradeStudentIds = gradeStudents.map(s => s.id);
    const allSelected = gradeStudentIds.every(id => selectedStudentIds.includes(id));

    if (allSelected) {
      // Deselect all in grade
      onChange(selectedStudentIds.filter(id => !gradeStudentIds.includes(id)));
    } else {
      // Select all in grade
      const newSelection = [...selectedStudentIds];
      gradeStudentIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      onChange(newSelection);
    }
  };

  const selectAll = () => {
    if (selectedStudentIds.length === students.length) {
      onChange([]);
    } else {
      onChange(students.map(s => s.id));
    }
  };

  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Newsletter Recipients
      </label>
      {helpText && (
        <p className="text-sm text-gray-600 mb-3">
          {helpText}
        </p>
      )}
      {!helpText && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <p className="text-sm text-blue-800 font-medium">📧 Newsletter Planning Tool</p>
          <p className="text-sm text-blue-700 mt-1">
            This is for planning newsletter content only. Use your school&apos;s communication system for actual distribution.
          </p>
        </div>
      )}
      
      {/* Selected students display */}
      <div 
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedStudentIds.length === 0 ? (
          <span className="text-gray-500">Click to select newsletter recipients...</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedStudentIds.length === students.length ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                <Users className="w-3 h-3" />
                All students ({students.length})
              </span>
            ) : selectedStudents.length > 3 ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                <Users className="w-3 h-3" />
                {selectedStudents.length} students selected
              </span>
            ) : (
              selectedStudents.map(student => (
                <span
                  key={student.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                >
                  <User className="w-3 h-3" />
                  {student.firstName} {student.lastName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStudent(student.id);
                    }}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* Search bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search recipients by name or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Select all button */}
            <div className="px-3 py-2 border-b">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectAll();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Student list */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading recipient list...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No recipients found
                </div>
              ) : (
                studentsByGrade.sortedGrades.map(grade => {
                  const gradeStudents = studentsByGrade.grouped[grade].filter(s => 
                    filteredStudents.includes(s)
                  );
                  
                  if (gradeStudents.length === 0) return null;

                  const allInGradeSelected = gradeStudents.every(s => 
                    selectedStudentIds.includes(s.id)
                  );

                  return (
                    <div key={grade}>
                      <div className="px-3 py-2 bg-gray-50 flex items-center justify-between sticky top-0">
                        <span className="text-sm font-medium text-gray-700">{grade}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllInGrade(grade);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          {allInGradeSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      {gradeStudents.map(student => {
                        const isSelected = selectedStudentIds.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStudent(student.id);
                            }}
                            className={cn(
                              "px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between",
                              isSelected && "bg-blue-50"
                            )}
                          >
                            <span className="text-sm">
                              {student.lastName}, {student.firstName}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}