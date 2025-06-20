import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

interface QualityMetrics {
  outcomesCoverage: number;
  assessmentBalance: number;
  engagementVariety: number;
  differentiationScore: number;
  timeEfficiency: number;
  domainBalance: number;
  themeConsistency: number;
  vocabularyIntegration: number;
  overallScore: number;
}

interface DiagnosticDetails {
  metrics: QualityMetrics;
  suggestions: string[];
  warnings: string[];
  strengths: string[];
  missingDomains: string[];
  overusedDomains: string[];
  uncoveredOutcomes: string[];
}

interface QualityScorecardProps {
  weekStart: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export function QualityScorecard({ weekStart, onSuggestionClick }: QualityScorecardProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticDetails | null>(null);
  const [trend, setTrend] = useState<{ week: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchDiagnostics();
    fetchTrend();
  }, [weekStart]);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/planning/quality-score', {
        params: { weekStart },
      });
      setDiagnostics(response.data);
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
      setError('Failed to load planning diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async () => {
    try {
      const response = await api.get('/api/planning/quality-trend', {
        params: { weeks: 8 },
      });
      setTrend(response.data);
    } catch (err) {
      console.error('Error fetching trend:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse" data-testid="loading-spinner">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !diagnostics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-red-600">
          {error || 'Failed to load planning diagnostics'}
        </div>
      </div>
    );
  }

  const { metrics } = diagnostics;

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Prepare radar chart data
  const radarData = {
    labels: [
      'Outcomes',
      'Assessment',
      'Engagement',
      'Differentiation',
      'Time Use',
      'Domain Balance',
      'Themes',
      'Vocabulary',
    ],
    datasets: [
      {
        label: 'Current Week',
        data: [
          metrics.outcomesCoverage,
          metrics.assessmentBalance,
          metrics.engagementVariety,
          metrics.differentiationScore,
          metrics.timeEfficiency,
          metrics.domainBalance,
          metrics.themeConsistency,
          metrics.vocabularyIntegration,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Prepare trend line chart data
  const trendData = {
    labels: trend.map(t => new Date(t.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Quality Score',
        data: trend.map(t => t.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Planning Quality Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header with Overall Score */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Weekly Planning Quality
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Diagnostic analysis of your weekly plan
          </p>
        </div>
        <div className={`text-center px-4 py-2 rounded-lg ${getScoreBgColor(metrics.overallScore)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
            {Math.round(metrics.overallScore)}%
          </div>
          <div className="text-xs text-gray-600">Overall Score</div>
        </div>
      </div>

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
      >
        {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Detailed Analysis
      </button>

      {/* Detailed Metrics */}
      {showDetails && (
        <>
          {/* Radar Chart */}
          <div className="h-64">
            <Radar data={radarData} options={radarOptions} />
          </div>

          {/* Individual Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Outcome Coverage', value: metrics.outcomesCoverage, icon: '🎯' },
              { label: 'Assessment Balance', value: metrics.assessmentBalance, icon: '📝' },
              { label: 'Engagement Variety', value: metrics.engagementVariety, icon: '🎨' },
              { label: 'Differentiation', value: metrics.differentiationScore, icon: '🧩' },
              { label: 'Time Efficiency', value: metrics.timeEfficiency, icon: '⏰' },
              { label: 'Domain Balance', value: metrics.domainBalance, icon: '⚖️' },
              { label: 'Theme Consistency', value: metrics.themeConsistency, icon: '🎭' },
              { label: 'Vocabulary Focus', value: metrics.vocabularyIntegration, icon: '📚' },
            ].map((metric) => (
              <div
                key={metric.label}
                className={`p-3 rounded-lg border ${getScoreBgColor(metric.value)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                  {Math.round(metric.value)}%
                </div>
              </div>
            ))}
          </div>

          {/* Trend Chart */}
          {trend.length > 0 && (
            <div className="h-48">
              <Line data={trendData} options={trendOptions} />
            </div>
          )}
        </>
      )}

      {/* Feedback Sections */}
      <div className="space-y-4">
        {/* Strengths */}
        {diagnostics.strengths.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <span>✅</span> Strengths
            </h4>
            <ul className="space-y-1">
              {diagnostics.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-green-700">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {diagnostics.warnings.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <span>⚠️</span> Warnings
            </h4>
            <ul className="space-y-1">
              {diagnostics.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {diagnostics.suggestions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span>💡</span> Suggestions
            </h4>
            <ul className="space-y-1">
              {diagnostics.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-blue-700">
                  • {suggestion}
                  {onSuggestionClick && (
                    <button
                      onClick={() => onSuggestionClick(suggestion)}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Take action
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing/Overused Domains */}
        {(diagnostics.missingDomains.length > 0 || diagnostics.overusedDomains.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Domain Analysis</h4>
            {diagnostics.missingDomains.length > 0 && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Missing:</span> {diagnostics.missingDomains.join(', ')}
              </p>
            )}
            {diagnostics.overusedDomains.length > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Overused:</span> {diagnostics.overusedDomains.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Uncovered Outcomes */}
        {diagnostics.uncoveredOutcomes.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">Uncovered Outcomes</h4>
            <p className="text-sm text-purple-700">
              {diagnostics.uncoveredOutcomes.join(', ')}
              {diagnostics.uncoveredOutcomes.length > 5 && ' (and more...)'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}