const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get auth token from localStorage
const getToken = () => localStorage.getItem('chitrakalakar_token');

// Helper for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

// Auth APIs
export const authAPI = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  signup: (data) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => apiCall('/auth/me'),
  updateProfile: (data) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Public APIs
export const publicAPI = {
  getStats: () => apiCall('/public/stats'),
  getFeaturedArtists: () => apiCall('/public/featured-artists'),
  getExhibitions: () => apiCall('/public/exhibitions'),
  getActiveExhibitions: () => apiCall('/public/exhibitions/active'),
  getArchivedExhibitions: () => apiCall('/public/exhibitions/archived'),
  getFeaturedArtistDetail: (artistId) => apiCall(`/public/featured-artist/${artistId}`),
  
  // Art Class Enquiry
  createArtClassEnquiry: (data) => apiCall('/public/art-class-enquiry', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getArtClassMatches: (enquiryId) => apiCall(`/public/art-class-matches/${enquiryId}`),
  revealContact: (enquiryId, artistId) => apiCall('/public/reveal-contact', {
    method: 'POST',
    body: JSON.stringify({ enquiry_id: enquiryId, artist_id: artistId }),
  }),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => apiCall('/admin/dashboard'),
  getPendingArtists: () => apiCall('/admin/pending-artists'),
  approveArtist: (artistId, approved) => apiCall('/admin/approve-artist', {
    method: 'POST',
    body: JSON.stringify({ artist_id: artistId, approved }),
  }),
  getPendingArtworks: () => apiCall('/admin/pending-artworks'),
  approveArtwork: (artworkId, approved) => apiCall('/admin/approve-artwork', {
    method: 'POST',
    body: JSON.stringify({ artwork_id: artworkId, approved }),
  }),
  getPendingExhibitions: () => apiCall('/admin/pending-exhibitions'),
  approveExhibition: (exhibitionId, approved) => apiCall('/admin/approve-exhibition', {
    method: 'POST',
    body: JSON.stringify({ exhibition_id: exhibitionId, approved }),
  }),
  archiveExhibition: (exhibitionId) => apiCall(`/admin/archive-exhibition/${exhibitionId}`, {
    method: 'POST',
  }),
  getAllUsers: () => apiCall('/admin/all-users'),
  toggleUserStatus: (userId) => apiCall(`/admin/toggle-user-status/${userId}`, {
    method: 'POST',
  }),
  getAllOrders: () => apiCall('/admin/all-orders'),
  
  // Featured Artists
  getFeaturedArtists: () => apiCall('/admin/featured-artists'),
  getApprovedArtists: () => apiCall('/admin/approved-artists'),
  getArtistPreview: (artistId) => apiCall(`/admin/artist-preview/${artistId}`),
  
  // Feature Contemporary Artist
  createFeaturedArtist: (data) => apiCall('/admin/feature-contemporary-artist', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateFeaturedArtist: (artistId, data) => apiCall(`/admin/featured-artist/${artistId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteFeaturedArtist: (artistId) => apiCall(`/admin/featured-artist/${artistId}`, {
    method: 'DELETE',
  }),
  
  // Feature Registered Artist
  featureRegisteredArtist: (artistId, featured) => apiCall('/admin/feature-registered-artist', {
    method: 'POST',
    body: JSON.stringify({ artist_id: artistId, featured }),
  }),
  
  // Sub-Admin Management
  createSubAdmin: (data) => apiCall('/admin/create-sub-admin', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getSubAdmins: () => apiCall('/admin/sub-admins'),
  
  // Lead Chitrakar
  leadChitrakarApproveArtwork: (artworkId, approved) => apiCall('/admin/lead-chitrakar/approve-artwork', {
    method: 'POST',
    body: JSON.stringify({ artwork_id: artworkId, approved }),
  }),
  
  // Kalakar
  kalakarGetExhibitionAnalytics: () => apiCall('/admin/kalakar/exhibitions-analytics'),
  kalakarGetPaymentRecords: () => apiCall('/admin/kalakar/payment-records'),
};

// Artist APIs
export const artistAPI = {
  getDashboard: () => apiCall('/artist/dashboard'),
  getPortfolio: () => apiCall('/artist/portfolio'),
  addArtwork: (artwork) => apiCall('/artist/portfolio', {
    method: 'POST',
    body: JSON.stringify(artwork),
  }),
  updateArtwork: (id, artwork) => apiCall(`/artist/portfolio/${id}`, {
    method: 'PUT',
    body: JSON.stringify(artwork),
  }),
  deleteArtwork: (id) => apiCall(`/artist/portfolio/${id}`, {
    method: 'DELETE',
  }),
  getOrders: () => apiCall('/artist/orders'),
  updateOrderStatus: (id, status) => apiCall(`/artist/orders/${id}/status?status=${status}`, {
    method: 'PUT',
  }),
  getExhibitions: () => apiCall('/artist/exhibitions'),
  createExhibition: (data) => apiCall('/artist/exhibitions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export default apiCall;
