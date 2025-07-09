import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, Globe, Palette, Database, HelpCircle, Save } from 'lucide-react';
import { showToast } from '../utils/toast';

interface SettingsProps {
  onBack: () => void;
  user: any;
}

const Settings: React.FC<SettingsProps> = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: '',
      timezone: 'UTC',
      language: 'English'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      candidateUpdates: true,
      systemAlerts: false,
      weeklyReports: true
    },
    privacy: {
      profileVisibility: 'organization',
      dataSharing: false,
      analyticsTracking: true,
      cookiePreferences: 'essential'
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      sidebarCollapsed: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const handleSave = () => {
    showToast.success('Settings saved successfully!');
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.fullName}
                        onChange={(e) => updateSetting('profile', 'fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.profile.timezone}
                        onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="IST">India Standard Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'pushNotifications' && 'Receive push notifications in browser'}
                            {key === 'candidateUpdates' && 'Get notified about candidate status changes'}
                            {key === 'systemAlerts' && 'Receive system maintenance and update alerts'}
                            {key === 'weeklyReports' && 'Get weekly summary reports'}
                          </p>
                        </div>
                        <button
                          onClick={() => updateSetting('notifications', key, !value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="public">Public</option>
                        <option value="organization">Organization Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Data Sharing</h3>
                        <p className="text-sm text-gray-500">Allow sharing of anonymized data for analytics</p>
                      </div>
                      <button
                        onClick={() => updateSetting('privacy', 'dataSharing', !settings.privacy.dataSharing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => updateSetting('appearance', 'theme', theme)}
                            className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                              settings.appearance.theme === theme
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Compact Mode</h3>
                        <p className="text-sm text-gray-500">Use smaller spacing and elements</p>
                      </div>
                      <button
                        onClick={() => updateSetting('appearance', 'compactMode', !settings.appearance.compactMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.appearance.compactMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Storage */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Data & Storage</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Storage Usage</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Candidates Data</span>
                          <span>2.4 GB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Documents</span>
                          <span>1.2 GB</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total Used</span>
                          <span>3.6 GB / 10 GB</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => showToast.info('Export data feature coming soon')}
                        className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
                        <p className="text-sm text-gray-500">Download a copy of your data</p>
                      </button>
                      
                      <button 
                        onClick={() => showToast.error('Account deletion requires admin approval')}
                        className="w-full text-left px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Help & Support */}
              {activeTab === 'help' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Help & Support</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => showToast.info('Documentation coming soon')}
                        className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Documentation</h3>
                        <p className="text-sm text-gray-500">Browse our comprehensive guides</p>
                      </button>
                      
                      <button 
                        onClick={() => showToast.info('Support team will contact you soon')}
                        className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Contact Support</h3>
                        <p className="text-sm text-gray-500">Get help from our support team</p>
                      </button>
                      
                      <button 
                        onClick={() => showToast.info('Feature request submitted')}
                        className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Feature Requests</h3>
                        <p className="text-sm text-gray-500">Suggest new features</p>
                      </button>
                      
                      <button 
                        onClick={() => showToast.info('Bug report submitted')}
                        className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Report Bug</h3>
                        <p className="text-sm text-gray-500">Report issues or bugs</p>
                      </button>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">System Information</h3>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>Version: 2.1.0</p>
                        <p>Last Updated: January 15, 2025</p>
                        <p>Browser: Chrome 120.0.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;