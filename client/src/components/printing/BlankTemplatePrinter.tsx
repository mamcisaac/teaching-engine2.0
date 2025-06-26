import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Dialog from '../Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Printer, Download, Eye, FileText, Calendar, BookOpen, NotebookTabs, Grid3x3 } from 'lucide-react';
import {
  generateLongRangePlanBlankTemplate,
  generateUnitPlanBlankTemplate,
  generateLessonPlanBlankTemplate,
  generateDaybookBlankTemplate,
  generateWeeklyOverviewBlankTemplate,
  printHTML,
  downloadHTML,
  ETFOSchoolInfo
} from '../../utils/printUtils';

interface BlankTemplatePrinterProps {
  isOpen: boolean;
  onClose: () => void;
  templateType?: 'long-range' | 'unit' | 'lesson' | 'daybook' | 'weekly' | null;
  defaultSchoolInfo?: Partial<ETFOSchoolInfo>;
}

const templateConfigs = {
  'long-range': {
    title: 'Long-Range Plan Template',
    description: 'ETFO blank template for year-long curriculum planning',
    icon: Calendar,
    generator: generateLongRangePlanBlankTemplate,
    filename: 'ETFO-Long-Range-Plan-Template'
  },
  'unit': {
    title: 'Unit Plan Template',
    description: 'ETFO three-part unit planning template',
    icon: BookOpen,
    generator: generateUnitPlanBlankTemplate,
    filename: 'ETFO-Unit-Plan-Template'
  },
  'lesson': {
    title: 'Lesson Plan Template',
    description: 'ETFO three-part lesson structure template',
    icon: FileText,
    generator: generateLessonPlanBlankTemplate,
    filename: 'ETFO-Lesson-Plan-Template'
  },
  'daybook': {
    title: 'Weekly Daybook Template',
    description: 'ETFO weekly reflection and planning template',
    icon: NotebookTabs,
    generator: generateDaybookBlankTemplate,
    filename: 'ETFO-Weekly-Daybook-Template'
  },
  'weekly': {
    title: 'Weekly Overview Template',
    description: 'ETFO weekly planning overview template',
    icon: Grid3x3,
    generator: generateWeeklyOverviewBlankTemplate,
    filename: 'ETFO-Weekly-Overview-Template'
  }
};

export function BlankTemplatePrinter({
  isOpen,
  onClose,
  templateType = null,
  defaultSchoolInfo = {}
}: BlankTemplatePrinterProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templateConfigs | null>(
    templateType
  );
  const [schoolInfo, setSchoolInfo] = useState<ETFOSchoolInfo>({
    schoolName: '',
    teacherName: '',
    grade: '',
    subject: '',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    ...defaultSchoolInfo
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');

  const handleSchoolInfoChange = (field: keyof ETFOSchoolInfo, value: string) => {
    setSchoolInfo(prev => ({ ...prev, [field]: value }));
  };

  const generateTemplate = (template: keyof typeof templateConfigs) => {
    const config = templateConfigs[template];
    return config.generator(schoolInfo);
  };

  const handlePreview = (template: keyof typeof templateConfigs) => {
    const html = generateTemplate(template);
    setPreviewHTML(html);
    setPreviewOpen(true);
  };

  const handlePrint = (template: keyof typeof templateConfigs) => {
    const config = templateConfigs[template];
    const html = generateTemplate(template);
    printHTML(html, config.filename);
  };

  const handleDownload = (template: keyof typeof templateConfigs) => {
    const config = templateConfigs[template];
    const html = generateTemplate(template);
    downloadHTML(html, config.filename);
  };

  const renderTemplateCard = (key: keyof typeof templateConfigs) => {
    const config = templateConfigs[key];
    const IconComponent = config.icon;

    return (
      <Card key={key} className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <CardDescription className="text-sm">
                {config.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreview(key)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrint(key)}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(key)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <div className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ETFO Blank Planning Templates
            </h3>
            <p className="text-gray-600 text-sm">
              Generate professional, print-ready ETFO planning templates for physical planning and documentation.
            </p>
          </div>

          {/* School Information Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">School Information (Optional)</CardTitle>
              <CardDescription>
                Fill in your details to pre-populate templates with your information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolInfo.schoolName || ''}
                    onChange={(e) => handleSchoolInfoChange('schoolName', e.target.value)}
                    placeholder="e.g., Maple Leaf Elementary"
                  />
                </div>
                <div>
                  <Label htmlFor="teacherName">Teacher Name</Label>
                  <Input
                    id="teacherName"
                    value={schoolInfo.teacherName || ''}
                    onChange={(e) => handleSchoolInfoChange('teacherName', e.target.value)}
                    placeholder="e.g., Ms. Johnson"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={schoolInfo.grade || ''}
                    onChange={(e) => handleSchoolInfoChange('grade', e.target.value)}
                    placeholder="e.g., Grade 3"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={schoolInfo.subject || ''}
                    onChange={(e) => handleSchoolInfoChange('subject', e.target.value)}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={schoolInfo.academicYear || ''}
                    onChange={(e) => handleSchoolInfoChange('academicYear', e.target.value)}
                    placeholder="e.g., 2024-2025"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Available Templates</h4>
            
            {selectedTemplate ? (
              // Show only selected template if coming from specific page
              <div className="space-y-4">
                {renderTemplateCard(selectedTemplate)}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    View All Templates
                  </Button>
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              // Show all templates
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(templateConfigs).map((key) =>
                  renderTemplateCard(key as keyof typeof templateConfigs)
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Templates follow the ETFO Planning for Student Learning framework and are optimized for 8.5&quot; x 11&quot; printing.
            </p>
          </div>
        </div>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <div className="p-4 max-w-6xl max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Template Preview</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (previewHTML) {
                    printHTML(previewHTML, 'ETFO-Template-Preview');
                  }
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
          <div 
            className="border border-gray-200 bg-white overflow-auto h-[calc(95vh-120px)]"
            style={{ maxHeight: 'calc(95vh - 120px)' }}
          >
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full"
              style={{ minHeight: '600px' }}
              title="Template Preview"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}

// Quick action component for navigation bars
export function BlankTemplateQuickActions({
  templateType,
  schoolInfo
}: {
  templateType?: keyof typeof templateConfigs;
  schoolInfo?: Partial<ETFOSchoolInfo>;
}) {
  const [printerOpen, setPrinterOpen] = useState(false);

  if (!templateType) return null;

  const config = templateConfigs[templateType];

  const handleQuickPrint = () => {
    const html = config.generator(schoolInfo || {});
    printHTML(html, config.filename);
  };

  const _handleQuickDownload = () => {
    const html = config.generator(schoolInfo || {});
    downloadHTML(html, config.filename);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPrinterOpen(true)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Blank Template
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleQuickPrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Quick Print
        </Button>
      </div>

      <BlankTemplatePrinter
        isOpen={printerOpen}
        onClose={() => setPrinterOpen(false)}
        templateType={templateType}
        defaultSchoolInfo={schoolInfo}
      />
    </>
  );
}