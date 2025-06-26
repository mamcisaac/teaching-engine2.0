import React from 'react';

interface PreferenceWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function PreferenceWizard({ onComplete, onSkip }: PreferenceWizardProps) {
  return (
    <div data-testid="preference-wizard-mock">
      <h3>Preference Wizard Mock</h3>
      <button onClick={onComplete}>Complete Preferences</button>
      <button onClick={onSkip}>Skip Preferences</button>
    </div>
  );
}