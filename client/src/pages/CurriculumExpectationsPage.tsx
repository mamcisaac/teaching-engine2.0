
import { Search, Upload, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';

import { STORAGE_KEYS } from '../constants/subjects';
import type {
  CurriculumExpectation} from '../hooks/useETFOPlanning';
import {
  useCurriculumExpectations,
  useUpdateCurriculumExpectation,
  useDeleteCurriculumExpectation
} from '../hooks/useETFOPlanning';
import { logger } from '../utils/logger';
import { safeJsonParse } from '../utils/typeGuards';

export function CurriculumExpectationsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'overall' | 'specific'>('all');
  const [editingExpectation, setEditingExpectation] = useState<CurriculumExpectation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingExpectationId, setDeletingExpectationId] = useState<string | null>(null);
  
  // Get teacher's selected subjects from localStorage
  const teacherSubjects = useMemo(() => {
    const storedSubjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
    return storedSubjects ? safeJsonParse<string[]>(storedSubjects, []) : null;
  }, []);

  const {
    data: expectations = [],
    isLoading,
    error,
  } = useCurriculumExpectations({
    subject: selectedSubject === 'all' ? undefined : selectedSubject,
    grade: selectedGrade === 'all' ? undefined : selectedGrade,
    search: searchTerm || undefined,
  });

  const updateMutation = useUpdateCurriculumExpectation();
  const deleteMutation = useDeleteCurriculumExpectation();

  // Extract unique subjects and grades from expectations
  const { subjects, grades } = useMemo(() => {
    const subjectSet = new Set<string>();
    const gradeSet = new Set<number>();

    expectations.forEach((exp) => {
      // Only include subjects that the teacher selected (or all if no selection)
      if (!teacherSubjects || teacherSubjects.includes(exp.subject)) {
        subjectSet.add(exp.subject);
      }
      gradeSet.add(exp.grade);
    });

    return {
      subjects: Array.from(subjectSet).sort(),
      grades: Array.from(gradeSet).sort((a, b) => a - b),
    };
  }, [expectations, teacherSubjects]);

  // Group expectations by subject
  const groupedExpectations = useMemo(() => {
    const grouped: Record<string, typeof expectations> = {};

    expectations.forEach((exp) => {
      // Only include subjects that the teacher selected (or all if no selection)
      if (!teacherSubjects || teacherSubjects.includes(exp.subject)) {
        if (!(exp.subject in grouped)) {
          grouped[exp.subject] = [];
        }
        grouped[exp.subject].push(exp);
      }
    });

    return grouped;
  }, [expectations, teacherSubjects]);

  const handleEdit = (expectation: CurriculumExpectation): void => {
    setEditingExpectation({
      ...expectation,
      descriptionFr: expectation.descriptionFr !== null ? expectation.descriptionFr : '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingExpectation) {
return;
}

    try {
      await updateMutation.mutateAsync({
        id: editingExpectation.id,
        data: {
          description: editingExpectation.description,
          descriptionFr: editingExpectation.descriptionFr,
          strand: editingExpectation.strand,
          substrand: editingExpectation.substrand,
        },
      });

      toast({
        title: 'Success',
        description: 'Curriculum expectation updated successfully',
      });

      setIsEditDialogOpen(false);
      setEditingExpectation(null);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update expectation',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string): void => {
    setDeletingExpectationId(id);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingExpectationId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingExpectationId);
      toast({
        title: 'Success',
        description: 'Expectation deleted successfully',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to delete expectation',
        variant: 'destructive',
      });
    } finally {
      setDeletingExpectationId(null);
    }
  };

  const handleImportCurriculum = (): void => {
    navigate('/curriculum-import');
  };

  const ExpectationRow = ({ expectation }: { expectation: CurriculumExpectation }): JSX.Element => (
    <TableRow>
      <TableCell className="font-mono text-sm">{expectation.code}</TableCell>
      <TableCell>
        <Badge variant={expectation.type === 'overall' ? 'default' : 'secondary'}>
          {expectation.type}
        </Badge>
      </TableCell>
      <TableCell className="max-w-md">
        <div className="space-y-1">
          <p className="text-sm">{expectation.description}</p>
          {expectation.descriptionFr !== null && (
            <p className="text-sm text-muted-foreground italic">{expectation.descriptionFr}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{expectation.strand}</div>
          {expectation.substrand !== null && (
            <div className="text-muted-foreground">{expectation.substrand}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {expectation.coverage ? (
            <Badge className="gap-1" variant="outline">
              <CheckCircle className="h-3 w-3" />
              {expectation.coverage.percentage}%
            </Badge>
          ) : (
            <Badge className="gap-1 text-muted-foreground" variant="outline">
              <AlertCircle className="h-3 w-3" />
              Not planned
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button aria-label="Click button" onClick={() => {
 handleEdit(expectation); 
}}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button aria-label="Click button" onClick={() => {
 handleDelete(expectation.id); 
}}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load curriculum expectations. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="curriculum-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Expectations</h1>
          <p className="text-muted-foreground">
            Browse and manage curriculum expectations that form the foundation of your planning
          </p>
        </div>
        <Button aria-label="Click button" onClick={handleImportCurriculum}>
          <Upload className="h-4 w-4" />
          Import Curriculum
        </Button>
      </div>

      {teacherSubjects === null || teacherSubjects.length === 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No subjects selected!</strong> Please use the Getting Started Guide on the dashboard to select which subjects you teach.
            Without subject selection, you won&apos;t be able to plan your curriculum effectively.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Showing curriculum expectations for your selected subjects: {teacherSubjects.join(', ')}. 
            To change your subject selection, use the Getting Started Guide on the dashboard.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter Expectations</CardTitle>
          <CardDescription>
            Search and filter curriculum expectations by subject, grade, and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => {
 setSearchTerm(e.target.value); 
}}
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((subject, _index) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedGrade)}
              onValueChange={(value) => {
 setSelectedGrade(value === 'all' ? 'all' : Number(value)); 
}}
            >
              <SelectTrigger>
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                {grades.map((grade, _index) => (
                  <SelectItem key={grade} value={String(grade)}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedType}
              onValueChange={(value) => {
 setSelectedType(value as 'all' | 'overall' | 'specific'); 
}}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
                <SelectItem value="specific">Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs className="space-y-4" defaultValue={subjects[0] ?? 'all'}>
        <TabsList className="grid w-full grid-cols-auto">
          {subjects.map((subject, _index) => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject, _index) => (
          <TabsContent key={subject} className="space-y-4" value={subject}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{subject} Expectations</CardTitle>
                  <Badge variant="outline">
                    {groupedExpectations[subject].length} expectations
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Code</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32">Strand</TableHead>
                      <TableHead className="w-24">Coverage</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell className="text-center py-8" colSpan={6}>
                          Loading expectations...
                        </TableCell>
                      </TableRow>
                    ) : groupedExpectations[subject].length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-8" colSpan={6}>
                          No expectations found. Import a curriculum to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupedExpectations[subject].map((expectation, _index) => (
                        <ExpectationRow key={expectation.id} expectation={expectation} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Curriculum Expectation</DialogTitle>
            <DialogDescription>
              Update the expectation details. Changes will be reflected across all linked plans.
            </DialogDescription>
          </DialogHeader>
          {editingExpectation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="input">Code</Label>
                  <Input id="input" />
                </div>
                <div>
                  <Label htmlFor="input">Type</Label>
                  <Input id="input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="input">Description (English)</Label>
                <Textarea
                  rows={3}
                  value={editingExpectation.description}
                  onChange={(e) => {
 setEditingExpectation({
                      ...editingExpectation,
                      description: e.target.value,
                    }); 
}
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="input">Description (French)</Label>
                <Textarea
                  placeholder="Optional French translation"
                  rows={3}
                  value={editingExpectation.descriptionFr !== null ? editingExpectation.descriptionFr : ''}
                  onChange={(e) => {
 setEditingExpectation({
                      ...editingExpectation,
                      descriptionFr: e.target.value,
                    }); 
}
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="input">Strand</Label>
                  <Input
                    value={editingExpectation.strand}
                    onChange={(e) => {
 setEditingExpectation({
                        ...editingExpectation,
                        strand: e.target.value,
                      }); 
}
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="input">Substrand (Optional)</Label>
                  <Input
                    value={editingExpectation.substrand !== null ? editingExpectation.substrand : ''}
                    onChange={(e) => {
 setEditingExpectation({
                        ...editingExpectation,
                        substrand: e.target.value,
                      }); 
}
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button aria-label="Click button" onClick={() => {
 setIsEditDialogOpen(false); 
}}>
              Cancel
            </Button>
            <Button aria-label="Click button" onClick={() => { 
              void handleSaveEdit().catch((error: unknown) => {
                logger.error('Error saving edit:', error);
              }); 
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingExpectationId} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setDeletingExpectationId(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Curriculum Expectation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expectation? This will remove it from all linked plans and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeletingExpectationId(null)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              disabled={deleteMutation.isPending}
              onClick={() => {
                void handleConfirmDelete().catch((error: unknown) => {
                  logger.error('Error deleting expectation:', error);
                });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
