import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';

function PaintingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [painting, setPainting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPainting();
  }, [id]);

  const fetchPainting = async () => {
    try {
      const response = await publicAPI.getPaintingDetail(id);
      setPainting(response.painting);
    } catch (error) {
      setError('Painting not found');
      console.error('Error fetching painting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !painting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Painting not found'}</h2>
          <Link to="/paintings" className="text-orange-500 hover:underline">
            ← Back to Paintings
          </Link>
        </div>
      </div>
    );
  }

  const artist = painting.users;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-orange-500">Home</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link to="/paintings" className="text-gray-500 hover:text-orange-500">Paintings</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{painting.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              {painting.image ? (
                <img 
                  src={painting.image} 
                  alt={painting.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">
                  🖼️
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-3">
                {painting.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{painting.title}</h1>
              <p className="text-2xl font-bold text-orange-600">
                ₹{painting.price?.toLocaleString('en-IN')}
              </p>
            </div>

            {painting.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{painting.description}</p>
              </div>
            )}

            {/* Artist Info (without contact) */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Artist</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center overflow-hidden">
                  {artist?.avatar ? (
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{artist?.name || 'Unknown Artist'}</h4>
                  {artist?.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span>📍</span> {artist.location}
                    </p>
                  )}
                  {artist?.categories && artist.categories.length > 0 && (
                    <p className="text-sm text-orange-500 mt-1">
                      {artist.categories.join(', ')}
                    </p>
                  )}
                  {artist?.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{artist.bio}</p>
                  )}
                </div>
              </div>
              <Link 
                to={`/artist/${artist?.id}`}
                className="mt-4 block text-center px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
              >
                View Artist Profile
              </Link>
            </div>

            {/* Enquiry Section */}
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Interested in this artwork?</h3>
              <p className="text-white/90 mb-4">
                Submit a commission enquiry to connect with the artist and discuss purchasing this piece.
              </p>
              <Link 
                to="/contact"
                className="inline-block px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                Commission Artwork →
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {painting.views > 0 && (
                <span className="flex items-center gap-1">
                  <span>👁️</span> {painting.views} views
                </span>
              )}
              <span className="flex items-center gap-1">
                <span>📅</span> Added {new Date(painting.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <button 
            onClick={() => navigate(-1)}
            className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
          >
            ← Back to Paintings
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaintingDetailPage;
