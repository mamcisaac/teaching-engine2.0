import React from 'react';
import { toast } from 'sonner';

export default function BackupButton(): React.ReactElement {
  const handleClick = (): void => {
    toast('Backup starting…');
    window.location.href = '/api/backup';
  };
  return (
    <button
      className="px-2 py-1 bg-blue-600 text-white"
      title="Download a data backup"
      onClick={handleClick}
    >
      Download Backup
    </button>
  );
}
