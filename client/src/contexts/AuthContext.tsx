import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string; // JWT token for API authentication
}

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  getToken: () => string | null;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {},
  getToken: () => null,
  setToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Token management functions
  const getToken = (): string | null => {
    return user?.token || localStorage.getItem('auth_token');
  };

  const setToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
    if (user) {
      setUser({ ...user, token });
    }
  };

  const clearToken = (): void => {
    localStorage.removeItem('auth_token');
    if (user) {
      const { token: _token, ...userWithoutToken } = user;
      setUser(userWithoutToken as User);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const checkAuthWithAbort = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          signal: abortController.signal,
        });

        if (!abortController.signal.aborted) {
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Auth check failed:', error);
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    // Ensure loading state is set to false after 2 seconds max
    timeoutId = setTimeout(() => {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }, 2000);

    checkAuthWithAbort();

    // Cleanup function to abort the request
    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }

    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isLoading, checkAuth, getToken, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
