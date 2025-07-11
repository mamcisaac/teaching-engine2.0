import { planningApi } from '../api/domains/planning';

interface Props {
  weekStart: string;
}

export default function DownloadPrintablesButton({ weekStart }: Props): React.ReactElement {
  const handleClick = async () => {
    const blob = await planningApi.downloadPrintables(weekStart);
    const url = window.URL.createObjectURL(blob);
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
