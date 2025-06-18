import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { 
  Moon, 
  Sun, 
  Globe, 
  Monitor, 
  Save, 
  RotateCcw, 
  Palette,
  Bell,
  Shield,
  Database,
  Printer,
  Receipt,
  DollarSign
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Appearance Settings
    theme: 'light', // light, dark, system
    language: 'id', // id, en
    primary_color: '#3B82F6', // blue
    
    // System Settings
    currency: 'IDR',
    tax_rate: 11,
    timezone: 'Asia/Jakarta',
    date_format: 'DD/MM/YYYY',
    time_format: '24',
    
    // Business Settings
    store_name: '',
    store_address: '',
    store_phone: '',
    store_email: '',
    
    // Notification Settings
    low_stock_alert: true,
    daily_report_email: false,
    backup_reminder: true,
    
    // Receipt Settings
    receipt_header: '',
    receipt_footer: 'Terima kasih atas kunjungan Anda',
    print_logo: false,
    auto_print: true,
    
    // Security Settings
    session_timeout: 30, // minutes
    require_password_change: false,
    enable_audit_log: true
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('owner');

  // Check if current user has permission to change settings
  const hasSettingsPermission = currentUserRole === 'owner' || currentUserRole === 'supervisor';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      // Convert array of settings to object
      const settingsObj = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      
      setSettings(prev => ({ ...prev, ...settingsObj }));
      setOriginalSettings({ ...settings, ...settingsObj });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (key, value) => {
    if (!hasSettingsPermission) {
      alert('You do not have permission to change settings.');
      return;
    }
    
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!hasSettingsPermission) {
      alert('You do not have permission to save settings.');
      return;
    }

    setSaving(true);
    try {
      // Convert settings object to array format for API
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value.toString(),
        data_type: typeof value === 'boolean' ? 'boolean' : 
                  typeof value === 'number' ? 'number' : 'string'
      }));

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsArray })
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      setOriginalSettings({ ...settings });
      
      // Apply theme immediately
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!hasSettingsPermission) {
      alert('You do not have permission to reset settings.');
      return;
    }
    
    setSettings({ ...originalSettings });
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const themes = [
    { value: 'light', name: 'Light', icon: Sun },
    { value: 'dark', name: 'Dark', icon: Moon },
    { value: 'system', name: 'System', icon: Monitor }
  ];

  const currencies = [
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];

  const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingField = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <Header title="Settings">
        <div className="flex space-x-2">
          {hasChanges && (
            <button 
              onClick={handleReset}
              disabled={!hasSettingsPermission}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!hasChanges || saving || !hasSettingsPermission}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" /> 
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Header>

      <div className="px-6 max-w-4xl">
        {/* Appearance Settings */}
        <SettingsSection title="Appearance" icon={Palette}>
          <SettingField 
            label="Theme" 
            description="Choose your preferred theme"
          >
            <div className="flex space-x-2">
              {themes.map(theme => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.value}
                    onClick={() => handleChange('theme', theme.value)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium border ${
                      settings.theme === theme.value
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={!hasSettingsPermission}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {theme.name}
                  </button>
                );
              })}
            </div>
          </SettingField>

          <SettingField 
            label="Language" 
            description="Select your preferred language"
          >
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              disabled={!hasSettingsPermission}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </SettingField>

          <SettingField 
            label="Primary Color" 
            description="Choose your brand color"
          >
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              disabled={!hasSettingsPermission}
              className="w-12 h-8 rounded border border-gray-300"
            />
          </SettingField>
        </SettingsSection>

        {/* System Settings */}
        <SettingsSection title="System" icon={Database}>
          <SettingField 
            label="Currency" 
            description="Default currency for transactions"
          >
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              disabled={!hasSettingsPermission}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name}
                </option>
              ))}
            </select>
          </SettingField>

          <SettingField 
            label="Tax Rate (%)" 
            description="Default tax rate for products"
          >
            <input
              type="number"
              value={settings.tax_rate}
              onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
              disabled={!hasSettingsPermission}
              min="0"
              max="100"
              step="0.01"
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField 
            label="Date Format" 
            description="How dates are displayed"
          >
            <select
              value={settings.date_format}
              onChange={(e) => handleChange('date_format', e.target.value)}
              disabled={!hasSettingsPermission}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </SettingField>

          <SettingField 
            label="Time Format" 
            description="12 or 24 hour format"
          >
            <select
              value={settings.time_format}
              onChange={(e) => handleChange('time_format', e.target.value)}
              disabled={!hasSettingsPermission}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="12">12 Hour (AM/PM)</option>
              <option value="24">24 Hour</option>
            </select>
          </SettingField>
        </SettingsSection>

        {/* Business Settings */}
        <SettingsSection title="Business Information" icon={DollarSign}>
          <SettingField label="Store Name">
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => handleChange('store_name', e.target.value)}
              disabled={!hasSettingsPermission}
              placeholder="Enter store name"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField label="Store Address">
            <textarea
              value={settings.store_address}
              onChange={(e) => handleChange('store_address', e.target.value)}
              disabled={!hasSettingsPermission}
              placeholder="Enter store address"
              rows="2"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField label="Store Phone">
            <input
              type="tel"
              value={settings.store_phone}
              onChange={(e) => handleChange('store_phone', e.target.value)}
              disabled={!hasSettingsPermission}
              placeholder="Enter phone number"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField label="Store Email">
            <input
              type="email"
              value={settings.store_email}
              onChange={(e) => handleChange('store_email', e.target.value)}
              disabled={!hasSettingsPermission}
              placeholder="Enter email address"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title="Notifications" icon={Bell}>
          <SettingField 
            label="Low Stock Alert" 
            description="Notify when products are running low"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.low_stock_alert}
                onChange={(e) => handleChange('low_stock_alert', e.target.checked)}
                disabled={!hasSettingsPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingField>

          <SettingField 
            label="Daily Report Email" 
            description="Send daily sales report via email"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.daily_report_email}
                onChange={(e) => handleChange('daily_report_email', e.target.checked)}
                disabled={!hasSettingsPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingField>

          <SettingField 
            label="Backup Reminder" 
            description="Remind to backup data regularly"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backup_reminder}
                onChange={(e) => handleChange('backup_reminder', e.target.checked)}
                disabled={!hasSettingsPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingField>
        </SettingsSection>

        {/* Receipt Settings */}
        <SettingsSection title="Receipt & Printing" icon={Receipt}>
          <SettingField label="Receipt Header">
            <textarea
              value={settings.receipt_header}
              onChange={(e) => handleChange('receipt_header', e.target.value)}
              disabled={!hasSettingsPermission}
              placeholder="Custom header text for receipts"
              rows="2"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField label="Receipt Footer">
            <textarea
              value={settings.receipt_footer}
              onChange={(e) => handleChange('receipt_footer', e.target.value)}
              disabled={!hasSettingsPermission}
              placeholder="Custom footer text for receipts"
              rows="2"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField 
            label="Auto Print Receipt" 
            description="Automatically print receipt after sale"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_print}
                onChange={(e) => handleChange('auto_print', e.target.checked)}
                disabled={!hasSettingsPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingField>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection title="Security" icon={Shield}>
          <SettingField 
            label="Session Timeout (minutes)" 
            description="Auto logout after inactivity"
          >
            <input
              type="number"
              value={settings.session_timeout}
              onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
              disabled={!hasSettingsPermission}
              min="5"
              max="480"
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </SettingField>

          <SettingField 
            label="Enable Audit Log" 
            description="Track all system changes"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_audit_log}
                onChange={(e) => handleChange('enable_audit_log', e.target.checked)}
                disabled={!hasSettingsPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingField>
        </SettingsSection>

        {!hasSettingsPermission && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-700">
                You do not have permission to modify settings. Only owners and supervisors can change system settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;