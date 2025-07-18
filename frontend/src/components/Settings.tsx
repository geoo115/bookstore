import React, { useState } from 'react';
import ApiDocumentation from './ApiDocumentation';
import SystemOverview from './SystemOverview';
import UserProfile from './UserProfile';
import UserManagement from './UserManagement';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'User Profile' },
    { id: 'users', name: 'User Management' },
    { id: 'api', name: 'API Documentation' },
    { id: 'system', name: 'System Overview' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings & Documentation</h1>
            <p className="text-gray-600 mt-2">Manage your profile and explore the system</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div>
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'api' && <ApiDocumentation />}
            {activeTab === 'system' && <SystemOverview />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 