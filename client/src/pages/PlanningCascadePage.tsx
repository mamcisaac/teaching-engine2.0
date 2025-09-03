import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlanningCascadeView from '../components/PlanningCascadeView';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { AlertCircle, RefreshCw, FileText, BookOpen, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const PlanningCascadePage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchCascadeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, try to login to get a token
      const loginResponse = await fetch('/api/auth-cascade/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Authentication failed');
      }

      const loginResult = await loginResponse.json();
      if (!loginResult.success || !loginResult.data.token) {
        throw new Error('Invalid authentication response');
      }

      // Use the token to fetch real cascade data
      const cascadeResponse = await fetch('/api/cascade-real/data', {
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`
        }
      });

      if (!cascadeResponse.ok) {
        throw new Error('Failed to fetch cascade data');
      }

      const cascadeResult = await cascadeResponse.json();
      if (!cascadeResult.success) {
        throw new Error('Invalid cascade data response');
      }

      setData(cascadeResult.data);
      setStats(cascadeResult.stats);
    } catch (err) {
      console.error('Error fetching cascade data:', err);
      setError('Unable to load planning data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCascadeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading planning cascade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Planning Cascade View</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/planner/long-range')}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Long Range Plans
            </Button>
            <Button 
              onClick={() => navigate('/planner/units')}
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Unit Plans
            </Button>
            <Button 
              onClick={() => navigate('/planner/week')}
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Week View
            </Button>
            <Button onClick={fetchCascadeData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Long Range Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLRPs || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unit Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUnits || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lesson Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLessons || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subjects?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {data && data.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <PlanningCascadeView initialData={data} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No planning data available.</p>
            <Button 
              onClick={() => navigate('/planner/long-range')}
              className="mt-4"
            >
              Create Your First Long Range Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanningCascadePage;