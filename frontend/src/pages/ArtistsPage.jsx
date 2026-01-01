import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { MapPin, Star, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = ['Acrylic Colors', 'Watercolors', 'Pencil Work', 'Pastels', 'Indian Ink', 'Illustrations', 'Visual Art', 'Digital Art'];

export default function ArtistsPage({ user, onLogout }) {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [artistArtworks, setArtistArtworks] = useState({});

  useEffect(() => {
    fetchAllArtists();
  }, []);

  useEffect(() => {
    filterArtists();
  }, [searchCity, selectedSkill, artists]);

  const fetchAllArtists = async () => {
    try {
      // Fetch all artists without location filter
      const response = await axios.get(`${API}/artists`);
      setArtists(response.data);
      setFilteredArtists(response.data);
      
      // Fetch sample artworks for each artist
      response.data.forEach(artist => {
        fetchArtistArtworks(artist.id);
      });
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchArtistArtworks = async (artistId) => {
    try {
      const response = await axios.get(`${API}/artworks?artist_id=${artistId}`);
      setArtistArtworks(prev => ({ ...prev, [artistId]: response.data.slice(0, 3) }));
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const filterArtists = () => {
    let filtered = [...artists];
    
    if (searchCity) {
      filtered = filtered.filter(artist => 
        artist.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }
    
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(artist => 
        artist.skills.includes(selectedSkill)
      );
    }
    
    setFilteredArtists(filtered);
  };

  return (
    <div className="min-h-screen">
      <Navigation user={user} onLogout={onLogout} />

      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
              Discover Artists
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground mb-8">
              Browse talented artisans from all locations. Filter by city or skill to find the perfect artist for your project.
            </p>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card border border-border/40 p-6 rounded-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search by City</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-testid="search-city"
                    placeholder="Enter city name..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Skill</label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger data-testid="filter-skill">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredArtists.length} {filteredArtists.length === 1 ? 'artist' : 'artists'}
                </p>
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          {filteredArtists.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg">No artists found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtists.map((artist) => (
                <Card key={artist.id} data-testid={`artist-card-${artist.id}`} className="group hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{artist.city}, {artist.pincode}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-medium">{artist.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">Artist #{artist.id.slice(0, 8)}</CardTitle>
                    <CardDescription className="line-clamp-2">{artist.bio || 'Talented artist creating beautiful works.'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {artist.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {artist.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{artist.skills.length - 3}</Badge>
                        )}
                      </div>
                    </div>

                    {artistArtworks[artist.id] && artistArtworks[artist.id].length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Sample Works</p>
                        <div className="grid grid-cols-3 gap-2">
                          {artistArtworks[artist.id].map((artwork) => (
                            <img
                              key={artwork.id}
                              src={artwork.image_url}
                              alt={artwork.title}
                              className="w-full h-20 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{artist.total_orders} orders completed</span>
                      <span>{(artist.commission_rate * 100).toFixed(0)}% commission</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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