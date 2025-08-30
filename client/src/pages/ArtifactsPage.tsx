import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  MusicalNoteIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TagIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Artifact {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  studentId?: string;
  studentName?: string;
  assessmentId?: string;
  subject?: string;
  tags: string[];
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const FILE_TYPES = [
  { type: 'image', icon: PhotoIcon, extensions: ['.jpg', '.jpeg', '.png', '.gif'], color: 'blue' },
  { type: 'video', icon: VideoCameraIcon, extensions: ['.mp4', '.mov', '.avi'], color: 'purple' },
  { type: 'document', icon: DocumentIcon, extensions: ['.pdf', '.doc', '.docx'], color: 'green' },
  { type: 'audio', icon: MusicalNoteIcon, extensions: ['.mp3', '.wav', '.m4a'], color: 'pink' }
];

export function ArtifactsPage(): React.ReactElement {
  const [artifacts, setArtifacts] = useState<Artifact[]>(() => {
    const saved = localStorage.getItem('assessment-artifacts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [students] = useState<Student[]>(() => {
    const saved = localStorage.getItem('assessment-students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStudent, setFilterStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewArtifact, setPreviewArtifact] = useState<Artifact | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    studentId: '',
    subject: '',
    tags: [] as string[],
    description: ''
  });

  const filteredArtifacts = artifacts.filter(artifact => {
    let matches = true;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      matches = matches && (
        artifact.originalName.toLowerCase().includes(search) ||
        artifact.description?.toLowerCase().includes(search) ||
        artifact.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (filterType) {
      const fileType = FILE_TYPES.find(ft => 
        ft.extensions.some(ext => artifact.originalName.endsWith(ext))
      );
      matches = matches && fileType?.type === filterType;
    }
    
    if (filterStudent) {
      matches = matches && artifact.studentId === filterStudent;
    }
    
    return matches;
  });

  const saveArtifacts = (newArtifacts: Artifact[]) => {
    setArtifacts(newArtifacts);
    localStorage.setItem('assessment-artifacts', JSON.stringify(newArtifacts));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newArtifacts: Artifact[] = [];
    
    Array.from(files).forEach((file) => {
      // Check for duplicates
      const isDuplicate = artifacts.some(a => 
        a.originalName === file.name && a.size === file.size
      );
      
      if (isDuplicate) {
        toast.warning(`${file.name} already exists`);
        return;
      }
      
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      // Determine file type
      const fileType = FILE_TYPES.find(ft =>
        ft.extensions.some(ext => file.name.toLowerCase().endsWith(ext))
      );
      
      if (!fileType) {
        toast.error(`Unsupported file type: ${file.name}`);
        return;
      }
      
      const student = uploadForm.studentId ? 
        students.find(s => s.id === uploadForm.studentId) : null;
      
      const artifact: Artifact = {
        id: `artifact-${Date.now()}-${Math.random()}`,
        filename: `${Date.now()}-${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: url,
        thumbnailUrl: fileType.type === 'image' ? url : undefined,
        studentId: uploadForm.studentId || undefined,
        studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
        subject: uploadForm.subject || undefined,
        tags: uploadForm.tags,
        description: uploadForm.description,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Emily McIsaac',
        processingStatus: 'processing'
      };
      
      newArtifacts.push(artifact);
      
      // Simulate processing
      setTimeout(() => {
        const updatedArtifacts = artifacts.map(a =>
          a.id === artifact.id ? { ...a, processingStatus: 'completed' as const } : a
        );
        saveArtifacts(updatedArtifacts);
      }, 2000);
    });
    
    if (newArtifacts.length > 0) {
      saveArtifacts([...artifacts, ...newArtifacts]);
      toast.success(`Uploaded ${newArtifacts.length} file(s)`);
      setShowUploadModal(false);
      resetUploadForm();
    }
  };

  const handleDelete = (artifactId: string) => {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (artifact && confirm(`Delete ${artifact.originalName}?`)) {
      saveArtifacts(artifacts.filter(a => a.id !== artifactId));
      toast.success('Artifact deleted');
    }
  };

  const handleBulkDelete = () => {
    if (selectedArtifacts.length === 0) return;
    
    if (confirm(`Delete ${selectedArtifacts.length} selected artifacts?`)) {
      saveArtifacts(artifacts.filter(a => !selectedArtifacts.includes(a.id)));
      setSelectedArtifacts([]);
      toast.success(`Deleted ${selectedArtifacts.length} artifacts`);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      studentId: '',
      subject: '',
      tags: [],
      description: ''
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (artifact: Artifact) => {
    const fileType = FILE_TYPES.find(ft =>
      ft.extensions.some(ext => artifact.originalName.toLowerCase().endsWith(ext))
    );
    return fileType?.icon || DocumentIcon;
  };

  const getFileColor = (artifact: Artifact) => {
    const fileType = FILE_TYPES.find(ft =>
      ft.extensions.some(ext => artifact.originalName.toLowerCase().endsWith(ext))
    );
    return fileType?.color || 'gray';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Artifacts</h1>
        <p className="text-gray-600">Student work samples and evidence</p>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {FILE_TYPES.map(fileType => {
          const count = artifacts.filter(a =>
            fileType.extensions.some(ext => a.originalName.toLowerCase().endsWith(ext))
          ).length;
          const Icon = fileType.icon;
          
          return (
            <div key={fileType.type} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 capitalize">{fileType.type}s</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Icon className={`w-8 h-8 text-${fileType.color}-600`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            data-testid="upload-artifacts-btn"
          >
            <CloudArrowUpIcon className="w-5 h-5" />
            Upload Files
          </button>
          
          {selectedArtifacts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Delete ({selectedArtifacts.length})
            </button>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search artifacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            {FILE_TYPES.map(ft => (
              <option key={ft.type} value={ft.type}>{ft.type}</option>
            ))}
          </select>
          
          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Artifacts Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredArtifacts.map(artifact => {
            const Icon = getFileIcon(artifact);
            const color = getFileColor(artifact);
            const isSelected = selectedArtifacts.includes(artifact.id);
            
            return (
              <div
                key={artifact.id}
                className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  if (selectedArtifacts.includes(artifact.id)) {
                    setSelectedArtifacts(selectedArtifacts.filter(id => id !== artifact.id));
                  } else {
                    setSelectedArtifacts([...selectedArtifacts, artifact.id]);
                  }
                }}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {artifact.thumbnailUrl ? (
                    <img
                      src={artifact.thumbnailUrl}
                      alt={artifact.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className={`w-16 h-16 text-${color}-600`} />
                  )}
                  
                  {artifact.processingStatus === 'processing' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-sm">Processing...</div>
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{artifact.originalName}</p>
                  {artifact.studentName && (
                    <p className="text-xs text-gray-600 truncate">{artifact.studentName}</p>
                  )}
                  <p className="text-xs text-gray-500">{formatFileSize(artifact.size)}</p>
                  
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewArtifact(artifact);
                        setShowPreviewModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      data-testid={`preview-${artifact.id}`}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(artifact.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      data-testid={`delete-${artifact.id}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedArtifacts.length === filteredArtifacts.length && filteredArtifacts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedArtifacts(filteredArtifacts.map(a => a.id));
                      } else {
                        setSelectedArtifacts([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">File</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArtifacts.map(artifact => {
                const Icon = getFileIcon(artifact);
                const isSelected = selectedArtifacts.includes(artifact.id);
                
                return (
                  <tr key={artifact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedArtifacts([...selectedArtifacts, artifact.id]);
                          } else {
                            setSelectedArtifacts(selectedArtifacts.filter(id => id !== artifact.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm">{artifact.originalName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {artifact.studentName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {artifact.subject || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatFileSize(artifact.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(artifact.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPreviewArtifact(artifact);
                            setShowPreviewModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(artifact.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Upload Artifacts</h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supports: Images, Videos, PDFs, Audio files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                data-testid="file-input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student (Optional)</label>
                <select
                  value={uploadForm.studentId}
                  onChange={(e) => setUploadForm({ ...uploadForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject (Optional)</label>
                <select
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select subject</option>
                  <option value="Français (Immersion)">Français (Immersion)</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tags (Optional)</label>
              <input
                type="text"
                placeholder="Enter tags separated by commas"
                value={uploadForm.tags.join(', ')}
                onChange={(e) => setUploadForm({
                  ...uploadForm,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewArtifact && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{previewArtifact.originalName}</h2>
                {previewArtifact.studentName && (
                  <p className="text-gray-600">{previewArtifact.studentName}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewArtifact(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              {previewArtifact.thumbnailUrl ? (
                <img
                  src={previewArtifact.url}
                  alt={previewArtifact.originalName}
                  className="w-full max-h-96 object-contain"
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <p className="text-gray-600">Preview not available</p>
                  <a
                    href={previewArtifact.url}
                    download={previewArtifact.originalName}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download File
                  </a>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Size:</span> {formatFileSize(previewArtifact.size)}
              </div>
              <div>
                <span className="font-medium">Type:</span> {previewArtifact.mimeType}
              </div>
              <div>
                <span className="font-medium">Uploaded:</span> {new Date(previewArtifact.uploadedAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">By:</span> {previewArtifact.uploadedBy}
              </div>
            </div>
            
            {previewArtifact.description && (
              <div className="mt-4">
                <span className="font-medium">Description:</span>
                <p className="text-gray-600">{previewArtifact.description}</p>
              </div>
            )}
            
            {previewArtifact.tags.length > 0 && (
              <div className="mt-4">
                <span className="font-medium">Tags:</span>
                <div className="flex gap-2 mt-1">
                  {previewArtifact.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}