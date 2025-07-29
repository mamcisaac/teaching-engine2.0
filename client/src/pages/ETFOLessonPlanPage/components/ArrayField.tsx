import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';

interface ArrayFieldProps {
  label: string;
  description?: string;
  placeholder: string;
  items: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function ArrayField({
  label,
  description,
  placeholder,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: ArrayFieldProps): React.ReactElement {
  return (
    <div>
      <Label htmlFor="input">{label}</Label>
      {description && (
        <p className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}
      <div className="space-y-2 mt-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={item}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onUpdate(index, e.target.value);
              }}
            />
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => {
 onRemove(index); 
}}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          className="w-full"
          size="sm"
          type="button"
          variant="outline"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {label.slice(0, -1)} {/* Remove 's' to make singular */}
        </Button>
      </div>
    </div>
  );
}