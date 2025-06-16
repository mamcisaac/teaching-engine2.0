import React, { useState } from 'react';
import { useParentMessages, useDeleteParentMessage } from '../api';
import { ParentMessage } from '../types';
import { ParentMessageEditor } from '../components/ParentMessageEditor';
import { ParentMessagePreview } from '../components/ParentMessagePreview';
import Dialog from '../components/Dialog';

export default function ParentMessagesPage() {
  const { data: messages = [], isLoading, refetch } = useParentMessages();
  const deleteMessageMutation = useDeleteParentMessage();

  const [selectedMessage, setSelectedMessage] = useState<ParentMessage | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ParentMessage | null>(null);

  const handleCreateNew = () => {
    setEditingMessage(null);
    setShowEditor(true);
  };

  const handleEdit = (message: ParentMessage) => {
    setEditingMessage(message);
    setShowEditor(true);
  };

  const handleView = (message: ParentMessage) => {
    setSelectedMessage(message);
    setShowPreview(true);
  };

  const handleDelete = async (message: ParentMessage) => {
    if (!confirm(`Are you sure you want to delete "${message.title}"?`)) {
      return;
    }

    try {
      await deleteMessageMutation.mutateAsync(message.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingMessage(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading newsletters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Communications</h1>
          <p className="text-gray-600 mt-2">
            Create and manage newsletters and messages for parents
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          📰 Create Newsletter
        </button>
      </div>

      {/* Messages Grid */}
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No newsletters yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first parent newsletter to share classroom updates
          </p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Newsletter
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onView={() => handleView(message)}
              onEdit={() => handleEdit(message)}
              onDelete={() => handleDelete(message)}
            />
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog
        open={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingMessage(null);
        }}
        title={editingMessage ? 'Edit Newsletter' : 'Create Newsletter'}
        maxWidth="4xl"
      >
        <ParentMessageEditor
          message={editingMessage || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingMessage(null);
          }}
        />
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedMessage(null);
        }}
        title="Newsletter Preview"
        maxWidth="4xl"
      >
        {selectedMessage && (
          <ParentMessagePreview
            message={selectedMessage}
            onEdit={() => {
              setShowPreview(false);
              handleEdit(selectedMessage);
            }}
            onDelete={() => {
              setShowPreview(false);
              handleDelete(selectedMessage);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

interface MessageCardProps {
  message: ParentMessage;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function MessageCard({ message, onView, onEdit, onDelete }: MessageCardProps) {
  return (
    <div className="bg-white rounded-lg border shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{message.title}</h3>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={onView}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="View"
            >
              👁️
            </button>
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">📅 {message.timeframe}</p>

        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">French Preview:</div>
          <p className="text-sm text-gray-700 line-clamp-3">{stripHTML(message.contentFr)}</p>
        </div>

        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">English Preview:</div>
          <p className="text-sm text-gray-700 line-clamp-3">{stripHTML(message.contentEn)}</p>
        </div>

        {/* Linked Content Summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {message.linkedOutcomes && message.linkedOutcomes.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              🎯 {message.linkedOutcomes.length} outcomes
            </span>
          )}
          {message.linkedActivities && message.linkedActivities.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              🏃‍♀️ {message.linkedActivities.length} activities
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Created: {new Date(message.createdAt).toLocaleDateString()}</span>
          <button onClick={onView} className="text-blue-600 hover:text-blue-800 font-medium">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to strip HTML for preview
function stripHTML(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
