'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface CardData {
  employee_id: string;
  employee_name: string;
  company_name: string;
  company_id: string;
  job_title?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  photo_url?: string;
  social_links?: Record<string, string>;
  qr_code?: string;
  vcard_url?: string;
  company_logo?: string;
  company_brand_color?: string;
}

export default function PublicCardPage({
  params,
}: {
  params: { company_slug: string; employee_slug: string };
}) {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        // Use Next.js API route instead of calling backend directly
        // This avoids CORS issues by proxying through server-side
        const response = await axios.get(
          `/api/card?company_slug=${params.company_slug}&employee_slug=${params.employee_slug}`
        );
        setCard(response.data);

        // Track analytics via proxy route
        await axios.post(
          `/api/proxy?path=/analytics/track?company_slug=${params.company_slug}&employee_slug=${params.employee_slug}`,
          { action: 'view', device: 'web' }
        ).catch(() => {});
      } catch (err: any) {
        console.error('Card fetch error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          company_slug: params.company_slug,
          employee_slug: params.employee_slug,
        });
        
        // Provide more detailed error message
        let errorMsg = 'Card not found';
        if (err.response?.status) {
          errorMsg += ` - ${err.response.status}`;
        } else if (err.message?.includes('CORS')) {
          errorMsg = 'CORS error - Backend may not be accepting requests';
        } else if (err.message?.includes('Network')) {
          errorMsg = 'Network error - Cannot reach backend';
        } else {
          errorMsg += ' - Connection Error';
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [params.company_slug, params.employee_slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <p className="text-red-400 text-xl">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-white text-xl">No card found</p>
      </div>
    );
  }

  const brandColor = card.company_brand_color || '#3b82f6';

  const getSocialIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      instagram: '📷',
      linkedin: '💼',
      facebook: '👍',
      youtube: '🎬',
      twitter: '🐦',
    };
    return icons[platform] || '🔗';
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${brandColor}30 0%, rgba(15,23,42,0.8) 100%), linear-gradient(to bottom right, #0f1729, #1e293b)`,
      }}
    >
      {/* Animated background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: brandColor, filter: 'blur(80px)' }}></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: brandColor, filter: 'blur(80px)' }}></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div
            className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${brandColor}15 0%, rgba(255,255,255,0.05) 100%)`,
            }}
          >
            {/* Top Accent Bar */}
            <div
              className="h-1 w-full"
              style={{ backgroundColor: brandColor }}
            ></div>

            <div className="p-8 sm:p-12">
              {/* Profile Section */}
              <div className="flex flex-col items-center mb-8">
                {/* Photo */}
                {card.photo_url ? (
                  <div className="relative mb-6">
                    <div
                      className="absolute inset-0 rounded-full blur-lg opacity-40"
                      style={{ backgroundColor: brandColor }}
                    ></div>
                    <img
                      src={card.photo_url}
                      alt={card.employee_name}
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
                    />
                  </div>
                ) : (
                  <div
                    className="relative mb-6 w-32 h-32 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg text-4xl"
                    style={{ backgroundColor: `${brandColor}40` }}
                  >
                    👤
                  </div>
                )}

                {/* Name & Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">
                  {card.employee_name}
                </h1>
                {card.job_title && (
                  <p
                    className="text-lg font-semibold text-center mb-1"
                    style={{ color: brandColor }}
                  >
                    {card.job_title}
                  </p>
                )}
                <p className="text-sm text-gray-300 text-center mb-4">
                  {card.company_name}
                </p>

                {/* Bio */}
                {card.bio && (
                  <p className="text-sm text-gray-200 text-center leading-relaxed max-w-xs">
                    {card.bio}
                  </p>
                )}
              </div>

              {/* Company Logo */}
              {card.company_logo && (
                <div className="flex justify-center mb-8">
                  <img
                    src={card.company_logo}
                    alt={card.company_name}
                    className="h-8 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

              {/* Contact Actions */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {card.email && (
                  <button
                    onClick={() => {
                      trackAction('email');
                      window.location.href = `mailto:${card.email}`;
                    }}
                    className="group relative overflow-hidden rounded-xl p-3 text-center font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                      boxShadow: `0 8px 32px ${brandColor}40`,
                    }}
                  >
                    <span className="relative z-10 flex flex-col items-center text-white text-xs sm:text-sm">
                      <span className="text-lg mb-1">📧</span>
                      Email
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>
                )}

                {card.phone && (
                  <button
                    onClick={() => {
                      trackAction('call');
                      window.location.href = `tel:${card.phone}`;
                    }}
                    className="group relative overflow-hidden rounded-xl p-3 text-center font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                      boxShadow: `0 8px 32px ${brandColor}40`,
                    }}
                  >
                    <span className="relative z-10 flex flex-col items-center text-white text-xs sm:text-sm">
                      <span className="text-lg mb-1">☎️</span>
                      Call
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>
                )}

                {card.whatsapp && (
                  <button
                    onClick={() => {
                      trackAction('whatsapp');
                      window.open(`https://wa.me/${card.whatsapp}`, '_blank');
                    }}
                    className="group relative overflow-hidden rounded-xl p-3 text-center font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, #25D366, #1a9d4d)`,
                      boxShadow: `0 8px 32px rgba(37, 211, 102, 0.4)`,
                    }}
                  >
                    <span className="relative z-10 flex flex-col items-center text-white text-xs sm:text-sm">
                      <span className="text-lg mb-1">💬</span>
                      WhatsApp
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>
                )}

                {card.vcard_url && (
                  <button
                    onClick={() => {
                      trackAction('download_vcard');
                      // Download vCard through proxy endpoint
                      const vcardUrl = `/api/vcard?company_slug=${params.company_slug}&employee_slug=${params.employee_slug}`;
                      const a = document.createElement('a');
                      a.href = vcardUrl;
                      a.download = `${card.employee_name}.vcf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="group relative overflow-hidden rounded-xl p-3 text-center font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, #8B5CF6, #6D28D9)`,
                      boxShadow: `0 8px 32px rgba(139, 92, 246, 0.4)`,
                    }}
                  >
                    <span className="relative z-10 flex flex-col items-center text-white text-xs sm:text-sm">
                      <span className="text-lg mb-1">💾</span>
                      Save
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>
                )}
              </div>

              {/* Social Links */}
              {card.social_links && Object.keys(card.social_links).length > 0 && (
                <div className="mb-8">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 text-center">Follow</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {Object.entries(card.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      return (
                        <button
                          key={platform}
                          onClick={() => {
                            trackAction(platform);
                            window.open(url as string, '_blank');
                          }}
                          className="group relative overflow-hidden rounded-full p-3 transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/10 hover:border-white/30"
                          title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <span className="text-xl">{getSocialIcon(platform)}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 rounded-full"></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QR Code Section */}
              {card.qr_code && (
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="group relative overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95 mb-4 flex items-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                      boxShadow: `0 8px 32px ${brandColor}40`,
                      color: 'white',
                    }}
                  >
                    <span className="text-lg">{showQR ? '✕' : '📱'}</span>
                    {showQR ? 'Hide QR' : 'Show QR'}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>

                  {showQR && (
                    <div className="w-full flex flex-col items-center p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-xs text-gray-300 mb-4 uppercase tracking-wider">Scan to Save Contact</p>
                      <div className="bg-white p-4 rounded-lg flex justify-center">
                        <img 
                          src={`/api/qrcode?company_slug=${params.company_slug}&employee_slug=${params.employee_slug}`}
                          alt="Scan to save contact"
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-4 text-center">
                        Use your phone camera to scan and instantly save this contact
                      </p>
                      <a 
                        href={`/api/vcard?company_slug=${params.company_slug}&employee_slug=${params.employee_slug}`}
                        download={`${card.employee_name}.vcf`}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        📥 Download vCard
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Accent Bar */}
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)`,
              }}
            ></div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Digital Business Card powered by <span style={{ color: brandColor }}>DBC</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  function trackAction(action: string) {
    axios.post(
      `/api/proxy?path=/analytics/track?company_slug=${params.company_slug}&employee_slug=${params.employee_slug}`,
      { action, device: 'web' }
    ).catch(() => {});
  }
}
