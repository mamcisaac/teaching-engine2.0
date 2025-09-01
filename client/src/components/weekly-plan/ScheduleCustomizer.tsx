import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Clock, Calendar, Settings, Plus, Trash2, Info } from 'lucide-react';
import { format, parse } from 'date-fns';

interface TimeBlock {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'instruction' | 'break' | 'prep' | 'special';
  label: string;
  isEditable: boolean;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  blocks: TimeBlock[];
  isDefault?: boolean;
}

interface ScheduleCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule: TimeBlock[];
  onSave: (schedule: TimeBlock[]) => void;
}

const defaultTemplates: ScheduleTemplate[] = [
  {
    id: 'standard',
    name: 'Standard School Day',
    description: 'Traditional 9:00 AM - 3:30 PM schedule with lunch and recess',
    isDefault: true,
    blocks: [
      { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '09:45', type: 'instruction', label: 'Block 1', isEditable: false },
      { id: '2', dayOfWeek: 1, startTime: '09:45', endTime: '10:30', type: 'instruction', label: 'Block 2', isEditable: false },
      { id: '3', dayOfWeek: 1, startTime: '10:30', endTime: '10:45', type: 'break', label: 'Recess', isEditable: false },
      { id: '4', dayOfWeek: 1, startTime: '10:45', endTime: '11:30', type: 'instruction', label: 'Block 3', isEditable: false },
      { id: '5', dayOfWeek: 1, startTime: '11:30', endTime: '12:15', type: 'instruction', label: 'Block 4', isEditable: false },
      { id: '6', dayOfWeek: 1, startTime: '12:15', endTime: '13:00', type: 'break', label: 'Lunch', isEditable: false },
      { id: '7', dayOfWeek: 1, startTime: '13:00', endTime: '13:45', type: 'instruction', label: 'Block 5', isEditable: false },
      { id: '8', dayOfWeek: 1, startTime: '13:45', endTime: '14:30', type: 'instruction', label: 'Block 6', isEditable: false },
      { id: '9', dayOfWeek: 1, startTime: '14:30', endTime: '15:15', type: 'instruction', label: 'Block 7', isEditable: false },
    ]
  },
  {
    id: 'extended',
    name: 'Extended Day',
    description: 'Early start with after-school programming',
    blocks: [
      { id: '1', dayOfWeek: 1, startTime: '08:00', endTime: '08:45', type: 'instruction', label: 'Morning Block', isEditable: false },
      { id: '2', dayOfWeek: 1, startTime: '08:45', endTime: '09:30', type: 'instruction', label: 'Block 1', isEditable: false },
      { id: '3', dayOfWeek: 1, startTime: '09:30', endTime: '10:15', type: 'instruction', label: 'Block 2', isEditable: false },
      { id: '4', dayOfWeek: 1, startTime: '10:15', endTime: '10:30', type: 'break', label: 'Recess', isEditable: false },
      { id: '5', dayOfWeek: 1, startTime: '10:30', endTime: '11:15', type: 'instruction', label: 'Block 3', isEditable: false },
      { id: '6', dayOfWeek: 1, startTime: '11:15', endTime: '12:00', type: 'instruction', label: 'Block 4', isEditable: false },
      { id: '7', dayOfWeek: 1, startTime: '12:00', endTime: '13:00', type: 'break', label: 'Lunch', isEditable: false },
      { id: '8', dayOfWeek: 1, startTime: '13:00', endTime: '13:45', type: 'instruction', label: 'Block 5', isEditable: false },
      { id: '9', dayOfWeek: 1, startTime: '13:45', endTime: '14:30', type: 'instruction', label: 'Block 6', isEditable: false },
      { id: '10', dayOfWeek: 1, startTime: '14:30', endTime: '14:45', type: 'break', label: 'Snack', isEditable: false },
      { id: '11', dayOfWeek: 1, startTime: '14:45', endTime: '15:30', type: 'special', label: 'Enrichment', isEditable: false },
      { id: '12', dayOfWeek: 1, startTime: '15:30', endTime: '16:15', type: 'special', label: 'After School', isEditable: false },
    ]
  }
];

