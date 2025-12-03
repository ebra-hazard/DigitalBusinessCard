'use client';

import { ArrowRight, QrCode, Share2, Zap, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">DBC</span>
            </div>
            <span className="font-bold text-gray-900">DigitalCards</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Zap size={16} />
            <span className="text-sm font-medium">Trusted by 1000+ companies</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">digital business card</span> is always on-brand
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Create stunning digital business cards that turn first meetings into lasting connections. Customizable, shareable, and always with you.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-semibold flex items-center gap-2 text-lg">
              Create Your Card <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-xl hover:border-gray-400 transition-all font-semibold">
              Learn More
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl rounded-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card Preview 1 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                </div>
                {/* Card Preview 2 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform md:scale-110">
                  <div className="w-full h-40 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                </div>
                {/* Card Preview 3 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="w-full h-40 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The smarter way to connect and grow</h2>
            <p className="text-xl text-gray-600">Everything you need to share your professional information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Instantly</h3>
              <p className="text-gray-600">Share via QR code, link, NFC, or email. Recipients don't need an app to view your card.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fully Customizable</h3>
              <p className="text-gray-600">Choose from modern templates or create your own with custom colors, fonts, and branding.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border border-pink-200">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Track who viewed your card, where they're from, and how they engaged with it.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600">Manage cards for your entire team with role-based permissions and company branding.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Always Up-to-Date</h3>
              <p className="text-gray-600">Update your information once and it's immediately shared everywhere you've shared your card.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600">Optimized for mobile devices with beautiful responsive designs that look great everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to make a lasting impression?</h2>
          <p className="text-xl mb-8 opacity-90">Create your first digital business card in just 2 minutes</p>
          <Link href="/auth/signup" className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-xl transition-all font-semibold inline-flex items-center gap-2 text-lg">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <p>&copy; 2025 DigitalCards. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
