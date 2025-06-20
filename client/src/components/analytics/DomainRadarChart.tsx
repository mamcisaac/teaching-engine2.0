/**
 * Domain Radar Chart Component
 *
 * Visualizes student progress across learning domains using a radar/spider chart,
 * enabling quick identification of strengths and areas for growth.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

interface DomainData {
  domain: string;
  currentLevel: number;
  targetLevel: number;
  trajectory: 'improving' | 'stable' | 'declining';
  outcomesCompleted: number;
  outcomesTotal: number;
  reflectionCount: number;
  vocabWords: number;
  lastUpdated: Date;
}

interface StudentDomainRadar {
  studentId: number;
  studentName: string;
  term: string;
  domains: Record<string, DomainData>;
  overallScore: number;
  strengths: string[];
  areasForGrowth: string[];
  comparisonTerm?: string;
  comparisonData?: Record<string, DomainData>;
}

interface DomainRadarChartProps {
  studentId: number;
  term?: string;
  compareTo?: string;
  teacherId?: number;
  className?: string;
  showComparison?: boolean;
  onDomainClick?: (domain: string) => void;
}

const DomainRadarChart: React.FC<DomainRadarChartProps> = ({
  studentId,
  term,
  compareTo,
  teacherId,
  className = '',
  showComparison = false,
  onDomainClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch radar data
  const {
    data: radarData,
    isLoading,
    error,
  } = useQuery<StudentDomainRadar>({
    queryKey: ['domain-strength', studentId, { term, compareTo, teacherId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (term) params.append('term', term);
      if (compareTo) params.append('compareTo', compareTo);
      if (teacherId) params.append('teacherId', teacherId.toString());

      const response = await api.get(
        `/api/analytics/domain-strength/${studentId}?${params.toString()}`,
      );
      return response.data;
    },
  });

  // Draw radar chart
  useEffect(() => {
    // Skip canvas rendering in test environment
    if (process.env.NODE_ENV === 'test' || import.meta.env?.MODE === 'test') {
      return;
    }

    if (!radarData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let ctx;
    try {
      ctx = canvas.getContext('2d');
    } catch (error) {
      // Canvas not available - skip rendering
      console.warn('Canvas not available:', error);
      return;
    }
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    const domains = Object.keys(radarData.domains);
    const angleStep = (2 * Math.PI) / domains.length;

    // Draw background grid
    drawRadarGrid(ctx, centerX, centerY, radius, domains, angleStep);

    // Draw current data
    drawRadarData(
      ctx,
      centerX,
      centerY,
      radius,
      domains,
      angleStep,
      radarData.domains,
      'rgba(59, 130, 246, 0.3)', // Blue
      'rgba(59, 130, 246, 1)',
    );

    // Draw comparison data if available
    if (showComparison && radarData.comparisonData) {
      drawRadarData(
        ctx,
        centerX,
        centerY,
        radius,
        domains,
        angleStep,
        radarData.comparisonData,
        'rgba(16, 185, 129, 0.2)', // Green
        'rgba(16, 185, 129, 1)',
      );
    }

    // Draw domain labels
    drawDomainLabels(ctx, centerX, centerY, radius, domains, angleStep);
  }, [radarData, showComparison]);

  const drawRadarGrid = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    domains: string[],
    angleStep: number,
  ) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Draw concentric circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw radial lines
    domains.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw scale labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    for (let i = 1; i <= 5; i++) {
      const value = (i * 20).toString();
      ctx.fillText(value, centerX + 10, centerY - (radius * i) / 5);
    }
  };

  const drawRadarData = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    domains: string[],
    angleStep: number,
    data: Record<string, DomainData>,
    fillColor: string,
    strokeColor: string,
  ) => {
    const points: { x: number; y: number }[] = [];

    // Calculate points
    domains.forEach((domain, index) => {
      const value = data[domain]?.currentLevel || 0;
      const normalizedValue = value / 100; // Convert to 0-1 range
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * normalizedValue;
      const y = centerY + Math.sin(angle) * radius * normalizedValue;
      points.push({ x, y });
    });

    // Draw filled area
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = strokeColor;
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawDomainLabels = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    domains: string[],
    angleStep: number,
  ) => {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Arial';

    domains.forEach((domain, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;

      // Adjust text alignment based on position
      if (x < centerX - 10) {
        ctx.textAlign = 'right';
      } else if (x > centerX + 10) {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = 'center';
      }

      ctx.fillText(domain, x, y + 5);
    });
  };

  const getTrajectoryIcon = (trajectory: 'improving' | 'stable' | 'declining') => {
    switch (trajectory) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrajectoryColor = (trajectory: 'improving' | 'stable' | 'declining') => {
    switch (trajectory) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error loading domain radar</p>
          <p className="text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!radarData) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-gray-500 text-center">
          <p>No domain data available for this student</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Domain Strength Radar - {radarData.studentName}
          </h3>
          <p className="text-sm text-gray-600">
            Overall Score: {radarData.overallScore}/100 | Term: {radarData.term}
          </p>
        </div>

        <div className="flex space-x-2">
          {showComparison && radarData.comparisonData && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>{radarData.comparisonTerm}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center mb-6">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border border-gray-200 rounded"
        />
      </div>

      {/* Domain Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(radarData.domains).map(([domain, data]) => (
          <div
            key={domain}
            className={`p-3 border rounded cursor-pointer transition-all ${
              selectedDomain === domain
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setSelectedDomain(selectedDomain === domain ? null : domain);
              onDomainClick?.(domain);
            }}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">{domain}</h4>
              <span className={`text-sm ${getTrajectoryColor(data.trajectory)}`}>
                {getTrajectoryIcon(data.trajectory)}
              </span>
            </div>
            <div className="mt-1">
              <div className="text-2xl font-bold text-blue-600">{data.currentLevel}</div>
              <div className="text-xs text-gray-600">
                {data.outcomesCompleted}/{data.outcomesTotal} outcomes
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Strengths and Areas for Growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {radarData.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Strengths</h4>
                <ul className="space-y-1">
                  {radarData.strengths.map((strength) => (
                    <li key={strength} className="text-sm text-gray-700">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {radarData.areasForGrowth.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">🎯 Areas for Growth</h4>
                <ul className="space-y-1">
                  {radarData.areasForGrowth.map((area) => (
                    <li key={area} className="text-sm text-gray-700">
                      • {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Selected Domain Details */}
          {selectedDomain && radarData.domains[selectedDomain] && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{selectedDomain} - Detailed View</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Level:</span>
                  <div className="font-semibold">
                    {radarData.domains[selectedDomain].currentLevel}/100
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Target Level:</span>
                  <div className="font-semibold">
                    {radarData.domains[selectedDomain].targetLevel}/100
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Reflections:</span>
                  <div className="font-semibold">
                    {radarData.domains[selectedDomain].reflectionCount}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Vocabulary:</span>
                  <div className="font-semibold">
                    {radarData.domains[selectedDomain].vocabWords} words
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Actions */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={() => {
            // Navigate to full student dashboard
            console.log('Navigate to student dashboard', studentId);
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          View Full Dashboard
        </button>
        <button
          onClick={() => {
            // Export radar chart
            console.log('Export radar chart', radarData);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export Chart
        </button>
      </div>
    </div>
  );
};

export default DomainRadarChart;
