import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { artistAPI, authAPI } from '../services/api';
import { ART_CATEGORIES } from '../utils/branding';
import ImageUpload from '../components/ImageUpload';
import { BUCKETS } from '../lib/supabase';

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
  
  // Profile editing
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    bio: '', 
    location: '', 
    categories: [], 
    avatar: '',
    phone: '',
    teaching_rate: null,
    teaches_online: false,
    teaches_offline: false
  });
  const [profileSaving, setProfileSaving] = useState(false);

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
    // Initialize profile form
    setProfileForm({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      categories: user?.categories || [user?.category].filter(Boolean),
      avatar: user?.avatar || ''
    });
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

  const handleProfileCategoryToggle = (category) => {
    setProfileForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await authAPI.updateProfile(profileForm);
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('chitrakalakar_user') || '{}');
      const updatedUser = { ...storedUser, ...profileForm };
      localStorage.setItem('chitrakalakar_user', JSON.stringify(updatedUser));
      setShowEditProfile(false);
      window.location.reload(); // Refresh to update auth context
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setProfileSaving(false);
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
            Your artist account is pending admin approval. You will be notified once approved.
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
    { id: 'profile', label: 'Profile', icon: '👤' },
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
                  <p className="text-gray-500 mb-4">No artworks yet. Add your first artwork.</p>
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
                      <div className="h-48 bg-gray-100 relative">
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
              <button
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    bio: user?.bio || '',
                    location: user?.location || '',
                    categories: user?.categories || [],
                    avatar: user?.avatar || '',
                    phone: user?.phone || '',
                    teaching_rate: user?.teaching_rate || null,
                    teaches_online: user?.teaches_online || false,
                    teaches_offline: user?.teaches_offline || false
                  });
                  setShowEditProfile(true);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Edit Profile
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">👤</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {user?.is_featured && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">⭐ Featured Artist</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{user?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bio</label>
                      <p className="text-gray-900">{user?.bio || 'No bio added yet'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Art Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {(user?.categories || [user?.category]).filter(Boolean).length > 0 ? (
                      (user?.categories || [user?.category]).filter(Boolean).map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {cat}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No categories selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button onClick={() => setShowEditProfile(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <ImageUpload
                    bucket={BUCKETS.AVATARS}
                    currentImage={profileForm.avatar}
                    onUpload={(url) => setProfileForm({ ...profileForm, avatar: url })}
                    label="Upload Profile Picture"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Teaching Profile Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Profile (Optional)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Rate (₹ per session)</label>
                      <input
                        type="number"
                        value={profileForm.teaching_rate || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, teaching_rate: parseFloat(e.target.value) || null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileForm.teaches_online || false}
                          onChange={(e) => setProfileForm({ ...profileForm, teaches_online: e.target.checked })}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">💻 I teach online</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileForm.teaches_offline || false}
                          onChange={(e) => setProfileForm({ ...profileForm, teaches_offline: e.target.checked })}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">📍 I teach in-person</span>
                      </label>
                    </div>

                    <p className="text-xs text-gray-500">
                      Setting teaching preferences will make you visible to students looking for art classes
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Art Categories (select multiple)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {ART_CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={profileForm.categories.includes(cat)}
                          onChange={() => handleProfileCategoryToggle(cat)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                  {profileForm.categories.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Selected: {profileForm.categories.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Artwork Image</label>
                  <ImageUpload
                    bucket={BUCKETS.ARTWORKS}
                    currentImage={newArtwork.image}
                    onUpload={(url) => setNewArtwork({ ...newArtwork, image: url })}
                    label="Upload Artwork Image"
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

export default ArtistDashboard;
