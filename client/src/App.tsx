import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { createContext, useContext } from 'react';

// Mock auth context for testing with working login
const mockLogin = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return data;
};

const AuthContext = createContext({
  user: null,
  login: mockLogin,
  logout: async () => {},
  isAuthenticated: false,
  isLoading: false,
  isInitialized: true,
  checkAuth: async () => {},
  getToken: () => null,
  refreshToken: async () => false,
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Simple Dashboard component for testing
const Dashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Planning Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Long Range Plans</h2>
          <p className="text-gray-600">Plan your curriculum for the entire year</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Plans
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Unit Plans</h2>
          <p className="text-gray-600">Create detailed unit plans</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create Unit
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Lesson Plans</h2>
          <p className="text-gray-600">Design daily lesson plans</p>
          <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Create Lesson
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">ETFO Planning</h2>
          <p className="text-gray-600">ETFO-compliant lesson planning</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
            Start ETFO Plan
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Daybook</h2>
          <p className="text-gray-600">Daily teaching notes and reflections</p>
          <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
            Open Daybook
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
          <p className="text-gray-600">Browse curriculum expectations</p>
          <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Browse Curriculum
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/planner/dashboard" element={<Dashboard />} />
        <Route
          path="/"
          element={
            <div>
              Home Page - Please <a href="/login">login</a>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <div>
              Page not found - <a href="/login">Go to login</a>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
