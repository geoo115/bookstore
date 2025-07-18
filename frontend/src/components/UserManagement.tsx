import React, { useState, useEffect } from 'react';
import { Users, Shield, User as UserIcon, Mail, Calendar } from 'lucide-react';
import { apiService, User } from '../services/api';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await apiService.getUserProfile();
      setCurrentUser(userData);
    } catch (error: any) {
      toast.error('Failed to load current user');
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getAllUsers();
      setUsers(usersData);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Admin access required');
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
          <p className="text-gray-500">You need administrator privileges to view user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          {users.length} users
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.username} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || user.username}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {user.username}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
