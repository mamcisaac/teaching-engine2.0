import { downloadPrintables } from '../api';

interface Props {
  weekStart: string;
}

export default function DownloadPrintablesButton({ weekStart }: Props) {
  const handleClick = async () => {
    const res = await downloadPrintables(weekStart);
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'printables.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button className="border px-2 py-1" onClick={handleClick}>
      Download Printables
    </button>
  );
}
