import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, MapPin, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ArtistProfilePage() {
  const { artistId } = useParams();
  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, [artistId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/artists/profile/${artistId}`);
      setProfile(response.data);
      fetchArtworks(response.data.id);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchArtworks = async (profileId) => {
    try {
      const response = await axios.get(`${API}/artworks?artist_id=${profileId}`);
      setArtworks(response.data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-medium">ChitraKalakar</h1>
          </Link>
        </div>
      </header>

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Artist Profile</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.city}, {profile.pincode}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-accent text-accent" />
                  <span>{profile.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{profile.bio}</p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-4">Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile.total_orders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{artworks.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile.rating.toFixed(1)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-medium mb-6">Portfolio</h2>
          {artworks.length === 0 ? (
            <p className="text-muted-foreground">No artworks available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <Card key={artwork.id} className="group overflow-hidden">
                  <img src={artwork.image_url} alt={artwork.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
                  <CardHeader>
                    <CardTitle className="text-lg">{artwork.title}</CardTitle>
                    <CardDescription>{artwork.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-medium text-accent">{artwork.price} {artwork.currency}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}