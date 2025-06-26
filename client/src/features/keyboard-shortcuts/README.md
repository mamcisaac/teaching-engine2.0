# Keyboard Shortcuts Feature

This document provides a comprehensive guide to the keyboard shortcuts feature in Teaching Engine 2.0, designed to help tech-savvy teachers like Sophie Leblanc work more efficiently.

## Overview

The keyboard shortcuts system provides:
- **Global shortcuts** for common actions (save, search, new lesson)
- **Navigation shortcuts** for quick movement between sections
- **Context-specific shortcuts** for planning and editing
- **Customizable key bindings** to suit individual preferences
- **Visual hints** showing shortcuts in the UI
- **Cross-platform support** (Windows/Mac/Linux)

## Quick Start

### For Users

1. Press `?` or `F1` at any time to view all available shortcuts
2. Use `Ctrl/Cmd + S` to save your work
3. Navigate quickly with `Alt + D` (Dashboard), `Alt + P` (Planning), etc.
4. Toggle the sidebar with `Ctrl/Cmd + B`
5. Access ETFO planning levels with `Alt + 1-5`

### For Developers

```tsx
// 1. Import the hook
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

// 2. Register a shortcut in your component
function MyComponent() {
  const handleSave = () => {
    // Save logic here
  };

  useKeyboardShortcut(
    handleSave,
    {
      key: 's',
      ctrl: true,
      cmd: true,
      description: 'Save document',
      category: 'editing'
    }
  );

  return <div>My Component</div>;
}
```

## Architecture

### Core Components

1. **KeyboardShortcutsContext** (`contexts/KeyboardShortcutsContext.tsx`)
   - Manages global shortcut registry
   - Handles keyboard event listening
   - Stores user preferences
   - Provides cross-platform key formatting

2. **useKeyboardShortcut Hook** (`hooks/useKeyboardShortcut.ts`)
   - Registers shortcuts with automatic cleanup
   - Supports dynamic enable/disable
   - Handles modifier keys correctly

3. **KeyboardShortcutsHelp Modal** (`components/KeyboardShortcutsHelp.tsx`)
   - Displays all available shortcuts
   - Groups by category
   - Shows platform-specific keys
   - Includes preference toggles

4. **ShortcutHint Component** (`components/ui/ShortcutHint.tsx`)
   - Visual indicators for shortcuts
   - Multiple display modes (inline, tooltip, badge)
   - Respects user preferences

## Default Shortcuts

### Global Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Show help | `?` or `F1` | `?` or `F1` |
| Create new lesson | `Ctrl+N` | `⌘N` |
| Save | `Ctrl+S` | `⌘S` |
| Search | `Ctrl+F` | `⌘F` |
| Close modals | `Esc` | `Esc` |

### Navigation Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Dashboard | `Alt+D` | `⌥D` |
| Planning | `Alt+P` | `⌥P` |
| Curriculum | `Alt+C` | `⌥C` |
| Help | `Alt+H` | `⌥H` |
| ETFO Level 1-5 | `Alt+1-5` | `⌥1-5` |
| Toggle sidebar | `Ctrl+B` | `⌘B` |
| Go back | `Alt+←` | `⌥←` |
| Go forward | `Alt+→` | `⌥→` |

### Planning Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save and continue | `Ctrl+Enter` | `⌘Enter` |
| Duplicate | `Ctrl+D` | `⌘D` |
| Delete | `Ctrl+Delete` | `⌘Delete` |
| Print | `Ctrl+P` | `⌘P` |
| Toggle AI | `Ctrl+I` | `⌘I` |

### Editing Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Undo | `Ctrl+Z` | `⌘Z` |
| Redo | `Ctrl+Y` or `Ctrl+Shift+Z` | `⌘Y` or `⌘⇧Z` |
| Next field | `Tab` | `Tab` |
| Previous field | `Shift+Tab` | `⇧Tab` |

## Usage Examples

### Basic Component with Shortcut

```tsx
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

function SaveButton() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Perform save operation
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Register Ctrl/Cmd + S
  useKeyboardShortcut(
    handleSave,
    {
      key: 's',
      ctrl: true,
      cmd: true,
      description: 'Save changes',
      category: 'editing'
    }
  );

  return (
    <Button onClick={handleSave}>
      {saved ? 'Saved!' : 'Save'}
    </Button>
  );
}
```

### Button with Visual Shortcut Hint

```tsx
import { ButtonWithShortcut } from '../ui/ButtonWithShortcut';

function MyForm() {
  return (
    <ButtonWithShortcut
      shortcut={{ key: 's', ctrl: true, cmd: true }}
      shortcutDescription="Save form"
      onClick={handleSave}
      variant="primary"
    >
      Save
    </ButtonWithShortcut>
  );
}
```

