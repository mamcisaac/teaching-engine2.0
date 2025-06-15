import { useState } from 'react';
import HolidaySettings from '../components/settings/HolidaySettings';
import SubstituteInfoForm from '../components/settings/SubstituteInfoForm';
import BackupButton from '../components/settings/BackupButton';
import OralRoutineTemplateManager from '../components/OralRoutineTemplateManager';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'oral-routines', label: 'Oral Routines' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <HolidaySettings />
          <SubstituteInfoForm />
          <BackupButton />
        </div>
      )}

      {activeTab === 'oral-routines' && (
        <div className="space-y-6">
          <OralRoutineTemplateManager />
        </div>
      )}
    </div>
  );
}
