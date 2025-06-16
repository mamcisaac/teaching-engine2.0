import { toast } from 'sonner';

export default function BackupButton() {
  const handleClick = () => {
    toast('Backup starting…');
    window.location.href = '/api/backup';
  };
  return (
    <button
      className="px-2 py-1 bg-blue-600 text-white"
      onClick={handleClick}
      title="Download a data backup"
    >
      Download Backup
    </button>
  );
}
