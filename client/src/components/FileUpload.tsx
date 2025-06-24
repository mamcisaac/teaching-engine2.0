import { useState } from 'react';
import { useUploadMediaResource } from '../api';

// Updated for ETFO-aligned media resource uploads
export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadMediaResource();

  return (
    <div className="space-y-2">
      <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      <button
        className="border px-2 py-1"
        disabled={!file}
        onClick={() => {
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);
            upload.mutate(formData);
          }
        }}
      >
        Upload
      </button>
    </div>
  );
}
