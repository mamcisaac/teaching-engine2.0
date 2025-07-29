import React from 'react';

import { ArrayField } from '../ArrayField';

interface MaterialsTabProps {
  materials: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function MaterialsTab({
  materials,
  onAdd,
  onUpdate,
  onRemove,
}: MaterialsTabProps): React.ReactElement {
  return (
    <div className="space-y-4 mt-4">
      <ArrayField
        items={materials}
        label="Materials and Resources"
        placeholder="e.g., Chart paper, markers, science textbook p.45-48"
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    </div>
  );
}