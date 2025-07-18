import React from 'react';
import { Server, Database, MessageSquare, Globe, Shield } from 'lucide-react';

interface Microservice {
  name: string;
  description: string;
  port: number;
  icon: React.ReactNode;
  features: string[];
  dependencies: string[];
}

const SystemOverview: React.FC = () => {
  const microservices: Microservice[] = [
    {
      name: 'API Gateway',
      description: 'Centralized routing and authentication for all services',
      port: 8080,
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      features: ['JWT Authentication', 'Request Routing', 'Load Balancing'],
      dependencies: ['User Service', 'Book Service', 'Order Service']
    },
    {
      name: 'User Service',
      description: 'Handles user authentication and profile management',
      port: 8002,
      icon: <Shield className="h-6 w-6 text-green-600" />,
      features: ['JWT Token Generation', 'User Authentication', 'Profile Management'],
      dependencies: ['PostgreSQL']
    },
    {
      name: 'Book Service',
      description: 'Manages book catalog and inventory',
      port: 8000,
      icon: <Database className="h-6 w-6 text-purple-600" />,
      features: ['CRUD Operations', 'Book Catalog', 'Inventory Management'],
      dependencies: ['PostgreSQL']
    },
    {
      name: 'Order Service',
      description: 'Processes book orders and manages transactions',
      port: 8001,
      icon: <MessageSquare className="h-6 w-6 text-orange-600" />,
      features: ['Order Processing', 'Book Validation', 'Event Publishing'],
      dependencies: ['Book Service', 'RabbitMQ']
    },
    {
      name: 'Notification Service',
      description: 'Handles real-time notifications via message queue',
      port: 15672,
      icon: <Server className="h-6 w-6 text-red-600" />,
      features: ['Event Consumption', 'Real-time Notifications', 'Message Processing'],
      dependencies: ['RabbitMQ']
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Server className="h-6 w-6 text-primary-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">System Architecture</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {microservices.map((service) => (
          <div key={service.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              {service.icon}
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                <p className="text-xs text-gray-500">Port {service.port}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
            
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-700 mb-1">Features:</h5>
              <div className="flex flex-wrap gap-1">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-1">Dependencies:</h5>
              <div className="flex flex-wrap gap-1">
                {service.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Infrastructure</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-medium">Database:</span> PostgreSQL
          </div>
          <div>
            <span className="font-medium">Message Queue:</span> RabbitMQ
          </div>
          <div>
            <span className="font-medium">Authentication:</span> JWT
          </div>
          <div>
            <span className="font-medium">Containerization:</span> Docker
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview; 