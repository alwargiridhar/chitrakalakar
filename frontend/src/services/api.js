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
};

// Public APIs
export const publicAPI = {
  getStats: () => apiCall('/public/stats'),
  getFeaturedArtists: () => apiCall('/public/featured-artists'),
  getExhibitions: () => apiCall('/public/exhibitions'),
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
  getAllUsers: () => apiCall('/admin/all-users'),
  toggleUserStatus: (userId) => apiCall(`/admin/toggle-user-status/${userId}`, {
    method: 'POST',
  }),
  getAllOrders: () => apiCall('/admin/all-orders'),
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
};

export default apiCall;
