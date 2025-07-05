import React, { useState } from 'react';
import {
  useKeyboardShortcuts,
  formatShortcut,
  KeyboardShortcut,
} from '../../contexts/KeyboardShortcutsContext';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Keyboard, Settings, RefreshCw, Check, X, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export const KeyboardShortcutsSettings: React.FC = () => {
  const { shortcuts, preferences, updatePreferences } = useKeyboardShortcuts();
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [captureKey, setCaptureKey] = useState<string>('');
  const [captureModifiers, setCaptureModifiers] = useState({
    ctrl: false,
    cmd: false,
    alt: false,
    shift: false,
  });

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts
    .filter((s) => s.visible !== false)
    .reduce(
      (acc, shortcut) => {
        if (!acc[shortcut.category]) {
          acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
      },
      {} as Record<KeyboardShortcut['category'], KeyboardShortcut[]>,
    );

  const categoryLabels: Record<KeyboardShortcut['category'], string> = {
    global: 'Global Shortcuts',
    navigation: 'Navigation',
    planning: 'Planning & Editing',
    editing: 'Text Editing',
    other: 'Other',
  };

  const handleKeyCapture = (e: React.KeyboardEvent, _shortcutId: string) => {
    e.preventDefault();

    const key = e.key;
    const modifiers = {
      ctrl: e.ctrlKey,
      cmd: e.metaKey,
      alt: e.altKey,
      shift: e.shiftKey,
    };

    setCaptureKey(key);
    setCaptureModifiers(modifiers);
  };

  const saveCustomShortcut = (shortcutId: string) => {
    const customShortcuts = {
      ...preferences.customShortcuts,
      [shortcutId]: {
        key: captureKey,
        ...captureModifiers,
      },
    };

    updatePreferences({ customShortcuts });
    setEditingShortcut(null);
    setCaptureKey('');
    setCaptureModifiers({ ctrl: false, cmd: false, alt: false, shift: false });
  };

  const resetShortcut = (shortcutId: string) => {
    const customShortcuts = { ...preferences.customShortcuts };
    delete customShortcuts[shortcutId];
    updatePreferences({ customShortcuts });
  };

  const resetAllShortcuts = () => {
    if (
      window.confirm('Are you sure you want to reset all keyboard shortcuts to their defaults?')
    ) {
      updatePreferences({ customShortcuts: {} });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>
            Customize keyboard shortcuts to improve your workflow efficiency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-medium">Enable Keyboard Shortcuts</Label>
              <p className="text-sm text-gray-600 mt-1">
                Turn on keyboard shortcuts for faster navigation and actions
              </p>
            </div>
            <Switch
              checked={preferences.enabled}
              onChange={(enabled) => updatePreferences({ enabled })}
              size="md"
            />
          </div>

          {/* Shortcut Hints Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-medium">Show Shortcut Hints</Label>
              <p className="text-sm text-gray-600 mt-1">
                Display keyboard shortcut hints next to buttons and menu items
              </p>
            </div>
            <Switch
              checked={preferences.showHints}
              onChange={(showHints) => updatePreferences({ showHints })}
              size="md"
            />
          </div>

          {/* Quick Reference */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Press{' '}
              <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
                ?
              </kbd>{' '}
              at any time to view all available keyboard shortcuts
            </AlertDescription>
          </Alert>

          {/* Shortcuts List */}
          <div className="space-y-6">
            {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {categoryLabels[category as KeyboardShortcut['category']]}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => {
                    const customShortcut = preferences.customShortcuts[shortcut.id];
                    const isEditing = editingShortcut === shortcut.id;
                    const hasCustom = !!customShortcut;
                    const displayShortcut = customShortcut
                      ? { ...shortcut, ...customShortcut }
                      : shortcut;

                    return (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{shortcut.description}</p>
                          {hasCustom && (
                            <p className="text-xs text-gray-500 mt-1">
                              Default: {formatShortcut(shortcut)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <Input
                                type="text"
                                value={
                                  captureKey
                                    ? formatShortcut({
                                        ...shortcut,
                                        key: captureKey,
                                        ...captureModifiers,
                                      })
                                    : ''
                                }
                                onKeyDown={(e) => handleKeyCapture(e, shortcut.id)}
                                placeholder="Press keys..."
                                className="w-32 text-center"
                                readOnly
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => saveCustomShortcut(shortcut.id)}
                                disabled={!captureKey}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingShortcut(null);
                                  setCaptureKey('');
                                  setCaptureModifiers({
                                    ctrl: false,
                                    cmd: false,
                                    alt: false,
                                    shift: false,
                                  });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg">
                                {formatShortcut(displayShortcut)}
                              </kbd>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingShortcut(shortcut.id)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              {hasCustom && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => resetShortcut(shortcut.id)}
                                  title="Reset to default"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Reset All Button */}
          <div className="pt-4 border-t">
            <Button variant="secondary" onClick={resetAllShortcuts} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
