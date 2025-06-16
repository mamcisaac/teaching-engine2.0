import ResourceLibrary from '../components/ResourceLibrary';

export default function ResourcesPage() {
  // Get current user ID (you may need to adjust this based on your auth context)
  const currentUserId = 1; // This should come from your auth context

  return (
    <div className="container mx-auto px-4 py-6">
      <ResourceLibrary userId={currentUserId} />
    </div>
  );
}
