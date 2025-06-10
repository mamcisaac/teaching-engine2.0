import { useState, useEffect } from 'react';
import { fetchNewsletterSuggestions } from '../api';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [suggested, setSuggested] = useState(false);

  useEffect(() => {
    fetchNewsletterSuggestions().then((r) => setSuggested(r.suggested));
  }, []);

  if (!suggested) return null;
  return (
    <div className="absolute top-2 right-2">
      <Link to="/newsletters/new" className="text-red-600 underline">
        It’s time to send a newsletter!
      </Link>
    </div>
  );
}
