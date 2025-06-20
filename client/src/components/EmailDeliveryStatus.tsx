import React from 'react';
import { useParentMessageDeliveries } from '../api';

interface Props {
  parentMessageId: number;
}

export function EmailDeliveryStatus({ parentMessageId }: Props) {
  const { data, isLoading, error } = useParentMessageDeliveries(parentMessageId);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { stats, deliveries } = data;
  const hasDeliveries = stats.total > 0;

  if (!hasDeliveries) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        <p className="text-sm">This newsletter hasn't been sent yet</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'bounced':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return '✓';
      case 'failed':
      case 'bounced':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-3">📧 Delivery Status</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <DeliveryStatCard
          label="Total"
          value={stats.total}
          color="bg-blue-100 text-blue-700"
        />
        <DeliveryStatCard
          label="Sent"
          value={stats.sent}
          color="bg-green-100 text-green-700"
        />
        <DeliveryStatCard
          label="Failed"
          value={stats.failed}
          color="bg-red-100 text-red-700"
        />
        <DeliveryStatCard
          label="Pending"
          value={stats.pending}
          color="bg-yellow-100 text-yellow-700"
        />
      </div>

      {/* Success Rate */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Success Rate</span>
            <span>{Math.round((stats.sent / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.sent / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Failed Deliveries */}
      {stats.failed > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Failed Deliveries</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {deliveries
              .filter(d => d.status === 'failed' || d.status === 'bounced')
              .map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-2 bg-red-50 rounded text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">{getStatusIcon(delivery.status)}</span>
                    <span className="font-medium">{delivery.recipientName}</span>
                    <span className="text-gray-500">({delivery.recipientEmail})</span>
                  </div>
                  {delivery.failureReason && (
                    <span className="text-xs text-red-600">{delivery.failureReason}</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      {deliveries.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View All Deliveries ({deliveries.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-2 bg-white rounded border text-sm"
              >
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {getStatusIcon(delivery.status)} {delivery.status}
                  </span>
                  <span>{delivery.recipientName}</span>
                  <span className="text-gray-500 text-xs">{delivery.recipientEmail}</span>
                </div>
                {delivery.sentAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(delivery.sentAt).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

interface DeliveryStatCardProps {
  label: string;
  value: number;
  color: string;
}

function DeliveryStatCard({ label, value, color }: DeliveryStatCardProps) {
  return (
    <div className={`p-3 rounded-lg ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}