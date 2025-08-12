import React, { useState, useEffect } from 'react';
import { X, Check, BookOpen, Grid3x3, Sparkles, MapPin, Users, Star, Target, Award } from 'lucide-react';
import { Button } from './ui/Button';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjects: string[]) => void;
}

const ALL_SUBJECTS = [
  { 
    name: 'Français (Immersion)', 
    icon: BookOpen, 
    color: 'bg-blue-500',
    description: 'French Language Arts for French Immersion',
    core: true
  },
  { 
    name: 'Mathématiques', 
    icon: Grid3x3, 
    color: 'bg-green-500',
    description: 'Mathematics in French',
    core: true
  },
  { 
    name: 'Sciences de la nature', 
    icon: Sparkles, 
    color: 'bg-purple-500',
    description: 'Natural Sciences',
    core: true
  },
  { 
    name: 'Sciences humaines', 
    icon: MapPin, 
    color: 'bg-yellow-500',
    description: 'Social Studies',
    core: false
  },
  { 
    name: 'Éducation physique', 
    icon: Users, 
    color: 'bg-red-500',
    description: 'Physical Education',
    core: false
  },
  { 
    name: 'Arts visuels', 
    icon: Star, 
    color: 'bg-pink-500',
    description: 'Visual Arts',
    core: false
  },
  { 
    name: 'Formation personnelle et sociale', 
    icon: Target, 
    color: 'bg-indigo-500',
    description: 'Personal and Social Development',
    core: false
  },
  { 
    name: 'Musique', 
    icon: Award, 
    color: 'bg-orange-500',
    description: 'Music Education',
    core: false
  }
];

export function SubjectSelectionModal({ isOpen, onClose, onSave }: SubjectSelectionModalProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    // Load saved subjects from localStorage
    const saved = localStorage.getItem('teacher-subjects');
    if (saved) {
      try {
        const subjects = JSON.parse(saved);
        setSelectedSubjects(Array.isArray(subjects) ? subjects : []);
      } catch {
        // Default subjects for Grade 1 French Immersion
        setSelectedSubjects([
          'Français (Immersion)',
          'Mathématiques',
          'Sciences de la nature',
          'Arts visuels',
          'Éducation physique',
          'Musique'
        ]);
      }
    } else {
      // Default subjects
      setSelectedSubjects([
        'Français (Immersion)',
        'Mathématiques',
        'Sciences de la nature',
        'Arts visuels',
        'Éducation physique',
        'Musique',
        'Sciences humaines',
        'Formation personnelle et sociale'
      ]);
    }
  }, [isOpen]);

  const toggleSubject = (subjectName: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('teacher-subjects', JSON.stringify(selectedSubjects));
    onSave(selectedSubjects);
    onClose();
  };

  const selectAll = () => {
    setSelectedSubjects(ALL_SUBJECTS.map(s => s.name));
  };

  const deselectAll = () => {
    setSelectedSubjects([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Your Teaching Subjects</h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose the subjects you teach for Grade 1 French Immersion
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Quick Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                onClick={selectAll}
                variant="outline"
                size="sm"
              >
                Select All
              </Button>
              <Button
                onClick={deselectAll}
                variant="outline"
                size="sm"
              >
                Deselect All
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {selectedSubjects.length} of {ALL_SUBJECTS.length} subjects selected
            </div>
          </div>

          {/* Core Subjects */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Core Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_SUBJECTS.filter(s => s.core).map((subject) => {
                const Icon = subject.icon;
                const isSelected = selectedSubjects.includes(subject.name);
                
                return (
                  <button
                    key={subject.name}
                    onClick={() => toggleSubject(subject.name)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${subject.color} text-white mr-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {subject.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specialist Subjects */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Specialist & Optional Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_SUBJECTS.filter(s => !s.core).map((subject) => {
                const Icon = subject.icon;
                const isSelected = selectedSubjects.includes(subject.name);
                
                return (
                  <button
                    key={subject.name}
                    onClick={() => toggleSubject(subject.name)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${subject.color} text-white mr-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {subject.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedSubjects.length === 0 && (
                <span className="text-red-600">Please select at least one subject</span>
              )}
              {selectedSubjects.length > 0 && selectedSubjects.length < 3 && (
                <span className="text-amber-600">Consider adding core subjects for complete coverage</span>
              )}
              {selectedSubjects.length >= 3 && (
                <span className="text-green-600">Great selection for Grade 1 French Immersion!</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={selectedSubjects.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Subjects ({selectedSubjects.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}