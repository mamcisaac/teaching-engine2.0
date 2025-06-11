interface Props {
  week: { id: number };
}

export default function WeekResources({ week }: Props) {
  return (
    <button
      className="px-2 py-1 bg-blue-600 text-white"
      onClick={() => window.open(`/api/weeks/${week.id}/resources.zip`)}
    >
      Download All
    </button>
  );
}
