import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { publicAPI, adminAPI, artistAPI, authAPI } from './services/api';
import { BRAND_NAME, BRAND_TAGLINE, ART_CATEGORIES, NAVIGATION_LINKS } from './utils/branding';
import './App.css';

// ============ NAVBAR COMPONENT ============
function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExhibitionDropdown, setShowExhibitionDropdown] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExhibitionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Artists', href: '/artists' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ck</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">{BRAND_NAME}</h1>
              <p className="text-xs text-gray-500">{BRAND_TAGLINE}</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                {link.label}
              </Link>
            ))}
            
            {/* Exhibitions Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onMouseEnter={() => setShowExhibitionDropdown(true)}
                onClick={() => setShowExhibitionDropdown(!showExhibitionDropdown)}
                className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-1"
              >
                Exhibitions
                <svg className={`w-4 h-4 transition-transform ${showExhibitionDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showExhibitionDropdown && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onMouseLeave={() => setShowExhibitionDropdown(false)}
                >
                  <Link
                    to="/exhibitions"
                    onClick={() => setShowExhibitionDropdown(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  >
                    🎨 Active Exhibitions
                  </Link>
                  <Link
                    to="/exhibitions/archived"
                    onClick={() => setShowExhibitionDropdown(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  >
                    📁 Archived Exhibitions
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-gray-700 mr-2">{user?.name?.split(' ')[0]}</span>
                {isAdmin ? (
                  <Link to="/admin" className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/dashboard" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 border border-orange-500 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg text-sm font-medium hover:opacity-90">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                {link.label}
              </Link>
            ))}
            <Link to="/exhibitions" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              🎨 Active Exhibitions
            </Link>
            <Link to="/exhibitions/archived" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              📁 Archived Exhibitions
            </Link>
            <div className="pt-2 space-y-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="block w-full px-4 py-2 bg-orange-500 text-white text-center rounded-lg">
                    {isAdmin ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <button onClick={handleLogout} className="block w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full px-4 py-2 border border-orange-500 text-orange-500 text-center rounded-lg">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block w-full px-4 py-2 bg-orange-500 text-white text-center rounded-lg">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ============ FOOTER COMPONENT ============
function Footer() {
  const footerLinks = {
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'For Artists', href: '/signup' },
      { label: 'For Users', href: '/signup' },
      { label: 'Contact', href: '/contact' },
    ],
    Community: [
      { label: 'Featured Artworks', href: '/exhibitions' },
      { label: 'Artist Directory', href: '/artists' },
      { label: 'How It Works', href: '/contact' },
    ],
    Support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-50 pt-16 pb-8 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">ck</span>
              </div>
              <div>
                <h3 className="font-bold text-base">{BRAND_NAME}</h3>
                <p className="text-xs text-gray-400">{BRAND_TAGLINE}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              One stop solution for all your art requirements. Connecting artists and art lovers through sustainable, artist-centric platforms.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>📧</span>
                <span>info@chitrakalakar.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>📞</span>
                <span>+91 9884984454</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>📍</span>
                <span>India</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-white">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 transition-colors flex items-center justify-center">
              <span>f</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 transition-colors flex items-center justify-center">
              <span>📷</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 transition-colors flex items-center justify-center">
              <span>𝕏</span>
            </a>
          </div>
          <p className="text-sm text-gray-400">© 2025 {BRAND_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ============ HOME PAGE ============
function HomePage() {
  const [stats, setStats] = useState({ total_artists: 0, completed_projects: 0, satisfaction_rate: 0 });
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, artistsData, exhibitionsData] = await Promise.all([
          publicAPI.getStats().catch(() => ({ total_artists: 0, completed_projects: 0, satisfaction_rate: 0 })),
          publicAPI.getFeaturedArtists().catch(() => ({ artists: [] })),
          publicAPI.getExhibitions().catch(() => ({ exhibitions: [] })),
        ]);
        setStats(statsData);
        setFeaturedArtists(artistsData.artists || []);
        setExhibitions(exhibitionsData.exhibitions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const howItWorks = [
    { step: 1, title: 'Find Your Artist', description: 'Browse our community of talented artisans', icon: '👥' },
    { step: 2, title: 'Review Portfolio', description: 'Check out sample works, reviews, and ratings', icon: '🎨' },
    { step: 3, title: 'Discuss & Agree', description: 'Connect with the artist, discuss your vision', icon: '🛡️' },
    { step: 4, title: 'Secure Payment', description: 'Make a secure payment through our platform', icon: '⚡' },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden py-12 md:py-0">
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-orange-500 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-yellow-500 opacity-5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[calc(100vh-64px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-orange-500 font-semibold text-lg mb-2">Welcome to {BRAND_NAME}</p>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">{BRAND_TAGLINE}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connect with talented artisans to commission beautiful artwork, discover exhibitions, and celebrate creativity.
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-semibold text-gray-900">I want to:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/signup" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium text-center hover:opacity-90 flex items-center justify-center gap-2">
                    Commission Artwork →
                  </Link>
                  <Link to="/signup" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium text-center hover:opacity-90 flex items-center justify-center gap-2">
                    Sell My Art →
                  </Link>
                </div>
              </div>

              {/* Real Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-orange-500">{stats.total_artists || 0}</p>
                  <p className="text-sm text-gray-500">Talented Artists</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">{stats.completed_projects || 0}</p>
                  <p className="text-sm text-gray-500">Completed Projects</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">{stats.satisfaction_rate || 0}%</p>
                  <p className="text-sm text-gray-500">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[{ icon: '🎨', label: 'Paintings' }, { icon: '👥', label: 'Artisans' }, { icon: '⭐', label: 'Exhibitions' }, { icon: '📍', label: 'Community' }].map((item, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl hover:shadow-lg transition-shadow">
                      <span className="text-3xl mb-2">{item.icon}</span>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How {BRAND_NAME} Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get started with your art journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Step {item.step}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists - Only show if there are approved artists */}
      {featuredArtists.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-100 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Artists</h2>
                <p className="text-lg text-gray-600">Discover extraordinary talent from our community</p>
              </div>
              <Link to="/artists" className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                View All Artists →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArtists.map((artist) => (
                <div key={artist.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                    {artist.avatar ? (
                      <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">👤</span>
                    )}
                    {artist.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold text-sm">{artist.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900">{artist.name}</h3>
                    <p className="text-sm text-orange-500 font-semibold mb-2">{artist.category || 'Artist'}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <span>📍</span>
                      {artist.location || 'India'}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{artist.completed_projects || 0} projects completed</p>
                  </div>
                </div>
              ))}
            </div>

            {featuredArtists.length === 0 && !loading && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No featured artists yet. Be the first to join!</p>
                <Link to="/signup" className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  Join as Artist
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Art Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Art Categories</h2>
            <p className="text-xl text-gray-600">Explore diverse art forms and mediums</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ART_CATEGORIES.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-500 transition-all cursor-pointer">
                <p className="text-center font-semibold text-gray-900">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exhibitions - Only show if there are approved exhibitions */}
      {exhibitions.length > 0 && (
        <section className="py-20 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Virtual Exhibitions</h2>
                <p className="text-lg text-gray-600">Explore curated art exhibitions from talented artists</p>
              </div>
              <Link to="/exhibitions" className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white">
                View All Exhibitions →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exhibitions.map((exhibition) => (
                <div key={exhibition.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-orange-500 to-yellow-500 relative flex items-center justify-center">
                    <span className="text-4xl opacity-50">🎨</span>
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold">
                      <span className={exhibition.status === 'active' ? 'text-green-600' : 'text-orange-600'}>
                        {exhibition.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{exhibition.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">by {exhibition.artist_name}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>🎨</span>
                        {exhibition.artwork_count || 0} artworks
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👁️</span>
                        {exhibition.views || 0} views
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Create or Commission?</h2>
          <p className="text-xl mb-12 opacity-90">Join our thriving community of artists and art enthusiasts today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-3 bg-white text-orange-500 rounded-lg font-semibold hover:bg-gray-100">
              Create Free Account
            </Link>
            <Link to="/login" className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Sign In
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-75">No credit card required • Free to join • Transparent pricing</p>
        </div>
      </section>
    </div>
  );
}

// ============ LOGIN PAGE ============
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ck</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-center text-sm text-gray-500 mb-6">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-500 font-semibold hover:text-orange-600">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <p><strong>Admin Login:</strong> admin@chitrakalakar.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ SIGNUP PAGE ============
function SignupPage() {
  const [step, setStep] = useState('role');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', categories: [], location: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep('details');
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            {step === 'role' ? 'Create Your Account' : 'Tell Us About You'}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            {step === 'role' ? 'Choose your role to get started' : 'Complete your profile'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {step === 'role' ? (
            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('user')}
                className="w-full h-24 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg flex flex-col items-center justify-center gap-2"
              >
                <span className="text-2xl">🛒</span>
                <div>
                  <div className="font-semibold">I Want to Commission</div>
                  <div className="text-xs opacity-90">Browse & order artwork</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('artist')}
                className="w-full h-24 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg flex flex-col items-center justify-center gap-2"
              >
                <span className="text-2xl">🎨</span>
                <div>
                  <div className="font-semibold">I'm an Artist</div>
                  <div className="text-xs opacity-90">Sell your artworks (requires approval)</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('institution')}
                className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg flex flex-col items-center justify-center gap-2"
              >
                <span className="text-2xl">🏛️</span>
                <div>
                  <div className="font-semibold">I Represent an Institution</div>
                  <div className="text-xs opacity-90">Bulk commissions</div>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Your city"
                />
              </div>

              {formData.role === 'artist' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Art Categories (select multiple)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {ART_CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                  {formData.categories.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Selected: {formData.categories.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => setStep('role')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Back to Role Selection
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingArtists, setPendingArtists] = useState([]);
  const [pendingArtworks, setPendingArtworks] = useState([]);
  const [pendingExhibitions, setPendingExhibitions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [approvedArtists, setApprovedArtists] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState({ contemporary: [], registered: [] });
  const [loading, setLoading] = useState(true);
  
  // Contemporary Artist Form
  const [showAddContemporary, setShowAddContemporary] = useState(false);
  const [contemporaryForm, setContemporaryForm] = useState({
    name: '', bio: '', avatar: '', categories: [], location: '', artworks: []
  });
  const [newArtworkForm, setNewArtworkForm] = useState({ title: '', image: '', category: '', price: '', description: '' });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [dashboard, artists, artworks, exhibitions, users, approved, featured] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getPendingArtists(),
        adminAPI.getPendingArtworks(),
        adminAPI.getPendingExhibitions(),
        adminAPI.getAllUsers(),
        adminAPI.getApprovedArtists().catch(() => ({ artists: [] })),
        adminAPI.getFeaturedArtists().catch(() => ({ contemporary: [], registered: [] })),
      ]);
      setDashboardData(dashboard);
      setPendingArtists(artists.artists || []);
      setPendingArtworks(artworks.artworks || []);
      setPendingExhibitions(exhibitions.exhibitions || []);
      setAllUsers(users.users || []);
      setApprovedArtists(approved.artists || []);
      setFeaturedArtists(featured);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArtist = async (artistId, approved) => {
    try {
      await adminAPI.approveArtist(artistId, approved);
      fetchData();
    } catch (error) {
      console.error('Error approving artist:', error);
    }
  };

  const handleApproveArtwork = async (artworkId, approved) => {
    try {
      await adminAPI.approveArtwork(artworkId, approved);
      fetchData();
    } catch (error) {
      console.error('Error approving artwork:', error);
    }
  };

  const handleApproveExhibition = async (exhibitionId, approved) => {
    try {
      await adminAPI.approveExhibition(exhibitionId, approved);
      fetchData();
    } catch (error) {
      console.error('Error approving exhibition:', error);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      fetchData();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleFeatureRegisteredArtist = async (artistId, featured) => {
    try {
      await adminAPI.featureRegisteredArtist(artistId, featured);
      fetchData();
    } catch (error) {
      console.error('Error featuring artist:', error);
    }
  };

  const handleAddArtworkToContemporary = () => {
    if (contemporaryForm.artworks.length >= 10) {
      alert('Maximum 10 artworks allowed');
      return;
    }
    if (!newArtworkForm.title || !newArtworkForm.image) return;
    
    setContemporaryForm(prev => ({
      ...prev,
      artworks: [...prev.artworks, { ...newArtworkForm, price: parseFloat(newArtworkForm.price) || 0 }]
    }));
    setNewArtworkForm({ title: '', image: '', category: '', price: '', description: '' });
  };

  const handleRemoveArtworkFromContemporary = (index) => {
    setContemporaryForm(prev => ({
      ...prev,
      artworks: prev.artworks.filter((_, i) => i !== index)
    }));
  };

  const handleCreateContemporaryArtist = async () => {
    try {
      if (!contemporaryForm.name || !contemporaryForm.bio || !contemporaryForm.avatar) {
        alert('Please fill in name, bio, and picture URL');
        return;
      }
      await adminAPI.createFeaturedArtist(contemporaryForm);
      setShowAddContemporary(false);
      setContemporaryForm({ name: '', bio: '', avatar: '', categories: [], location: '', artworks: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating featured artist:', error);
      alert(error.message);
    }
  };

  const handleDeleteContemporaryArtist = async (artistId) => {
    if (!window.confirm('Are you sure you want to delete this featured artist?')) return;
    try {
      await adminAPI.deleteFeaturedArtist(artistId);
      fetchData();
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };

  const handleCategoryToggle = (category) => {
    setContemporaryForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'artists', label: `Pending (${pendingArtists.length})`, icon: '🎨' },
    { id: 'artworks', label: `Artworks (${pendingArtworks.length})`, icon: '🖼️' },
    { id: 'exhibitions', label: `Exhibitions (${pendingExhibitions.length})`, icon: '🏛️' },
    { id: 'feature', label: 'Feature Artists', icon: '⭐' },
    { id: 'users', label: 'All Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}. Manage artists, artworks, and exhibitions.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Pending Artists</p>
              <p className="text-3xl font-bold text-orange-500">{dashboardData.pending_artists}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Pending Artworks</p>
              <p className="text-3xl font-bold text-purple-500">{dashboardData.pending_artworks}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Pending Exhibitions</p>
              <p className="text-3xl font-bold text-blue-500">{dashboardData.pending_exhibitions}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.total_users}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Featured Artists</p>
              <p className="text-3xl font-bold text-yellow-500">{dashboardData.featured_artists || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Platform Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{dashboardData.total_revenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}

        {/* Pending Artists Tab */}
        {activeTab === 'artists' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Pending Artist Approvals</h2>
            </div>
            <div className="p-6">
              {pendingArtists.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending artists to review</p>
              ) : (
                <div className="space-y-4">
                  {pendingArtists.map((artist) => (
                    <div key={artist.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                        <p className="text-sm text-gray-500">{artist.email}</p>
                        <p className="text-sm text-orange-500">
                          {(artist.categories || [artist.category]).filter(Boolean).join(', ') || 'No category'} • {artist.location || 'No location'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveArtist(artist.id, true)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Approve</button>
                        <button onClick={() => handleApproveArtist(artist.id, false)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Artworks Tab */}
        {activeTab === 'artworks' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Pending Artwork Approvals</h2>
            </div>
            <div className="p-6">
              {pendingArtworks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending artworks to review</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingArtworks.map((artwork) => (
                    <div key={artwork.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="h-40 bg-gray-100">
                        {artwork.image ? (
                          <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
                        <p className="text-sm text-gray-500">{artwork.artist_name}</p>
                        <p className="text-sm text-orange-500">₹{artwork.price?.toLocaleString()}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleApproveArtwork(artwork.id, true)} className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600">Approve</button>
                          <button onClick={() => handleApproveArtwork(artwork.id, false)} className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600">Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Exhibitions Tab */}
        {activeTab === 'exhibitions' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Pending Exhibition Approvals</h2>
            </div>
            <div className="p-6">
              {pendingExhibitions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending exhibitions to review</p>
              ) : (
                <div className="space-y-4">
                  {pendingExhibitions.map((exhibition) => (
                    <div key={exhibition.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exhibition.name}</h3>
                        <p className="text-sm text-gray-500">by {exhibition.artist_name}</p>
                        <p className="text-sm text-orange-500">{exhibition.start_date} - {exhibition.end_date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveExhibition(exhibition.id, true)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Approve</button>
                        <button onClick={() => handleApproveExhibition(exhibition.id, false)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Artists Tab */}
        {activeTab === 'feature' && (
          <div className="space-y-8">
            {/* Add Contemporary Artist Section */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Feature Contemporary Artist</h2>
                  <p className="text-sm text-gray-500">Add external artists with bio, picture, and artworks</p>
                </div>
                <button
                  onClick={() => setShowAddContemporary(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  + Add Contemporary Artist
                </button>
              </div>
              
              {/* Contemporary Artists List */}
              <div className="p-6">
                {featuredArtists.contemporary?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No contemporary artists featured yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredArtists.contemporary?.map((artist) => (
                      <div key={artist.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <img src={artist.avatar} alt={artist.name} className="w-16 h-16 rounded-full object-cover" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                            <p className="text-sm text-orange-500">{(artist.categories || []).join(', ')}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{artist.bio?.substring(0, 100)}...</p>
                            <p className="text-xs text-gray-400 mt-1">{artist.artworks?.length || 0} artworks</p>
                          </div>
                          <button
                            onClick={() => handleDeleteContemporaryArtist(artist.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Feature Registered Artists Section */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Feature Registered Artists</h2>
                <p className="text-sm text-gray-500">Select approved artists to feature on homepage</p>
              </div>
              <div className="p-6">
                {approvedArtists.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No approved artists available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approvedArtists.map((artist) => (
                      <div key={artist.id} className={`border rounded-lg p-4 ${artist.is_featured ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {artist.avatar ? (
                              <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">👤</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                            <p className="text-sm text-orange-500">
                              {(artist.categories || [artist.category]).filter(Boolean).join(', ')}
                            </p>
                            <p className="text-xs text-gray-500">{artist.artwork_count || 0} artworks</p>
                            {artist.is_featured && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleFeatureRegisteredArtist(artist.id, !artist.is_featured)}
                            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${
                              artist.is_featured
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            }`}
                          >
                            {artist.is_featured ? 'Unfeature' : '⭐ Feature'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' :
                          u.role === 'artist' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                        {u.role === 'artist' && u.is_featured && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">⭐ Featured</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1 text-xs rounded ${
                              u.is_active !== false
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {u.is_active !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Contemporary Artist Modal */}
        {showAddContemporary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Add Contemporary Artist</h2>
                <button onClick={() => setShowAddContemporary(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name *</label>
                    <input
                      type="text"
                      value={contemporaryForm.name}
                      onChange={(e) => setContemporaryForm({ ...contemporaryForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={contemporaryForm.location}
                      onChange={(e) => setContemporaryForm({ ...contemporaryForm, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Picture URL *</label>
                  <input
                    type="url"
                    value={contemporaryForm.avatar}
                    onChange={(e) => setContemporaryForm({ ...contemporaryForm, avatar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="https://..."
                  />
                  {contemporaryForm.avatar && (
                    <img src={contemporaryForm.avatar} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {ART_CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contemporaryForm.categories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio * (up to 2500 words)</label>
                  <textarea
                    value={contemporaryForm.bio}
                    onChange={(e) => setContemporaryForm({ ...contemporaryForm, bio: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Write about the artist..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {contemporaryForm.bio.split(/\s+/).filter(Boolean).length} / 2500 words
                  </p>
                </div>

                {/* Artworks Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Artworks (up to 10)</h3>
                  
                  {/* Add Artwork Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Artwork title"
                        value={newArtworkForm.title}
                        onChange={(e) => setNewArtworkForm({ ...newArtworkForm, title: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={newArtworkForm.image}
                        onChange={(e) => setNewArtworkForm({ ...newArtworkForm, image: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={newArtworkForm.category}
                        onChange={(e) => setNewArtworkForm({ ...newArtworkForm, category: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Category</option>
                        {ART_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={newArtworkForm.price}
                        onChange={(e) => setNewArtworkForm({ ...newArtworkForm, price: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddArtworkToContemporary}
                      disabled={contemporaryForm.artworks.length >= 10}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      + Add Artwork
                    </button>
                  </div>

                  {/* Artworks List */}
                  {contemporaryForm.artworks.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contemporaryForm.artworks.map((artwork, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveArtworkFromContemporary(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                          {artwork.image && (
                            <img src={artwork.image} alt={artwork.title} className="w-full h-20 object-cover rounded mb-2" />
                          )}
                          <p className="text-sm font-medium truncate">{artwork.title}</p>
                          <p className="text-xs text-gray-500">₹{artwork.price?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddContemporary(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateContemporaryArtist}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Create Featured Artist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ARTIST DASHBOARD ============
function ArtistDashboard() {
  const { user, isArtist } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddArtwork, setShowAddArtwork] = useState(false);
  const [newArtwork, setNewArtwork] = useState({ title: '', category: '', price: '', image: '', description: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user.role === 'artist' && !user.is_approved) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [dashboard, portfolio, ordersData] = await Promise.all([
        artistAPI.getDashboard().catch(() => null),
        artistAPI.getPortfolio().catch(() => ({ artworks: [] })),
        artistAPI.getOrders().catch(() => ({ orders: [] })),
      ]);
      setDashboardData(dashboard);
      setArtworks(portfolio.artworks || []);
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtwork = async (e) => {
    e.preventDefault();
    try {
      await artistAPI.addArtwork({
        ...newArtwork,
        price: parseFloat(newArtwork.price),
      });
      setShowAddArtwork(false);
      setNewArtwork({ title: '', category: '', price: '', image: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding artwork:', error);
    }
  };

  const handleDeleteArtwork = async (id) => {
    try {
      await artistAPI.deleteArtwork(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show pending approval message for artists
  if (user?.role === 'artist' && !user?.is_approved) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-6xl mb-4 block">⏳</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your artist account is pending admin approval. You'll be notified once approved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show user dashboard for non-artists
  if (user?.role !== 'artist') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600 mb-8">Browse artists and commission artwork</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/artists" className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <span className="text-4xl mb-4 block">🎨</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Artists</h3>
              <p className="text-gray-600">Discover talented artists and their work</p>
            </Link>
            <Link to="/exhibitions" className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <span className="text-4xl mb-4 block">🏛️</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">View Exhibitions</h3>
              <p className="text-gray-600">Explore curated virtual exhibitions</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '🖼️' },
    { id: 'orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}! 🎨</h1>
          <p className="text-gray-600">Here's an overview of your artistry journey</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{dashboardData.total_earnings?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">👁️</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Portfolio Views</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.portfolio_views || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">✅</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.completed_orders || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🖼️</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Artworks</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.total_artworks || 0}</p>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">My Portfolio</h2>
              <button
                onClick={() => setShowAddArtwork(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                + Add Artwork
              </button>
            </div>
            <div className="p-6">
              {artworks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No artworks yet. Add your first artwork!</p>
                  <button
                    onClick={() => setShowAddArtwork(true)}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Add Artwork
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <div key={artwork.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="h-48 bg-gray-100">
                        {artwork.image ? (
                          <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
                        )}
                        {!artwork.is_approved && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                            Pending Approval
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900">{artwork.title}</h3>
                        <p className="text-sm text-orange-500">{artwork.category}</p>
                        <p className="text-lg font-bold text-gray-900 mt-2">₹{artwork.price?.toLocaleString()}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleDeleteArtwork(artwork.id)}
                            className="flex-1 px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                        <p className={`text-xs mt-2 ${artwork.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                          {artwork.is_approved ? '✓ Approved' : '⏳ Pending approval'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                          <p className="text-sm text-gray-500">{order.artwork_title}</p>
                          <p className="text-sm text-gray-500">Customer: {order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-500">₹{order.artist_receives?.toLocaleString()}</p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Artwork Modal */}
        {showAddArtwork && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Add New Artwork</h2>
                <button onClick={() => setShowAddArtwork(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleAddArtwork} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newArtwork.title}
                    onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newArtwork.category}
                    onChange={(e) => setNewArtwork({ ...newArtwork, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select category</option>
                    {ART_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={newArtwork.price}
                    onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={newArtwork.image}
                    onChange={(e) => setNewArtwork({ ...newArtwork, image: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newArtwork.description}
                    onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddArtwork(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Add Artwork
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SIMPLE PAGES ============
function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About ChitraKalakar</h1>
          <p className="text-xl text-gray-600">Connecting artists and art lovers through sustainable, artist-centric platforms</p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              ChitraKalakar is a community platform dedicated to preserving artistic voices, empowering creators, 
              and connecting traditional and contemporary art with modern audiences. We believe in creating sustainable, 
              artist-centric ecosystems where creativity flourishes.
            </p>
          </div>
        </div>

        {/* Founder Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left - Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd544415353454d4eb21bb43def9073da%2Fee0e8ae4a3fe4c82ad16df36dcbbb4fd?format=webp&width=800"
                  alt="Giridhar Alwar"
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Giridhar Alwar</h2>
              <p className="text-lg font-semibold text-orange-500 mb-6">Founder & Chief Chitrakalakar</p>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Giridhar Alwar is an Indian visual artist, author, and cultural entrepreneur, and the founder of ChitraKalakar. 
                  His creative journey began with writing and visual storytelling, where he explored themes of culture, identity, 
                  and everyday Indian life.
                </p>
                <p>
                  As an author and artist, Giridhar's work reflects a deep engagement with Indian aesthetics and narrative traditions, 
                  evolving from personal creative practice into building platforms that support other artists. His early initiatives 
                  under RamRath Artworks laid the foundation for a broader vision—creating sustainable, artist-centric ecosystems.
                </p>
                <p>
                  Through ChitraKalakar, he brings together his experience as an author, visual artist, and entrepreneur to preserve 
                  artistic voices, empower creators, and connect traditional and contemporary art with modern audiences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Artist Empowerment</h3>
            <p className="text-gray-600 text-sm">
              We create sustainable platforms where artists can thrive, maintain creative control, and build meaningful relationships with their audience.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Preservation</h3>
            <p className="text-gray-600 text-sm">
              We celebrate and preserve traditional art forms while connecting them with contemporary audiences, bridging past and present.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💫</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Connection</h3>
            <p className="text-gray-600 text-sm">
              We foster meaningful connections between artists and art lovers, creating a vibrant community that celebrates creativity.
            </p>
          </div>
        </div>

        {/* Why ChitraKalakar Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why ChitraKalakar?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-500 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Direct Artist-Buyer Connection</h3>
                  <p className="text-gray-600">
                    Eliminate intermediaries and enable direct relationships between artists and patrons, ensuring fair compensation and artistic freedom.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-500 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sustainable Ecosystem</h3>
                  <p className="text-gray-600">
                    Support artists with transparent pricing, manageable commissions, and opportunities to build lasting careers in the arts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-500 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Curated Virtual Exhibitions</h3>
                  <p className="text-gray-600">
                    Showcase artworks through elegant virtual exhibitions, giving artists global reach and collectors access to diverse, authentic works.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-500 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Artist-Centric Platform</h3>
                  <p className="text-gray-600">
                    Every feature is designed with artists' needs in mind—from portfolio management to exhibition creation and earnings tracking.
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

function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAPI.getFeaturedArtists()
      .then(data => setArtists(data.artists || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Featured Artists</h1>
      {loading ? (
        <p>Loading...</p>
      ) : artists.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No approved artists yet. Be the first to join!</p>
          <Link to="/signup" className="px-6 py-2 bg-orange-500 text-white rounded-lg">Join as Artist</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map(artist => (
            <div key={artist.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-xl text-gray-900">{artist.name}</h3>
              <p className="text-orange-500">{artist.category}</p>
              <p className="text-gray-500 text-sm mt-2">{artist.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExhibitionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Virtual Exhibitions</h1>
        <p className="text-lg text-gray-600 mb-8">Explore and participate in curated art exhibitions</p>
        <div className="bg-gray-100 rounded-lg p-8 text-gray-600 max-w-2xl mx-auto">
          <p className="mb-4 font-semibold">This page is coming soon with:</p>
          <ul className="text-left space-y-2 inline-block">
            <li>• Active exhibitions by date</li>
            <li>• Featured artworks in exhibitions</li>
            <li>• Exhibition booking and management</li>
            <li>• Archive of past exhibitions</li>
            <li>• Simulation section for artists</li>
          </ul>
        </div>
        <div className="mt-8">
          <Link to="/exhibitions/archived" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-flex items-center gap-2">
            📁 View Archived Exhibitions
          </Link>
        </div>
      </div>
    </div>
  );
}

function ArchivedExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAPI.getArchivedExhibitions()
      .then(data => setExhibitions(data.exhibitions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/exhibitions" className="text-orange-500 hover:text-orange-600 text-sm mb-4 inline-block">
          ← Back to Active Exhibitions
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">📁 Archived Exhibitions</h1>
        <p className="text-lg text-gray-600">
          Browse past exhibitions. Archived exhibitions remain accessible for free for the same duration the artist originally paid for.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : exhibitions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <span className="text-6xl mb-4 block">📁</span>
          <p className="text-gray-500 mb-2">No archived exhibitions yet</p>
          <p className="text-sm text-gray-400">Past exhibitions will appear here once they complete their active period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitions.map(exhibition => (
            <div key={exhibition.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center relative">
                <span className="text-4xl opacity-50">🎨</span>
                <div className="absolute top-3 right-3 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Archived
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{exhibition.name}</h3>
                <p className="text-sm text-gray-500 mb-2">by {exhibition.artist_name}</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>🎨</span>
                    {exhibition.artwork_count || 0} artworks
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👁️</span>
                    {exhibition.views || 0} views
                  </div>
                  {exhibition.archived_at && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>📅</span>
                      Archived: {new Date(exhibition.archived_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactPage() {
  const steps = [
    { number: 1, title: "Share Your Requirement", description: "Tell us what you're looking for. For example, you want to get a picture painted or a custom artwork created.", icon: "📝" },
    { number: 2, title: "Set Your Budget", description: "Define your budget, artwork size requirements, and key factors like style, theme, and timeline.", icon: "💰" },
    { number: 3, title: "ChitraKalakar Reviews Artist Profiles", description: "Our team analyzes artist profiles and shows you artworks from artisans who can fulfill your requirements.", icon: "🔍" },
    { number: 4, title: "Review Samples & Select", description: "Check the portfolios and select up to 3 satisfied sample works from artists whose work resonates with your vision.", icon: "✨" },
    { number: 5, title: "Artist Acceptance & Payment", description: "Once an artist accepts your request, you proceed to payment. Your payment is held securely in escrow.", icon: "🤝" },
    { number: 6, title: "Artist Creates & Delivers", description: "The artist creates your custom artwork and delivers it according to the agreed timeline and specifications.", icon: "🎨" },
    { number: 7, title: "Client Approval & Release Payment", description: "Upon your approval of the final artwork, ChitraKalakar releases the payment to the artist immediately.", icon: "✅" },
    { number: 8, title: "Transcript Report", description: "Receive a complete transcript and documentation of your order for records and future reference.", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-600">Have questions? We'd love to hear from you. Connect with the ChitraKalakar team.</p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-3">Send us an email anytime</p>
            <a href="mailto:contact@chitrakalakar.com" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              contact@chitrakalakar.com
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 mb-3">Call us to speak with our team</p>
            <a href="tel:+919884984454" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              +91 9884984454
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Response Time</h3>
            <p className="text-gray-600 mb-3">We typically respond within</p>
            <p className="text-orange-500 font-semibold">24-48 hours</p>
          </div>
        </div>

        {/* How ChitraKalakar Works Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How ChitraKalakar Works</h2>
            <p className="text-xl text-gray-600">A simple and transparent process to commission your custom artwork</p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4 relative">
                    <span className="text-white font-bold text-xl">{step.number}</span>
                    <span className="absolute -bottom-2 -right-2 text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl shadow-lg p-12 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Connect With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Process</h3>
                <p className="text-gray-600">Every step is clear, documented, and designed to protect both artists and collectors.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Pricing</h3>
                <p className="text-gray-600">Artists keep more of their earnings with our sustainable commission model.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Transactions</h3>
                <p className="text-gray-600">Your payments are held safely until the artwork is delivered and approved.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What if I'm not satisfied with the artwork?</h3>
              <p className="text-gray-600 text-sm">You have full approval authority. If the artwork doesn't meet your expectations, you can request revisions before final payment is released.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How long does the entire process take?</h3>
              <p className="text-gray-600 text-sm">The timeline varies based on artwork complexity and artist availability. Most projects are completed within 2-4 weeks.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Can I request revisions?</h3>
              <p className="text-gray-600 text-sm">Yes! During the creation process, you can request reasonable revisions to ensure the final artwork matches your vision.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Is my artwork copyrighted to me?</h3>
              <p className="text-gray-600 text-sm">Upon final payment, you own the artwork. The terms regarding reproduction rights are agreed upon between you and the artist.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">We support multiple payment methods including credit cards, debit cards, and digital wallets for your convenience.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How do I contact an artist directly?</h3>
              <p className="text-gray-600 text-sm">Once an artist accepts your request, you'll have a dedicated communication channel to discuss details and updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQPage() {
  const faqs = [
    { q: "How do I commission artwork?", a: "Sign up as a user, browse artists, and contact them directly to discuss your requirements." },
    { q: "How do I become an artist?", a: "Sign up as an artist, and your account will be reviewed by our admin team for approval." },
    { q: "What are the fees?", a: "Artists pay a 10% commission on completed orders. Users pay no additional fees." },
    { q: "How is payment handled?", a: "Payments are held securely until the artwork is delivered and approved." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
            <p className="text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose max-w-none text-gray-600">
        <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Information We Collect</h2>
        <p>We collect information you provide directly, such as name, email, and artwork details.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">How We Use Information</h2>
        <p>We use your information to provide our services, process transactions, and communicate with you.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Contact</h2>
        <p>For privacy concerns, contact us at contact@chitrakalakar.com</p>
      </div>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
      <div className="prose max-w-none text-gray-600">
        <p>By using ChitraKalakar, you agree to these terms.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">User Responsibilities</h2>
        <p>Users must provide accurate information and use the platform responsibly.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Artist Responsibilities</h2>
        <p>Artists must deliver quality work as promised and maintain professional conduct.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Platform Fees</h2>
        <p>ChitraKalakar charges a 10% commission on completed orders.</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link to="/" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          Go Home
        </Link>
      </div>
    </div>
  );
}

// ============ LAYOUT WRAPPER ============
function Layout({ children }) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}

// ============ MAIN APP ============
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/artists" element={<Layout><ArtistsPage /></Layout>} />
          <Route path="/exhibitions" element={<Layout><ExhibitionsPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/admin" element={<><NavBar /><AdminDashboard /></>} />
          <Route path="/dashboard" element={<><NavBar /><ArtistDashboard /></>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