export function ScheduleCustomizer({ 
  isOpen, 
  onClose, 
  currentSchedule, 
  onSave 
}: ScheduleCustomizerProps): React.ReactElement {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [customBlocks, setCustomBlocks] = useState<TimeBlock[]>(currentSchedule);
  const [activeDay, setActiveDay] = useState(1);
  const [copyToAllDays, setCopyToAllDays] = useState(false);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    if (currentSchedule.length > 0) {
      setCustomBlocks(currentSchedule);
    } else {
      const template = defaultTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        applyTemplate(template);
      }
    }
  }, [currentSchedule, selectedTemplate]);

  const applyTemplate = (template: ScheduleTemplate) => {
    const newBlocks: TimeBlock[] = [];
    for (let day = 1; day <= 5; day++) {
      template.blocks.forEach(block => {
        newBlocks.push({
          ...block,
          id: `${day}-${block.id}`,
          dayOfWeek: day
        });
      });
    }
    setCustomBlocks(newBlocks);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = defaultTemplates.find(t => t.id === templateId);
    if (template) {
      applyTemplate(template);
    }
  };

  const handleAddBlock = () => {
    const newBlock: TimeBlock = {
      id: `custom-${Date.now()}`,
      dayOfWeek: activeDay,
      startTime: '09:00',
      endTime: '09:45',
      type: 'instruction',
      label: 'New Block',
      isEditable: true
    };

    if (copyToAllDays) {
      const newBlocks = [...customBlocks];
      for (let day = 1; day <= 5; day++) {
        newBlocks.push({ ...newBlock, id: `${day}-${newBlock.id}`, dayOfWeek: day });
      }
      setCustomBlocks(newBlocks);
    } else {
      setCustomBlocks([...customBlocks, newBlock]);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setCustomBlocks(customBlocks.filter(b => b.id !== blockId));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<TimeBlock>) => {
    setCustomBlocks(customBlocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const handleSave = () => {
    // Validate blocks for overlaps
    const dayBlocks = customBlocks.filter(b => b.type === 'instruction');
    const hasOverlaps = dayBlocks.some((block1, i) => 
      dayBlocks.some((block2, j) => {
        if (i >= j || block1.dayOfWeek !== block2.dayOfWeek) return false;
        const start1 = parse(block1.startTime, 'HH:mm', new Date());
        const end1 = parse(block1.endTime, 'HH:mm', new Date());
        const start2 = parse(block2.startTime, 'HH:mm', new Date());
        const end2 = parse(block2.endTime, 'HH:mm', new Date());
        return (start1 < end2 && end1 > start2);
      })
    );

    if (hasOverlaps) {
      alert('Schedule contains overlapping blocks. Please fix conflicts before saving.');
      return;
    }

    onSave(customBlocks);
    onClose();
  };

  const getDayBlocks = (day: number) => {
    return customBlocks
      .filter(b => b.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getBlockTypeColor = (type: TimeBlock['type']) => {
    switch (type) {
      case 'instruction': return 'bg-blue-100 border-blue-300';
      case 'break': return 'bg-green-100 border-green-300';
      case 'prep': return 'bg-purple-100 border-purple-300';
      case 'special': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Weekly Schedule
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="templates" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select a template to quickly set up your weekly schedule. You can customize it further in the Custom Schedule tab.
                </AlertDescription>
              </Alert>

              {defaultTemplates.map(template => (
                <div 
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:border-gray-400'
                  }`}
                  onClick={() => handleTemplateChange(template.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Default</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {template.blocks.map(block => (
                      <span 
                        key={block.id}
                        className={`px-2 py-1 text-xs rounded ${getBlockTypeColor(block.type)}`}
                      >
                        {block.label}: {block.startTime}-{block.endTime}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-4">
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    variant={activeDay === index + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveDay(index + 1)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="copy-all"
                  checked={copyToAllDays}
                  onCheckedChange={setCopyToAllDays}
                />
                <Label htmlFor="copy-all" className="text-sm">Apply to all days</Label>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {getDayBlocks(activeDay).map(block => (
                  <div 
                    key={block.id}
                    className={`p-3 border rounded-lg ${getBlockTypeColor(block.type)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <Input
                          value={block.label}
                          onChange={(e) => handleUpdateBlock(block.id, { label: e.target.value })}
                          placeholder="Block name"
                          disabled={!block.isEditable}
                        />
                        <Input
                          type="time"
                          value={block.startTime}
                          onChange={(e) => handleUpdateBlock(block.id, { startTime: e.target.value })}
                          disabled={!block.isEditable}
                        />
                        <Input
                          type="time"
                          value={block.endTime}
                          onChange={(e) => handleUpdateBlock(block.id, { endTime: e.target.value })}
                          disabled={!block.isEditable}
                        />
                        <select
                          className="px-3 py-1 border rounded"
                          value={block.type}
                          onChange={(e) => handleUpdateBlock(block.id, { type: e.target.value as TimeBlock['type'] })}
                          disabled={!block.isEditable}
                        >
                          <option value="instruction">Instruction</option>
                          <option value="break">Break</option>
                          <option value="prep">Prep</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                      {block.isEditable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBlock(block.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="mt-4"
                variant="outline"
                onClick={handleAddBlock}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time Block
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}