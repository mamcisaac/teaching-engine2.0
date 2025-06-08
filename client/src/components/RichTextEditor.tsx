import { useState } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const [html, setHtml] = useState(value);

  return (
    <div
      className="border p-2 min-h-[150px]"
      role="textbox"
      contentEditable
      dangerouslySetInnerHTML={{ __html: html }}
      onInput={(e) => {
        const val = (e.target as HTMLElement).innerHTML;
        setHtml(val);
        onChange(val);
      }}
    />
  );
}
