import { useState } from 'react';
import { useUploadResource } from '../api';

interface Props {
  activityId?: number;
}

export default function FileUpload({ activityId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadResource();

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
            formData.append('filename', file.name);
            formData.append('type', file.type);
            formData.append('size', file.size.toString());
            if (activityId) {
              formData.append('activityId', activityId.toString());
            }
            upload.mutate(formData);
          }
        }}
      >
        Upload
      </button>
    </div>
  );
}
