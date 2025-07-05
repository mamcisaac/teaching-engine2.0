import { useState, useEffect } from 'react';
import { newsletterApi } from '../api/domains/newsletter';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationBell() {
  const [suggested, setSuggested] = useState(false);
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    // Only fetch suggestions if authenticated and initialized
    if (isAuthenticated && isInitialized) {
      newsletterApi.getSuggestions()
        .then((r) => setSuggested(r.suggested))
        .catch(() => {
          // Silently handle errors
          setSuggested(false);
        });
    }
  }, [isAuthenticated, isInitialized]);

  if (!suggested) return null;
  return (
    <div className="absolute top-2 right-2">
      <Link to="/newsletters/new" className="text-red-600 underline">
        It&apos;s time to send a newsletter!
      </Link>
    </div>
  );
}