### Context-Specific Shortcuts

```tsx
import { useLessonPlanShortcuts } from '../../hooks/useLessonPlanShortcuts';

function LessonPlanEditor() {
  const [content, setContent] = useState('');
  
  // Register all lesson planning shortcuts
  useLessonPlanShortcuts({
    onSave: () => saveLessonPlan(),
    onDuplicate: () => duplicateLessonPlan(),
    onDelete: () => deleteLessonPlan(),
    onPrint: () => printLessonPlan(),
    enabled: true
  });

  return (
    // Your lesson plan editor UI
  );
}
```

### Custom Shortcut Registration

```tsx
// Register multiple shortcuts at once
useKeyboardShortcuts([
  {
    handler: () => console.log('Action 1'),
    options: { key: '1', alt: true, description: 'Action 1' }
  },
  {
    handler: () => console.log('Action 2'),
    options: { key: '2', alt: true, description: 'Action 2' }
  }
]);
```

## Customization

Users can customize shortcuts through the settings page:

```tsx
import { KeyboardShortcutsSettings } from '../settings/KeyboardShortcutsSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <KeyboardShortcutsSettings />
    </div>
  );
}
```

### Preferences API

```tsx
const { preferences, updatePreferences } = useKeyboardShortcuts();

// Disable all shortcuts
updatePreferences({ enabled: false });

// Hide visual hints
updatePreferences({ showHints: false });

// Custom key bindings
updatePreferences({
  customShortcuts: {
    'global-save': { key: 'k', ctrl: true }
  }
});
```

## Best Practices

### Do's
- ✅ Use standard shortcuts that users expect (Ctrl+S for save)
- ✅ Provide visual hints for discoverability
- ✅ Group related shortcuts by category
- ✅ Allow customization for power users
- ✅ Test shortcuts on both Windows and Mac
- ✅ Disable shortcuts when appropriate (e.g., in modals)
- ✅ Document all shortcuts in help pages

### Don'ts
- ❌ Override browser shortcuts without good reason
- ❌ Use single letters without modifiers (except in specific contexts)
- ❌ Create conflicts with OS shortcuts
- ❌ Forget to handle disabled states
- ❌ Ignore accessibility considerations

## Testing

```tsx
import { render, fireEvent } from '@testing-library/react';
import { KeyboardShortcutsProvider } from '../contexts/KeyboardShortcutsContext';

test('keyboard shortcut triggers action', () => {
  const handleAction = jest.fn();
  
  render(
    <KeyboardShortcutsProvider>
      <ComponentWithShortcut onAction={handleAction} />
    </KeyboardShortcutsProvider>
  );

  // Trigger Ctrl+S
  fireEvent.keyDown(window, { 
    key: 's', 
    ctrlKey: true 
  });

  expect(handleAction).toHaveBeenCalled();
});
```

## Accessibility

The keyboard shortcuts system is designed with accessibility in mind:

- All shortcuts are documented and discoverable
- Visual hints use proper ARIA labels
- Shortcuts don't interfere with screen readers
- Tab navigation is preserved
- Focus management is handled correctly

## Performance

The system is optimized for performance:

- Event listeners are attached at the window level (single listener)
- Shortcuts are stored in a ref to avoid re-renders
- Preferences are cached in localStorage
- Component unmounting properly cleans up shortcuts

## Future Enhancements

Planned improvements include:

1. **Shortcut Recording**: Visual shortcut recorder in settings
2. **Conflict Detection**: Warn about conflicting shortcuts
3. **Import/Export**: Share shortcut configurations
4. **Context Menus**: Show shortcuts in right-click menus
5. **Touch Bar Support**: Mac Touch Bar integration
6. **Gesture Support**: Trackpad gestures for navigation

## Troubleshooting

### Shortcuts Not Working

1. Check if shortcuts are enabled in settings
2. Ensure you're not in an input field (unless allowed)
3. Verify no browser extensions are intercepting keys
4. Check for OS-level shortcut conflicts

### Platform Issues

- **Mac**: Use Cmd instead of Ctrl for most shortcuts
- **Linux**: Some window managers may intercept Alt shortcuts
- **Browser**: Some shortcuts may be reserved (e.g., Ctrl+W)

## Contributing

When adding new shortcuts:

1. Check for conflicts with existing shortcuts
2. Follow the naming convention for shortcut IDs
3. Add to the appropriate category
4. Update documentation
5. Add tests for the new shortcut
6. Consider cross-platform compatibility

## References

- [MDN Keyboard Event Documentation](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [Platform Keyboard Conventions](https://support.apple.com/en-us/HT201236)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)