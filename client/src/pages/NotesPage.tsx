import NotesSearchView from '../components/NotesSearchView';

export default function NotesPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Notes</h1>
      <NotesSearchView />
    </div>
  );
}
