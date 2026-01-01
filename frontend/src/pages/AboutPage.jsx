import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { Award, Star, MapPin, Palette, Users, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AboutPage({ user, onLogout }) {
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalArtworks: 0,
    activeExhibitions: 0
  });

  useEffect(() => {
    fetchFeaturedArtist();
    fetchStats();
  }, []);

  const fetchFeaturedArtist = async () => {
    try {
      const response = await axios.get(`${API}/featured/artists`);
      if (response.data.length > 0) {
        const artist = response.data[0];
        setFeaturedArtist(artist);
        // Fetch artist's artworks
        const artworksResponse = await axios.get(`${API}/artworks?artist_id=${artist.id}`);
        setFeaturedArtworks(artworksResponse.data.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching featured artist:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [artists, artworks, exhibitions] = await Promise.all([
        axios.get(`${API}/artists`),
        axios.get(`${API}/featured/artworks`),
        axios.get(`${API}/exhibitions?status=active`)
      ]);
      setStats({
        totalArtists: artists.data.length,
        totalArtworks: artworks.data.length,
        activeExhibitions: exhibitions.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation user={user} onLogout={onLogout} />

      <div className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
              About ChitraKalakar
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground max-w-3xl mx-auto">
              A platform connecting art lovers with talented artisans, making custom artwork accessible to everyone.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-card border border-border/40 p-12 rounded-sm mb-12">
            <h2 className="text-3xl font-medium mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              ChitraKalakar bridges the gap between artisans and art enthusiasts. We empower artists to showcase their work globally while making it easy for buyers to commission custom artwork from local and international talent.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <Card data-testid="stat-artists" className="text-center">
              <CardContent className="pt-8">
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-4xl font-bold mb-2">{stats.totalArtists}+</p>
                <p className="text-muted-foreground">Talented Artists</p>
              </CardContent>
            </Card>
            <Card data-testid="stat-artworks" className="text-center">
              <CardContent className="pt-8">
                <Palette className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-4xl font-bold mb-2">{stats.totalArtworks}+</p>
                <p className="text-muted-foreground">Artworks Created</p>
              </CardContent>
            </Card>
            <Card data-testid="stat-exhibitions" className="text-center">
              <CardContent className="pt-8">
                <TrendingUp className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-4xl font-bold mb-2">{stats.activeExhibitions}+</p>
                <p className="text-muted-foreground">Active Exhibitions</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Artist of the Month */}
        {featuredArtist && (
          <section className="bg-secondary/30 py-24">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="flex items-center justify-center mb-12">
                <Award className="h-8 w-8 text-accent mr-3" />
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight">Artist of the Month</h2>
              </div>

              <Card data-testid="featured-artist-card" className="border-accent/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-accent text-accent-foreground">Featured Artist</Badge>
                      <CardTitle className="text-3xl mb-2">Artist Profile #{featuredArtist.id.slice(0, 8)}</CardTitle>
                      <CardDescription className="text-lg">
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{featuredArtist.city}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-accent text-accent" />
                            <span>{featuredArtist.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{featuredArtist.bio || 'A talented artist creating beautiful works across various mediums.'}</p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {featuredArtist.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-sm">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-secondary/50 p-4 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                      <p className="text-2xl font-bold">{featuredArtist.total_orders}</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Rating</p>
                      <p className="text-2xl font-bold">{featuredArtist.rating.toFixed(1)}</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
                      <p className="text-2xl font-bold">{(featuredArtist.commission_rate * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {featuredArtworks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Featured Works</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featuredArtworks.map((artwork) => (
                          <div key={artwork.id} className="group relative overflow-hidden rounded-sm">
                            <img 
                              src={artwork.image_url} 
                              alt={artwork.title} 
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <p className="text-white text-sm font-medium">{artwork.title}</p>
                              <p className="text-white/80 text-xs">{artwork.price} {artwork.currency}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Founder Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 bg-background">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-center mb-16">Meet Our Founder</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_29756c73-d1a5-471d-b945-6bff0c3a86f5/artifacts/to7uqpfr_New%20Project%20%2814%29.jpg"
                    alt="Giridhar Alwar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:col-span-2 p-8 lg:p-12">
                  <h3 className="text-3xl font-medium mb-2">Giridhar Alwar</h3>
                  <p className="text-lg text-accent mb-6">Founder & Chief Chitrakalakar</p>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Giridhar Alwar is an Indian visual artist, author, and cultural entrepreneur, and the founder of Chitrakalakar. His creative journey began with writing and visual storytelling, where he explored themes of culture, identity, and everyday Indian life.
                    </p>
                    <p>
                      As an author and artist, Giridhar's work reflects a deep engagement with Indian aesthetics and narrative traditions, evolving from personal creative practice into building platforms that support other artists. His early initiatives under RamRath Artworks laid the foundation for a broader vision—creating sustainable, artist-centric ecosystems.
                    </p>
                    <p>
                      Through Chitrakalakar, he brings together his experience as an author, visual artist, and entrepreneur to preserve artistic voices, empower creators, and connect traditional and contemporary art with modern audiences.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-accent">1</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Browse & Discover</h3>
                <p className="text-muted-foreground">Explore artworks and artists from all locations, or filter by your preferred city and category.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Commission Custom Work</h3>
                <p className="text-muted-foreground">Create a custom order request and get matched with artists who can bring your vision to life.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Receive Your Art</h3>
                <p className="text-muted-foreground">Work directly with your chosen artist and receive a unique piece tailored to your preferences.</p>
              </CardContent>
            </Card>
          </div>
        </section>
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