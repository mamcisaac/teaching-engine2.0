import React from 'react';

import { ArrayField } from '../ArrayField';

interface DifferentiationTabProps {
  accommodations: string[];
  modifications: string[];
  extensions: string[];
  accommodationsHandlers: {
    add: () => void;
    update: (index: number, value: string) => void;
    remove: (index: number) => void;
  };
  modificationsHandlers: {
    add: () => void;
    update: (index: number, value: string) => void;
    remove: (index: number) => void;
  };
  extensionsHandlers: {
    add: () => void;
    update: (index: number, value: string) => void;
    remove: (index: number) => void;
  };
}

export function DifferentiationTab({
  accommodations,
  modifications,
  extensions,
  accommodationsHandlers,
  modificationsHandlers,
  extensionsHandlers,
}: DifferentiationTabProps): React.ReactElement {
  return (
    <div className="space-y-6 mt-4">
      <ArrayField
        description="Supports for students to access the curriculum"
        items={accommodations}
        label="Accommodations"
        placeholder="e.g., Provide visual aids, allow extra time"
        onAdd={accommodationsHandlers.add}
        onRemove={accommodationsHandlers.remove}
        onUpdate={accommodationsHandlers.update}
      />

      <ArrayField
        description="Changes to curriculum expectations for individual students"
        items={modifications}
        label="Modifications"
        placeholder="e.g., Simplified text, reduced number of questions"
        onAdd={modificationsHandlers.add}
        onRemove={modificationsHandlers.remove}
        onUpdate={modificationsHandlers.update}
      />

      <ArrayField
        description="Enrichment activities for students who finish early"
        items={extensions}
        label="Extensions"
        placeholder="e.g., Research project, advanced problems"
        onAdd={extensionsHandlers.add}
        onRemove={extensionsHandlers.remove}
        onUpdate={extensionsHandlers.update}
      />
    </div>
  );
}