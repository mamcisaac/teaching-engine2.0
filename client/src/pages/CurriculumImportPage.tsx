import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Edit2, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../api';

interface ParsedExpectation {
  code: string;
  type: 'overall' | 'specific';
  description: string;
  strand: string;
  substrand?: string;
  subject: string;
  grade: number;
  selected?: boolean; // Track if user wants to import this expectation
}

interface ParsedSubject {
  name: string;
  expectations: ParsedExpectation[];
}

interface ImportSession {
  id: string;
  status: 'uploaded' | 'parsing' | 'parsed' | 'error';
  originalFilename: string;
  parsedSubjects: ParsedSubject[];
  errors: string[];
}

export default function CurriculumImportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [importSession, setImportSession] = useState<ImportSession | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [editingExpectation, setEditingExpectation] = useState<ParsedExpectation | null>(null);
  const [parseProgress, setParseProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload file
      const uploadResponse = await api.post('/api/curriculum/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const sessionId = uploadResponse.data.sessionId;
      
      // Start parsing
      setImportSession({
        id: sessionId,
        status: 'parsing',
        originalFilename: file.name,
        parsedSubjects: [],
        errors: [],
      });

      // Simulate progress for parsing
      const progressInterval = setInterval(() => {
        setParseProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      const parseResponse = await api.post('/api/curriculum/import/parse', {
        sessionId,
        useAiExtraction: true,
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setParseProgress(100);

      setImportSession({
        id: sessionId,
        status: 'parsed',
        originalFilename: file.name,
        parsedSubjects: parseResponse.data.subjects || [],
        errors: parseResponse.data.errors || [],
      });

      toast({
        title: 'Success',
        description: `Parsed ${parseResponse.data.subjects?.length || 0} subjects from ${file.name}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      setImportSession(prev => prev ? {
        ...prev,
        status: 'error',
        errors: ['Failed to parse curriculum document. Please try again or use a different format.'],
      } : null);
      
      toast({
        title: 'Error',
        description: 'Failed to import curriculum. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const handlePresetSelection = async (presetId: string) => {
    if (!presetId) return;

    setIsUploading(true);
    try {
      const response = await api.post('/api/curriculum/import/import-preset', {
        presetId,
      });

      setImportSession({
        id: response.data.sessionId,
        status: 'parsed',
        originalFilename: `${presetId} (Preset)`,
        parsedSubjects: response.data.subjects || [],
        errors: [],
      });

      toast({
        title: 'Success',
        description: `Loaded ${response.data.subjects?.length || 0} subjects from preset`,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load preset curriculum',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditExpectation = (expectation: ParsedExpectation) => {
    setEditingExpectation({ ...expectation });
  };

  const handleSaveExpectation = () => {
    if (!editingExpectation || !importSession) return;

    const updatedSubjects = importSession.parsedSubjects.map(subject => {
      if (subject.name === editingExpectation.subject) {
        return {
          ...subject,
          expectations: subject.expectations.map(exp => 
            exp.code === editingExpectation.code ? editingExpectation : exp
          ),
        };
      }
      return subject;
    });

    setImportSession({
      ...importSession,
      parsedSubjects: updatedSubjects,
    });

    setEditingExpectation(null);
    toast({
      title: 'Success',
      description: 'Expectation updated successfully',
    });
  };

  const handleDeleteExpectation = (expectation: ParsedExpectation) => {
    if (!importSession) return;

    const updatedSubjects = importSession.parsedSubjects.map(subject => {
      if (subject.name === expectation.subject) {
        return {
          ...subject,
          expectations: subject.expectations.filter(exp => exp.code !== expectation.code),
        };
      }
      return subject;
    });

    setImportSession({
      ...importSession,
      parsedSubjects: updatedSubjects,
    });

    toast({
      title: 'Success',
      description: 'Expectation deleted successfully',
    });
  };

  const handleFinalImport = async () => {
    if (!importSession) return;

    try {
      await api.post(`/api/curriculum/import/${importSession.id}`);
      
      toast({
        title: 'Success',
        description: 'Curriculum imported successfully! Redirecting...',
      });

      setTimeout(() => {
        navigate('/curriculum');
      }, 1500);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import curriculum',
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const totalExpectations = importSession?.parsedSubjects.reduce(
    (sum, subject) => sum + subject.expectations.length, 0
  ) || 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Curriculum</h1>
          <p className="text-muted-foreground">
            Upload a curriculum document or select a known curriculum to get started
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/curriculum')}>
          Back to Curriculum
        </Button>
      </div>

      {!importSession && (
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="preset">Use Preset</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Curriculum Document</CardTitle>
                <CardDescription>
                  Upload a PDF, DOCX, or TXT file containing curriculum expectations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  {isDragActive ? (
                    <p className="text-lg">Drop the curriculum document here</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg">Drag and drop a curriculum document here</p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, DOCX, and TXT files
                      </p>
                      <Button variant="outline" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Browse Files'}
                      </Button>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing document...</span>
                      <span>{Math.round(parseProgress)}%</span>
                    </div>
                    <Progress value={parseProgress} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preset">
            <Card>
              <CardHeader>
                <CardTitle>Select Known Curriculum</CardTitle>
                <CardDescription>
                  Choose from pre-configured curriculum documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Curricula</Label>
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pei-grade1-french">
                        PEI Grade 1 French Immersion (English School Board)
                      </SelectItem>
                      <SelectItem value="ontario-grade1-english">
                        Ontario Grade 1 English
                      </SelectItem>
                      <SelectItem value="bc-grade1-core">
                        BC Grade 1 Core Curriculum
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => handlePresetSelection(selectedPreset)}
                  disabled={!selectedPreset || isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Loading...' : 'Load Curriculum'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {importSession && importSession.status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {importSession.errors.join('. ')}
          </AlertDescription>
        </Alert>
      )}

      {importSession && importSession.status === 'parsed' && (
        <div className="space-y-6">
          {/* Import Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Import Preview
              </CardTitle>
              <CardDescription>
                Review and edit the parsed curriculum before importing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{importSession.parsedSubjects.length}</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalExpectations}</div>
                  <div className="text-sm text-muted-foreground">Expectations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{importSession.originalFilename}</div>
                  <div className="text-sm text-muted-foreground">Source File</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Review */}
          <Tabs defaultValue={importSession.parsedSubjects[0]?.name || 'overview'}>
            <TabsList className="grid w-full grid-cols-auto">
              {importSession.parsedSubjects.map(subject => (
                <TabsTrigger key={subject.name} value={subject.name}>
                  {subject.name}
                  <Badge variant="secondary" className="ml-2">
                    {subject.expectations.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {importSession.parsedSubjects.map(subject => (
              <TabsContent key={subject.name} value={subject.name} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{subject.name} Expectations</CardTitle>
                    <CardDescription>
                      Review and edit expectations for this subject
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {subject.expectations.map((expectation, index) => (
                        <div key={`${expectation.code}-${index}`} className="flex items-start justify-between p-3 border rounded-md">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={expectation.type === 'overall' ? 'default' : 'secondary'}>
                                {expectation.type}
                              </Badge>
                              <span className="font-mono text-sm">{expectation.code}</span>
                              <span className="text-sm text-muted-foreground">
                                {expectation.strand}
                                {expectation.substrand && ` / ${expectation.substrand}`}
                              </span>
                            </div>
                            <p className="text-sm">{expectation.description}</p>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpectation(expectation)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpectation(expectation)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Final Import */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Ready to Import</h3>
                  <p className="text-sm text-muted-foreground">
                    This will create {totalExpectations} curriculum expectations across {importSession.parsedSubjects.length} subjects
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setImportSession(null)}>
                    Start Over
                  </Button>
                  <Button onClick={handleFinalImport} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Import Curriculum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Expectation Dialog */}
      {editingExpectation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Expectation</CardTitle>
              <CardDescription>
                Modify the expectation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={editingExpectation.code}
                    onChange={(e) => setEditingExpectation({
                      ...editingExpectation,
                      code: e.target.value,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingExpectation.type}
                    onValueChange={(value: 'overall' | 'specific') => setEditingExpectation({
                      ...editingExpectation,
                      type: value,
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall</SelectItem>
                      <SelectItem value="specific">Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingExpectation.description}
                  onChange={(e) => setEditingExpectation({
                    ...editingExpectation,
                    description: e.target.value,
                  })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Strand</Label>
                  <Input
                    value={editingExpectation.strand}
                    onChange={(e) => setEditingExpectation({
                      ...editingExpectation,
                      strand: e.target.value,
                    })}
                  />
                </div>
                <div className="space-y-2">
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingExpectation(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveExpectation}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}