import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, Settings } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Bookstore</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationPanel />
            <Link
              to="/settings"
              className={`p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md ${
                location.pathname === '/settings' ? 'text-primary-600' : ''
              }`}
            >
              <Settings className="h-6 w-6" />
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 