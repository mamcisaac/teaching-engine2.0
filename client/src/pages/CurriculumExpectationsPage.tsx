import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurriculumExpectations, useUpdateCurriculumExpectation, useDeleteCurriculumExpectation } from '../hooks/useETFOPlanning';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Upload, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/Alert';

export default function CurriculumExpectationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'overall' | 'specific'>('all');
  const [editingExpectation, setEditingExpectation] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: expectations = [], isLoading, error } = useCurriculumExpectations({
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
    
    expectations.forEach(exp => {
      subjectSet.add(exp.subject);
      gradeSet.add(exp.grade);
    });

    return {
      subjects: Array.from(subjectSet).sort(),
      grades: Array.from(gradeSet).sort((a, b) => a - b),
    };
  }, [expectations]);

  // Group expectations by subject
  const groupedExpectations = useMemo(() => {
    const grouped: Record<string, typeof expectations> = {};
    
    expectations.forEach(exp => {
      if (!grouped[exp.subject]) {
        grouped[exp.subject] = [];
      }
      grouped[exp.subject].push(exp);
    });

    return grouped;
  }, [expectations]);

  const handleEdit = (expectation: any) => {
    setEditingExpectation({
      ...expectation,
      descriptionFr: expectation.descriptionFr || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingExpectation) return;

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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update expectation',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expectation? This will remove it from all linked plans.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Expectation deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete expectation',
        variant: 'destructive',
      });
    }
  };

  const handleImportCurriculum = () => {
    navigate('/curriculum-import');
  };

  const ExpectationRow = ({ expectation }: { expectation: any }) => (
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
          {expectation.descriptionFr && (
            <p className="text-sm text-muted-foreground italic">{expectation.descriptionFr}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{expectation.strand}</div>
          {expectation.substrand && (
            <div className="text-muted-foreground">{expectation.substrand}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {expectation.coverage ? (
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {expectation.coverage.percentage}%
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Not planned
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(expectation)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(expectation.id)}
          >
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Expectations</h1>
          <p className="text-muted-foreground">
            Browse and manage curriculum expectations that form the foundation of your planning
          </p>
        </div>
        <Button onClick={handleImportCurriculum} className="gap-2">
          <Upload className="h-4 w-4" />
          Import Curriculum
        </Button>
      </div>

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
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(selectedGrade)} onValueChange={(value) => setSelectedGrade(value === 'all' ? 'all' : Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={String(grade)}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
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

      <Tabs defaultValue={subjects[0] || 'all'} className="space-y-4">
        <TabsList className="grid w-full grid-cols-auto">
          {subjects.map(subject => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map(subject => (
          <TabsContent key={subject} value={subject} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{subject} Expectations</CardTitle>
                  <Badge variant="outline">
                    {groupedExpectations[subject]?.length || 0} expectations
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
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading expectations...
                        </TableCell>
                      </TableRow>
                    ) : groupedExpectations[subject]?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No expectations found. Import a curriculum to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupedExpectations[subject]?.map(expectation => (
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
                  <Label>Code</Label>
                  <Input value={editingExpectation.code} disabled />
                </div>
                <div>
                  <Label>Type</Label>
                  <Input value={editingExpectation.type} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={editingExpectation.description}
                  onChange={(e) => setEditingExpectation({
                    ...editingExpectation,
                    description: e.target.value,
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Description (French)</Label>
                <Textarea
                  value={editingExpectation.descriptionFr || ''}
                  onChange={(e) => setEditingExpectation({
                    ...editingExpectation,
                    descriptionFr: e.target.value,
                  })}
                  rows={3}
                  placeholder="Optional French translation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Strand</Label>
                  <Input
                    value={editingExpectation.strand}
                    onChange={(e) => setEditingExpectation({
                      ...editingExpectation,
                      strand: e.target.value,
                    })}
                  />
                </div>
                <div>
                  <Label>Substrand (Optional)</Label>
                  <Input
                    value={editingExpectation.substrand || ''}
                    onChange={(e) => setEditingExpectation({
                      ...editingExpectation,
                      substrand: e.target.value,
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}