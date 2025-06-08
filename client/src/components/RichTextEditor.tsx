import { useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  return (
    <textarea
      className="border p-2 w-full h-40"
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}
