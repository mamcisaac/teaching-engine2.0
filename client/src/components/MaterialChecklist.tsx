import { useState } from 'react';
import { MaterialList } from '../api';

interface Props {
  list: MaterialList;
}

export default function MaterialChecklist({ list }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => list.items.map(() => false));
  return (
    <ul className="space-y-1">
      {list.items.map((item, idx) => (
        <li key={idx} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={checked[idx]}
            onChange={(e) => {
              const copy = [...checked];
              copy[idx] = e.target.checked;
              setChecked(copy);
            }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
