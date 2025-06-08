import { useState } from 'react';
import { useUploadResource } from '../api';

interface Props {
  activityId?: number;
}

export default function ResourceUpload({ activityId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadResource();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    if (activityId) fd.append('activityId', String(activityId));
    upload.mutate(fd);
    setFile(null);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-dashed border-2 p-4 text-center"
    >
      <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      {file && <p className="mt-2">{file.name}</p>}
      <button onClick={handleUpload} className="mt-2 px-2 py-1 bg-blue-600 text-white">
        Upload
      </button>
    </div>
  );
}
