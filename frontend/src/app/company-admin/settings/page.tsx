'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface CompanySettings {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  brand_color?: string;
  slug: string;
  created_at: string;
}

export default function CompanySettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    brand_color: '#3B82F6',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const presetColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('company_id');

    if (!token || !companyId) {
      router.push('/auth/login');
      return;
    }

    fetchSettings(token, companyId);
  }, []);

  const fetchSettings = async (token: string, companyId: string) => {
    try {
      const response = await axios.get(
        `/api/proxy?path=/company/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      setSettings(data);
      setFormData({
        name: data.name || '',
        domain: data.domain || '',
        logo_url: data.logo_url || '',
        brand_color: data.brand_color || '#3B82F6',
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load company settings');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage('');
    setError('');
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      brand_color: color,
    }));
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('company_id');

    if (!token || !companyId) {
      setError('Session expired');
      return;
    }

    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.put(
        `/api/proxy?path=/company/${companyId}`,
        {
          name: formData.name,
          domain: formData.domain || null,
          logo_url: formData.logo_url || null,
          brand_color: formData.brand_color,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSettings(response.data);
      setMessage('✅ Company settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    setMessage('');

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        `/api/proxy?path=/auth/change-password`,
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚙️ Company Settings</h1>
          <p className="text-gray-600">Manage your company information and branding</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Company Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Domain */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Domain (optional)
                </label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use generated domain</p>
              </div>

              {/* Logo URL */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo URL (optional)
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.logo_url && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                    <img
                      src={formData.logo_url}
                      alt="Company logo preview"
                      className="h-12 w-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-sm text-gray-600">Logo preview</span>
                  </div>
                )}
              </div>

              {/* Brand Color */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Brand Color
                </label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-12 h-12 rounded-lg transition-all duration-200 border-2 ${
                        formData.brand_color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    ></button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: formData.brand_color }}
                  ></div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.brand_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          brand_color: e.target.value,
                        }))
                      }
                      placeholder="#3B82F6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? 'Saving...' : '💾 Save Settings'}
              </button>

              {/* Change Password Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔐 Security</h3>
                
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    🔑 Change Password
                  </button>
                ) : (
                  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        placeholder="Enter new password (min 6 characters)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
                      >
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            current_password: '',
                            new_password: '',
                            confirm_password: '',
                          });
                        }}
                        className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Preview</h2>

              {/* Card Preview */}
              <div
                className="rounded-xl p-6 text-white mb-6 transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${formData.brand_color}, ${formData.brand_color}cc)`,
                }}
              >
                <div className="space-y-3">
                  {formData.logo_url && (
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-xl font-bold">{formData.name || 'Company Name'}</h3>
                  <p className="text-sm opacity-90">Digital Business Card</p>
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Company Slug</p>
                  <p className="text-sm font-mono text-gray-700">{settings?.slug || 'N/A'}</p>
                </div>
                {formData.domain && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Domain</p>
                    <p className="text-sm font-mono text-gray-700">{formData.domain}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Created</p>
                  <p className="text-sm text-gray-700">
                    {settings?.created_at
                      ? new Date(settings.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
