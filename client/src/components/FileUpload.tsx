import React, { useState } from 'react';

import { useUploadResource } from '../api/domains/resource/hooks';

// Updated for ETFO-aligned media resource uploads
export function FileUpload(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadResource();

  return (
    <div className="space-y-2">
      <input type="file" onChange={(e): void => {
        setFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null); 
}} />
      <button
        className="border px-2 py-1"
        disabled={!file}
        onClick={(): void => {
          if (file) {
            upload.mutate({
              file,
              metadata: {
                title: file.name,
                description: '',
                tags: [],
                category: 'document'
              }
            });
          }
        }}
      >
        Upload
      </button>
    </div>
  );
}
