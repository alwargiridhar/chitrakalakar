import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';

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

export default ArtistsPage;
