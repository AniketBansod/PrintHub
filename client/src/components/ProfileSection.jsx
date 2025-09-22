import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ProfileSection = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      showSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      showError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-500 dark:text-red-400 py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Failed to load profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-center md:order-last">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900 dark:text-gray-100">{user.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900 dark:text-gray-100">{user.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Since</label>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg mr-4">
            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className={`w-full p-3 pr-10 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Enter your current password" />
              <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordErrors.currentPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <input type={showPasswords.new ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className={`w-full p-3 pr-10 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Enter your new password" />
              <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full p-3 pr-10 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Confirm your new password" />
              <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>}
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isChangingPassword}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 flex items-center justify-center ${
              isChangingPassword
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {isChangingPassword ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing Password...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Change Password
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSection;
