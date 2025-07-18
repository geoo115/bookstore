import React from 'react';
import Navigation from './Navigation';
import BookList from './BookList';
import ServiceStatus from './ServiceStatus';
import OrderHistory from './OrderHistory';
import Analytics from './Analytics';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Analytics Section */}
          <div className="mb-8">
            <Analytics />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookList />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <ServiceStatus />
              <OrderHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 