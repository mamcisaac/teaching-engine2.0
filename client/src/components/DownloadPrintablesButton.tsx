import { planningApi } from '../api/domains/planning';

interface Props {
  weekStart: string;
}

export function DownloadPrintablesButton({ weekStart }: Props): React.ReactElement {
  const handleClick = async (): Promise<void> => {
    const blob = await planningApi.downloadPrintables(weekStart);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'printables.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button className="border px-2 py-1" onClick={() => {
      void handleClick();
    }}>
      Download Printables
    </button>
  );
}
