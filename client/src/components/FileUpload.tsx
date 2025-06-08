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
          if (file)
            upload.mutate({
              filename: file.name,
              file,
              type: file.type,
              size: file.size,
              activityId,
            });
        }}
      >
        Upload
      </button>
    </div>
  );
}
