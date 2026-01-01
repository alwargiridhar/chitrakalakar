import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ExhibitionArchivePage({ user, onLogout }) {
  const [archivedExhibitions, setArchivedExhibitions] = useState([]);
  const [exhibitionArtworks, setExhibitionArtworks] = useState({});

  useEffect(() => {
    fetchArchivedExhibitions();
  }, []);

  const fetchArchivedExhibitions = async () => {
    try {
      const response = await axios.get(`${API}/exhibitions?status=archived`);
      setArchivedExhibitions(response.data);
      
      // Fetch artworks for each exhibition
      for (const exhibition of response.data) {
        fetchExhibitionArtworks(exhibition.id, exhibition.artwork_ids);
      }
    } catch (error) {
      console.error('Error fetching archived exhibitions:', error);
    }
  };

  const fetchExhibitionArtworks = async (exhibitionId, artworkIds) => {
    try {
      const artworks = [];
      for (const artworkId of artworkIds) {
        try {
          const response = await axios.get(`${API}/artworks/${artworkId}`);
          artworks.push(response.data);
        } catch (err) {
          console.error(`Error fetching artwork ${artworkId}:`, err);
        }
      }
      setExhibitionArtworks((prev) => ({ ...prev, [exhibitionId]: artworks }));
    } catch (error) {
      console.error('Error fetching exhibition artworks:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} onLogout={onLogout} />

      <div className="pt-32 pb-24">
        <div className="bg-card">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
                Exhibition Archive
              </h1>
              <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground">
                Explore past exhibitions and completed showcases
              </p>
            </div>

            {archivedExhibitions.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg">No archived exhibitions at the moment</p>
              </div>
            ) : (
              <div className="space-y-24">
                {archivedExhibitions.map((exhibition) => (
                  <div key={exhibition.id} data-testid={`archived-exhibition-${exhibition.id}`} className="space-y-8">
                    <div className="border-b border-border/20 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-3xl md:text-4xl font-medium mb-3">{exhibition.title}</h2>
                          <p className="text-muted-foreground text-lg">{exhibition.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">Archived</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Duration: {exhibition.duration_days} days | 
                        {exhibition.start_date && ` Exhibited: ${new Date(exhibition.start_date).toLocaleDateString()}`}
                        {exhibition.end_date && ` - ${new Date(exhibition.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {(exhibitionArtworks[exhibition.id] || []).map((artwork) => (
                        <div key={artwork.id} data-testid={`archived-artwork-${artwork.id}`} className="group">
                          <div className="relative overflow-hidden rounded-sm mb-4">
                            <img 
                              src={artwork.image_url} 
                              alt={artwork.title} 
                              className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <h3 className="text-xl font-medium mb-2">{artwork.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{artwork.description}</p>
                          <p className="text-lg font-medium text-accent">{artwork.price} {artwork.currency}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary/30 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 ChitraKalakar. Give Life To Your Imagination.
          </p>
        </div>
      </footer>
    </div>
  );
}