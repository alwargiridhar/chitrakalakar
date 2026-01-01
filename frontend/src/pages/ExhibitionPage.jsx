import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ExhibitionPage({ user }) {
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionArtworks, setExhibitionArtworks] = useState({});

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const response = await axios.get(`${API}/exhibitions?status=active`);
      setExhibitions(response.data);
      
      // Fetch artworks for each exhibition
      for (const exhibition of response.data) {
        fetchExhibitionArtworks(exhibition.id, exhibition.artwork_ids);
      }
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
    }
  };

  const fetchExhibitionArtworks = async (exhibitionId, artworkIds) => {
    try {
      const artworks = [];
      for (const artworkId of artworkIds) {
        const response = await axios.get(`${API}/artworks/${artworkId}`);
        artworks.push(response.data);
      }
      setExhibitionArtworks((prev) => ({ ...prev, [exhibitionId]: artworks }));
    } catch (error) {
      console.error('Error fetching exhibition artworks:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-medium">ChitraKalakar</h1>
          </Link>
          {user && (
            <Link to="/dashboard">
              <Button data-testid="dashboard-btn" variant="ghost" className="rounded-full">Dashboard</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="pt-32 pb-24">
        {/* Dark mode exhibition view */}
        <div className="bg-card">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
                Virtual Exhibitions
              </h1>
              <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground">
                Explore curated collections from talented artists
              </p>
            </div>

            {exhibitions.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg">No active exhibitions at the moment</p>
              </div>
            ) : (
              <div className="space-y-24">
                {exhibitions.map((exhibition) => (
                  <div key={exhibition.id} data-testid={`exhibition-${exhibition.id}`} className="space-y-8">
                    <div className="border-b border-border/20 pb-6">
                      <h2 className="text-3xl md:text-4xl font-medium mb-3">{exhibition.title}</h2>
                      <p className="text-muted-foreground text-lg">{exhibition.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Duration: {exhibition.duration_days} days | 
                        {exhibition.start_date && ` Started: ${new Date(exhibition.start_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {(exhibitionArtworks[exhibition.id] || []).map((artwork) => (
                        <div key={artwork.id} data-testid={`exhibition-artwork-${artwork.id}`} className="group">
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
    </div>
  );
}