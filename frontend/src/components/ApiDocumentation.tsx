import React, { useState } from 'react';
import { Code, Database, Users, Package, Bell } from 'lucide-react';

interface ApiEndpoint {
  service: string;
  method: string;
  path: string;
  description: string;
  auth: boolean;
}

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const endpoints: ApiEndpoint[] = [
    // User Service
    {
      service: 'User Service',
      method: 'POST',
      path: '/login',
      description: 'Authenticate user and get JWT token',
      auth: false
    },
    {
      service: 'User Service',
      method: 'GET',
      path: '/profile',
      description: 'Get current user profile information',
      auth: true
    },
    {
      service: 'User Service',
      method: 'PUT',
      path: '/profile',
      description: 'Update current user profile',
      auth: true
    },
    {
      service: 'User Service',
      method: 'GET',
      path: '/users',
      description: 'Get all users (admin only)',
      auth: true
    },
    
    // Book Service
    {
      service: 'Book Service',
      method: 'GET',
      path: '/books',
      description: 'Get all books',
      auth: true
    },
    {
      service: 'Book Service',
      method: 'POST',
      path: '/books',
      description: 'Create a new book',
      auth: true
    },
    {
      service: 'Book Service',
      method: 'GET',
      path: '/books/:id',
      description: 'Get book by ID',
      auth: true
    },
    {
      service: 'Book Service',
      method: 'DELETE',
      path: '/books/:id',
      description: 'Delete book by ID',
      auth: true
    },
    {
      service: 'Book Service',
      method: 'GET',
      path: '/books/stats',
      description: 'Get book statistics and analytics',
      auth: true
    },
    
    // Order Service
    {
      service: 'Order Service',
      method: 'POST',
      path: '/order',
      description: 'Place a new order',
      auth: true
    },
    {
      service: 'Order Service',
      method: 'GET',
      path: '/orders',
      description: 'Get current user\'s order history',
      auth: true
    },
    {
      service: 'Order Service',
      method: 'GET',
      path: '/orders/all',
      description: 'Get all orders (admin only)',
      auth: true
    },
    
    // Notification Service (via RabbitMQ)
    {
      service: 'Notification Service',
      method: 'EVENT',
      path: 'order_events',
      description: 'Receive order notifications via RabbitMQ',
      auth: false
    },

    // API Gateway
    {
      service: 'API Gateway',
      method: 'GET',
      path: '/health',
      description: 'Check API Gateway health status',
      auth: false
    }
  ];

  const filteredEndpoints = activeTab === 'all' 
    ? endpoints 
    : endpoints.filter(ep => ep.service.toLowerCase().includes(activeTab.toLowerCase()));

  const services = ['all', 'user', 'book', 'order', 'notification'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Code className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">API Documentation</h3>
      </div>
      
      {/* Service Tabs */}
      <div className="flex space-x-1 mb-4">
        {services.map((service) => (
          <button
            key={service}
            onClick={() => setActiveTab(service)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              activeTab === service
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {service.charAt(0).toUpperCase() + service.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="space-y-3">
        {filteredEndpoints.map((endpoint, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {endpoint.path}
                </code>
              </div>
              <div className="flex items-center space-x-2">
                {endpoint.auth && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                    Auth Required
                  </span>
                )}
                <span className="text-xs text-gray-500">{endpoint.service}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{endpoint.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Authentication</h4>
        <p className="text-xs text-gray-600 mb-2">
          Protected endpoints require a JWT token in the Authorization header:
        </p>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
          Authorization: Bearer &lt;your-jwt-token&gt;
        </code>
      </div>
    </div>
  );
};

export default ApiDocumentation; 