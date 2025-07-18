import React, { useState, useEffect } from 'react';
import { User, Settings, Save } from 'lucide-react';
import { apiService, User as UserType, UserProfileUpdate } from '../services/api';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfileUpdate>({ email: '', full_name: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await apiService.getUserProfile();
      setUser(userData);
      setEditForm({ email: userData.email, full_name: userData.full_name });
    } catch (error: any) {
      toast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await apiService.updateUserProfile(editForm);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({ email: user.email, full_name: user.full_name });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load user profile</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <User className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
          >
            <Settings className="h-4 w-4 mr-1" />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.username}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {isEditing ? (
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Member Since</label>
          <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        {isEditing && (
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
