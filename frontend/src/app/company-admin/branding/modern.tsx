'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Palette, Save, RotateCcw } from 'lucide-react';

interface BrandingData {
  brand_color: string;
  brand_secondary_color: string;
  background_image_url: string;
  website: string;
  phone: string;
  email: string;
  social_media: Record<string, string>;
  card_template: string;
  custom_css: string;
}

export default function BrandingPage() {
  const router = useRouter();
  const [branding, setBranding] = useState<BrandingData>({
    brand_color: '#0066CC',
    brand_secondary_color: '#FFFFFF',
    background_image_url: '',
    website: '',
    phone: '',
    email: '',
    social_media: {},
    card_template: 'default',
    custom_css: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await axios.get('/api/proxy?path=/company/branding', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setBranding(response.data);
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };

    fetchBranding();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBranding({ ...branding, [name]: value });
  };

  const handleSocialMediaChange = (platform: string, url: string) => {
    setBranding({
      ...branding,
      social_media: { ...branding.social_media, [platform]: url },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/proxy?path=/company/branding', branding, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setMessage('✅ Branding updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error saving branding');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Palette className="text-purple-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Branding</h1>
              <p className="text-gray-600">Customize your company's look and feel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Colors Section */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Colors</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      name="brand_color"
                      value={branding.brand_color}
                      onChange={handleChange}
                      className="w-20 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      name="brand_color"
                      value={branding.brand_color}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      name="brand_secondary_color"
                      value={branding.brand_secondary_color}
                      onChange={handleChange}
                      className="w-20 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      name="brand_secondary_color"
                      value={branding.brand_secondary_color}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Template */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Card Template</h2>
              
              <select
                name="card_template"
                value={branding.card_template}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="default">Default</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="vibrant">Vibrant</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={branding.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={branding.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="url"
                  name="website"
                  placeholder="Website"
                  value={branding.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Social Media</h2>
              
              <div className="space-y-3">
                {['linkedin', 'twitter', 'facebook', 'instagram'].map((platform) => (
                  <input
                    key={platform}
                    type="url"
                    placeholder={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    value={branding.social_media[platform] || ''}
                    onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="bg-white rounded-2xl shadow-md p-8 sticky top-32">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Preview</h2>
              
              <div className="space-y-4">
                {/* Card Preview */}
                <div
                  className="rounded-2xl p-8 text-white shadow-lg aspect-video flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${branding.brand_color}, ${branding.brand_secondary_color})`,
                  }}
                >
                  <div>
                    <div className="text-3xl font-bold">Your Company</div>
                    <div className="text-lg opacity-90">Employee Name</div>
                  </div>
                  <div className="text-sm opacity-75">Preview of card template</div>
                </div>

                {/* Color Swatches */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Primary Color</p>
                    <div
                      className="h-16 rounded-lg shadow-md"
                      style={{ backgroundColor: branding.brand_color }}
                    ></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Secondary Color</p>
                    <div
                      className="h-16 rounded-lg shadow-md border border-gray-300"
                      style={{ backgroundColor: branding.brand_secondary_color }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={20} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
