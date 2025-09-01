import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useWeeklyDashboardStore } from '../../stores/weeklyDashboardStore';
import {
  Settings,
  Eye,
  Palette,
  Keyboard,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Info,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  Zap
} from 'lucide-react';

interface WeeklyPlanSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyPlanSettings({ isOpen, onClose }: WeeklyPlanSettingsProps): React.ReactElement {
  const { viewPreferences, updateViewPreferences, resetSettings } = useWeeklyDashboardStore();
  const [localPrefs, setLocalPrefs] = useState(viewPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof typeof viewPreferences, value: any) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateViewPreferences(localPrefs);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setLocalPrefs(viewPreferences);
    setHasChanges(false);
  };

  const exportSettings = () => {
    const settings = {
      viewPreferences,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-plan-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.viewPreferences) {
          setLocalPrefs(settings.viewPreferences);
          setHasChanges(true);
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Weekly Plan Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="display" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="display" className="space-y-6 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">View Options</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-weekends">Show Weekends</Label>
                  <Switch
                    id="show-weekends"
                    checked={localPrefs.showWeekends}
                    onCheckedChange={(checked) => handleChange('showWeekends', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-times">Show Time Labels</Label>
                  <Switch
                    id="show-times"
                    checked={localPrefs.showTimeLabels}
                    onCheckedChange={(checked) => handleChange('showTimeLabels', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <Switch
                    id="compact-view"
                    checked={localPrefs.compactView}
                    onCheckedChange={(checked) => handleChange('compactView', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="group-subjects">Group by Subject</Label>
                  <Switch
                    id="group-subjects"
                    checked={localPrefs.groupBySubject}
                    onCheckedChange={(checked) => handleChange('groupBySubject', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-completed">Show Completed Lessons</Label>
                  <Switch
                    id="show-completed"
                    checked={localPrefs.showCompletedLessons}
                    onCheckedChange={(checked) => handleChange('showCompletedLessons', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Time Display</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="24-hour">24-Hour Time Format</Label>
                  <Switch
                    id="24-hour"
                    checked={localPrefs.use24HourTime}
                    onCheckedChange={(checked) => handleChange('use24HourTime', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Day Start Time</Label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded"
                    value={localPrefs.dayStartTime}
                    onChange={(e) => handleChange('dayStartTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Day End Time</Label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded"
                    value={localPrefs.dayEndTime}
                    onChange={(e) => handleChange('dayEndTime', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Theme</h3>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={localPrefs.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('theme', 'light')}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={localPrefs.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('theme', 'dark')}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={localPrefs.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('theme', 'system')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Colors</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="colorblind">Colorblind Mode</Label>
                  <Switch
                    id="colorblind"
                    checked={localPrefs.colorblindMode}
                    onCheckedChange={(checked) => handleChange('colorblindMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <Switch
                    id="high-contrast"
                    checked={localPrefs.highContrast}
                    onCheckedChange={(checked) => handleChange('highContrast', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Typography</h3>
                
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[localPrefs.fontSize || 14]}
                      onValueChange={([value]) => handleChange('fontSize', value)}
                      min={12}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{localPrefs.fontSize || 14}px</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-6 p-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These settings help make the Weekly Plan more accessible for all users.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Keyboard Navigation</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-nav">Enable Keyboard Navigation</Label>
                  <Switch
                    id="keyboard-nav"
                    checked={localPrefs.enableKeyboardShortcuts}
                    onCheckedChange={(checked) => handleChange('enableKeyboardShortcuts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-indicators">Show Focus Indicators</Label>
                  <Switch
                    id="focus-indicators"
                    checked={localPrefs.showFocusIndicators !== false}
                    onCheckedChange={(checked) => handleChange('showFocusIndicators', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Screen Reader</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="announcements">Enable Announcements</Label>
                  <Switch
                    id="announcements"
                    checked={localPrefs.enableAnnouncements !== false}
                    onCheckedChange={(checked) => handleChange('enableAnnouncements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verbose">Verbose Descriptions</Label>
                  <Switch
                    id="verbose"
                    checked={localPrefs.verboseDescriptions || false}
                    onCheckedChange={(checked) => handleChange('verboseDescriptions', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Motion</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <Switch
                    id="reduce-motion"
                    checked={localPrefs.reduceMotion || false}
                    onCheckedChange={(checked) => handleChange('reduceMotion', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-scroll">Disable Auto-scroll</Label>
                  <Switch
                    id="auto-scroll"
                    checked={localPrefs.disableAutoScroll || false}
                    onCheckedChange={(checked) => handleChange('disableAutoScroll', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Lesson Reminders</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-reminders">Enable Reminders</Label>
                  <Switch
                    id="enable-reminders"
                    checked={localPrefs.enableReminders}
                    onCheckedChange={(checked) => handleChange('enableReminders', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reminder Time (minutes before)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[localPrefs.reminderMinutesBefore || 5]}
                      onValueChange={([value]) => handleChange('reminderMinutesBefore', value)}
                      min={1}
                      max={30}
                      step={1}
                      className="flex-1"
                      disabled={!localPrefs.enableReminders}
                    />
                    <span className="text-sm w-12">{localPrefs.reminderMinutesBefore || 5}m</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Updates</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto-refresh Schedule</Label>
                  <Switch
                    id="auto-refresh"
                    checked={localPrefs.autoRefresh}
                    onCheckedChange={(checked) => handleChange('autoRefresh', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Refresh Interval (seconds)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[localPrefs.refreshInterval || 30]}
                      onValueChange={([value]) => handleChange('refreshInterval', value)}
                      min={10}
                      max={120}
                      step={10}
                      className="flex-1"
                      disabled={!localPrefs.autoRefresh}
                    />
                    <span className="text-sm w-12">{localPrefs.refreshInterval || 30}s</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Sync & Storage</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="offline-mode">Enable Offline Mode</Label>
                  <Switch
                    id="offline-mode"
                    checked={localPrefs.enableOfflineMode}
                    onCheckedChange={(checked) => handleChange('enableOfflineMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto-save Changes</Label>
                  <Switch
                    id="auto-save"
                    checked={localPrefs.autoSave !== false}
                    onCheckedChange={(checked) => handleChange('autoSave', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Import/Export</h3>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <label>
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Settings
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={importSettings}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Reset</h3>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Resetting will restore all settings to their default values.
                  </AlertDescription>
                </Alert>

                <Button variant="destructive" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Settings
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}