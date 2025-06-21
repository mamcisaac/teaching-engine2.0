import { useState } from 'react';
import { useActivityTemplates, useCreateActivityTemplate, ActivityTemplateInput } from '../api';
import { ActivityTemplate } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Modal } from './ui/Modal';

interface ActivityLibraryProps {
  showCreateButton?: boolean;
  onCreateNew?: () => void;
  defaultView?: 'grid' | 'list';
  language?: 'en' | 'fr';
}

export function ActivityLibrary({
  showCreateButton = true,
  onCreateNew,
  defaultView = 'grid',
  language = 'en',
}: ActivityLibraryProps = {}) {
  const [filters, setFilters] = useState({
    domain: '',
    subject: '',
    groupType: '',
    search: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);

  const { data: templates = [], isLoading, error, refetch } = useActivityTemplates(filters);
  const createTemplate = useCreateActivityTemplate();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleUseTemplate = (template: ActivityTemplate) => {
    // TODO: Implement adding template to milestone/planner
    console.log('Using template:', template);
  };

  const getGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'Individual':
        return '👤';
      case 'Small group':
        return '👥';
      case 'Whole class':
        return '🎓';
      default:
        return '📚';
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'oral':
        return 'bg-blue-100 text-blue-800';
      case 'reading':
        return 'bg-green-100 text-green-800';
      case 'writing':
        return 'bg-purple-100 text-purple-800';
      case 'math':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to load activity library. Please try again.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Library</h1>
          <p className="text-gray-600">Browse and manage your activity templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? '📋' : '⊞'} {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
          {showCreateButton && (
            <Button onClick={() => (onCreateNew ? onCreateNew() : setShowCreateModal(true))}>
              ➕ New Activity
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search activities..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="domain">Domain</Label>
            <select
              id="domain"
              value={filters.domain}
              onChange={(e) => handleFilterChange('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Domains</option>
              <option value="oral">Oral</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="math">Math</option>
            </select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="francais">Français</option>
              <option value="english">English</option>
              <option value="math">Math</option>
              <option value="science">Science</option>
            </select>
          </div>
          <div>
            <Label htmlFor="groupType">Group Type</Label>
            <select
              id="groupType"
              value={filters.groupType}
              onChange={(e) => handleFilterChange('groupType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Small group">Small group</option>
              <option value="Whole class">Whole class</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Count */}
      {templates.length > 0 && (
        <div className="text-sm text-gray-600">{templates.length} activities found</div>
      )}

      {/* Templates Grid/List */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <p className="text-gray-500 mb-4">No activities found</p>
          <p className="text-gray-400 mb-4">
            Get started by creating your first activity template.
          </p>
          <Button onClick={() => (onCreateNew ? onCreateNew() : setShowCreateModal(true))}>
            Create New Activity
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? template.titleEn : template.titleFr}
                  </h3>
                  {language === 'en' && template.titleFr && (
                    <p className="text-sm text-gray-600">{template.titleFr}</p>
                  )}
                  {language === 'fr' && template.titleEn && (
                    <p className="text-sm text-gray-600">{template.titleEn}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(template.domain)}`}
                >
                  {template.domain}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {language === 'en' ? template.descriptionEn : template.descriptionFr}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {getGroupIcon(template.groupType)} {template.groupType}
                </span>
                {template.prepTimeMin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏱️ {template.prepTimeMin}m
                  </span>
                )}
                {template.subject && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {template.subject}
                  </span>
                )}
              </div>

              {template.outcomeIds.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Linked Outcomes:</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-600">
                      {template.outcomeIds.length} outcomes
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1"
                >
                  📎 Use Template
                </Button>
                <Button variant="outline" size="sm" className="px-2" title="Save for later">
                  ⭐
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <ActivityTemplateEditor
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={createTemplate.mutate}
        isLoading={createTemplate.isPending}
      />
    </div>
  );
}

// Activity Template Editor Component
function ActivityTemplateEditor({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ActivityTemplateInput) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    titleEn: '',
    titleFr: '',
    descriptionEn: '',
    descriptionFr: '',
    domain: '',
    subject: '',
    materialsEn: '',
    materialsFr: '',
    prepTimeMin: '',
    groupType: 'Whole class',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      prepTimeMin: formData.prepTimeMin ? parseInt(formData.prepTimeMin, 10) : undefined,
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Activity Template">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="titleEn">English Title</Label>
            <Input
              id="titleEn"
              value={formData.titleEn}
              onChange={(e) => handleChange('titleEn', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="titleFr">French Title</Label>
            <Input
              id="titleFr"
              value={formData.titleFr}
              onChange={(e) => handleChange('titleFr', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="descriptionEn">English Description</Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) => handleChange('descriptionEn', e.target.value)}
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="descriptionFr">French Description</Label>
            <Textarea
              id="descriptionFr"
              value={formData.descriptionFr}
              onChange={(e) => handleChange('descriptionFr', e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="domain">Domain</Label>
            <select
              id="domain"
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Domain</option>
              <option value="oral">Oral</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="math">Math</option>
            </select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Subject</option>
              <option value="francais">Français</option>
              <option value="english">English</option>
              <option value="math">Math</option>
              <option value="science">Science</option>
            </select>
          </div>
          <div>
            <Label htmlFor="groupType">Group Type</Label>
            <select
              id="groupType"
              value={formData.groupType}
              onChange={(e) => handleChange('groupType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Individual">Individual</option>
              <option value="Small group">Small group</option>
              <option value="Whole class">Whole class</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="prepTimeMin">Preparation Time (minutes)</Label>
          <Input
            type="number"
            id="prepTimeMin"
            value={formData.prepTimeMin}
            onChange={(e) => handleChange('prepTimeMin', e.target.value)}
            min="0"
            max="180"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="materialsEn">Materials (English)</Label>
            <Textarea
              id="materialsEn"
              value={formData.materialsEn}
              onChange={(e) => handleChange('materialsEn', e.target.value)}
              rows={2}
              placeholder="List materials needed..."
            />
          </div>
          <div>
            <Label htmlFor="materialsFr">Materials (French)</Label>
            <Textarea
              id="materialsFr"
              value={formData.materialsFr}
              onChange={(e) => handleChange('materialsFr', e.target.value)}
              rows={2}
              placeholder="Liste du matériel nécessaire..."
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
