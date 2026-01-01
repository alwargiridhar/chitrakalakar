import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { MapPin, Star, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = ['Acrylic Colors', 'Watercolors', 'Pencil Work', 'Pastels', 'Indian Ink', 'Illustrations', 'Visual Art', 'Digital Art'];
const CURRENCIES = ['INR', 'USD', 'EUR'];

export default function CustomOrderPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Create Order, 2: View Matched Artists, 3: Select Artist
  const [orderForm, setOrderForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    currency: 'INR',
    preferred_city: '',
    preferred_pincode: ''
  });
  const [createdOrder, setCreatedOrder] = useState(null);
  const [priorityArtists, setPriorityArtists] = useState([]);
  const [otherArtists, setOtherArtists] = useState([]);
  const [showOtherLocations, setShowOtherLocations] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOrderChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/orders/custom`, {
        ...orderForm,
        user_id: user.id,
        budget: parseFloat(orderForm.budget)
      });
      
      setCreatedOrder(response.data);
      toast.success(`Order created! ${response.data.matched_artists.length} artists matched from your location.`);
      
      // Fetch artist details
      await fetchArtistDetails(response.data);
      setStep(2);
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistDetails = async (order) => {
    try {
      // Fetch priority artists (same location)
      const priorityDetails = await Promise.all(
        order.matched_artists.map(async (artistId) => {
          try {
            const profile = await axios.get(`${API}/artists/profile/${artistId}`);
            const artworks = await axios.get(`${API}/artworks?artist_id=${artistId}`);
            return { ...profile.data, artworks: artworks.data.slice(0, 3) };
          } catch (err) {
            return null;
          }
        })
      );
      setPriorityArtists(priorityDetails.filter(a => a !== null));

      // Fetch other location artists
      if (order.all_location_artists && order.all_location_artists.length > 0) {
        const otherDetails = await Promise.all(
          order.all_location_artists.slice(0, 20).map(async (artistId) => {
            try {
              const profile = await axios.get(`${API}/artists/profile/${artistId}`);
              const artworks = await axios.get(`${API}/artworks?artist_id=${artistId}`);
              return { ...profile.data, artworks: artworks.data.slice(0, 3) };
            } catch (err) {
              return null;
            }
          })
        );
        setOtherArtists(otherDetails.filter(a => a !== null));
      }
    } catch (error) {
      console.error('Error fetching artist details:', error);
    }
  };

  const handleSelectArtist = async (artistId) => {
    try {
      await axios.patch(`${API}/orders/custom/${createdOrder.id}/select-artist?artist_id=${artistId}`);
      toast.success('Order sent to artist for acceptance! You will be notified once they respond.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to send order to artist');
    }
  };

  if (!user) {
    return navigate('/auth');
  }

  return (
    <div className=\"min-h-screen\">
      <Navigation user={user} onLogout={onLogout} />

      <div className=\"pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12\">
        {step === 1 && (
          <Card className=\"max-w-3xl mx-auto\">
            <CardHeader>
              <CardTitle className=\"text-3xl\">Create Custom Order</CardTitle>
              <CardDescription>Tell us about your artwork requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrder} className=\"space-y-6\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"title\">Project Title</Label>
                  <Input
                    data-testid=\"order-title\"
                    id=\"title\"
                    name=\"title\"
                    value={orderForm.title}
                    onChange={handleOrderChange}
                    placeholder=\"e.g., Abstract Painting for Living Room\"
                    required
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"description\">Detailed Description</Label>
                  <Textarea
                    data-testid=\"order-description\"
                    id=\"description\"
                    name=\"description\"
                    value={orderForm.description}
                    onChange={handleOrderChange}
                    placeholder=\"Describe your vision, size requirements, color preferences, etc.\"
                    rows={5}
                    required
                  />
                </div>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div className=\"space-y-2\">
                    <Label>Art Category</Label>
                    <Select value={orderForm.category} onValueChange={(value) => setOrderForm({ ...orderForm, category: value })}>
                      <SelectTrigger data-testid=\"order-category\">
                        <SelectValue placeholder=\"Select category\" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"budget\">Budget</Label>
                    <div className=\"flex space-x-2\">
                      <Input
                        data-testid=\"order-budget\"
                        id=\"budget\"
                        name=\"budget\"
                        type=\"number\"
                        value={orderForm.budget}
                        onChange={handleOrderChange}
                        placeholder=\"5000\"
                        required
                      />
                      <Select value={orderForm.currency} onValueChange={(value) => setOrderForm({ ...orderForm, currency: value })}>
                        <SelectTrigger className=\"w-24\">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((curr) => (
                            <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"city\">Preferred City</Label>
                    <Input
                      data-testid=\"order-city\"
                      id=\"city\"
                      name=\"preferred_city\"
                      value={orderForm.preferred_city}
                      onChange={handleOrderChange}
                      placeholder=\"Chennai\"
                      required
                    />
                  </div>
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"pincode\">Pincode (Optional)</Label>
                    <Input
                      data-testid=\"order-pincode\"
                      id=\"pincode\"
                      name=\"preferred_pincode\"
                      value={orderForm.preferred_pincode}
                      onChange={handleOrderChange}
                      placeholder=\"600001\"
                    />
                  </div>
                </div>
                <Button data-testid=\"submit-order-btn\" type=\"submit\" className=\"w-full rounded-full\" size=\"lg\" disabled={loading}>
                  {loading ? 'Creating...' : 'Find Artists'} <ArrowRight className=\"ml-2 h-5 w-5\" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && createdOrder && (
          <div className=\"space-y-8\">
            <div className=\"text-center\">
              <h1 className=\"text-4xl font-medium mb-4\">Matched Artists</h1>
              <p className=\"text-lg text-muted-foreground\">
                We found {priorityArtists.length} artists from {createdOrder.preferred_city}
              </p>
            </div>

            {/* Priority Artists (Same Location) */}
            {priorityArtists.length > 0 && (
              <div className=\"space-y-6\">
                <div className=\"flex items-center space-x-2\">
                  <Badge className=\"bg-accent text-accent-foreground\">Priority</Badge>
                  <h2 className=\"text-2xl font-medium\">Artists from {createdOrder.preferred_city}</h2>
                </div>
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                  {priorityArtists.map((artist) => (
                    <Card key={artist.id} data-testid={`priority-artist-${artist.id}`} className=\"hover:border-accent/50 transition-colors\">
                      <CardHeader>
                        <div className=\"flex items-start justify-between mb-3\">
                          <div className=\"flex items-center space-x-2\">
                            <MapPin className=\"h-4 w-4 text-muted-foreground\" />
                            <span className=\"text-sm text-muted-foreground\">{artist.city}</span>
                          </div>
                          <div className=\"flex items-center space-x-1\">
                            <Star className=\"h-4 w-4 fill-accent text-accent\" />
                            <span className=\"text-sm font-medium\">{artist.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <CardTitle className=\"text-lg\">Artist Profile</CardTitle>
                        <CardDescription className=\"line-clamp-2\">{artist.bio || 'Experienced artisan'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className=\"mb-4\">
                          <p className=\"text-sm font-medium mb-2\">Skills</p>
                          <div className=\"flex flex-wrap gap-1\">
                            {artist.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant=\"secondary\" className=\"text-xs\">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        {artist.artworks && artist.artworks.length > 0 && (
                          <div className=\"mb-4\">
                            <p className=\"text-sm font-medium mb-2\">Sample Works</p>
                            <div className=\"grid grid-cols-3 gap-2\">
                              {artist.artworks.map((artwork) => (
                                <img
                                  key={artwork.id}
                                  src={artwork.image_url}
                                  alt={artwork.title}
                                  className=\"w-full h-20 object-cover rounded\"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className=\"text-sm text-muted-foreground mb-4\">
                          {artist.total_orders} completed orders
                        </div>
                        <Button 
                          data-testid={`select-artist-${artist.id}`}
                          onClick={() => handleSelectArtist(artist.id)}
                          className=\"w-full rounded-full\"
                        >
                          Send Request to Artist
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {priorityArtists.length === 0 && (
              <Card className=\"text-center p-12\">
                <p className=\"text-muted-foreground mb-4\">No artists found in {createdOrder.preferred_city}</p>
                <Button onClick={() => setShowOtherLocations(true)} variant=\"outline\" className=\"rounded-full\">
                  View Artists from Other Locations
                </Button>
              </Card>
            )}

            {/* Other Location Artists */}
            {otherArtists.length > 0 && (
              <div className=\"space-y-6 mt-12\">
                {!showOtherLocations ? (
                  <Card className=\"text-center p-8\">
                    <p className=\"text-lg mb-4\">Not satisfied with the above options?</p>
                    <Button 
                      data-testid=\"show-other-locations\"
                      onClick={() => setShowOtherLocations(true)}
                      variant=\"outline\"
                      className=\"rounded-full\"
                      size=\"lg\"
                    >
                      Browse Artists from All Locations ({otherArtists.length} available)
                    </Button>
                  </Card>
                ) : (
                  <>
                    <div className=\"flex items-center space-x-2\">
                      <h2 className=\"text-2xl font-medium\">Artists from Other Locations</h2>
                    </div>
                    <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                      {otherArtists.map((artist) => (
                        <Card key={artist.id} data-testid={`other-artist-${artist.id}`} className=\"hover:border-accent/50 transition-colors\">
                          <CardHeader>
                            <div className=\"flex items-start justify-between mb-3\">
                              <div className=\"flex items-center space-x-2\">
                                <MapPin className=\"h-4 w-4 text-muted-foreground\" />
                                <span className=\"text-sm text-muted-foreground\">{artist.city}</span>
                              </div>
                              <div className=\"flex items-center space-x-1\">
                                <Star className=\"h-4 w-4 fill-accent text-accent\" />
                                <span className=\"text-sm font-medium\">{artist.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <CardTitle className=\"text-lg\">Artist Profile</CardTitle>
                            <CardDescription className=\"line-clamp-2\">{artist.bio || 'Experienced artisan'}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className=\"mb-4\">
                              <p className=\"text-sm font-medium mb-2\">Skills</p>
                              <div className=\"flex flex-wrap gap-1\">
                                {artist.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant=\"secondary\" className=\"text-xs\">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            {artist.artworks && artist.artworks.length > 0 && (
                              <div className=\"mb-4\">
                                <p className=\"text-sm font-medium mb-2\">Sample Works</p>
                                <div className=\"grid grid-cols-3 gap-2\">
                                  {artist.artworks.map((artwork) => (
                                    <img
                                      key={artwork.id}
                                      src={artwork.image_url}
                                      alt={artwork.title}
                                      className=\"w-full h-20 object-cover rounded\"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className=\"text-sm text-muted-foreground mb-4\">
                              {artist.total_orders} completed orders
                            </div>
                            <Button 
                              data-testid={`select-other-artist-${artist.id}`}
                              onClick={() => handleSelectArtist(artist.id)}
                              className=\"w-full rounded-full\"
                            >
                              Send Request to Artist
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
