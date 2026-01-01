import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Palette, Plus, Upload, Image, LogOut, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = ['Acrylic Colors', 'Watercolors', 'Pencil Work', 'Pastels', 'Indian Ink', 'Illustrations', 'Visual Art', 'Digital Art'];

export default function ArtistDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [profileForm, setProfileForm] = useState({
    bio: '',
    skills: [],
    city: '',
    pincode: '',
    portfolio_images: []
  });
  const [artworkForm, setArtworkForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    currency: 'INR',
    image_url: '',
    dimensions: ''
  });
  const [exhibitionForm, setExhibitionForm] = useState({
    title: '',
    description: '',
    artwork_ids: [],
    duration_days: 3
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchArtworks();
      fetchExhibitions();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/artists/profile/${user.id}`);
      setProfile(response.data);
      setProfileForm({
        bio: response.data.bio,
        skills: response.data.skills,
        city: response.data.city,
        pincode: response.data.pincode,
        portfolio_images: response.data.portfolio_images
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // Profile doesn't exist
        console.log('Profile not found');
      }
    }
  };

  const fetchArtworks = async () => {
    try {
      const response = await axios.get(`${API}/artworks?artist_id=${profile.id}`);
      setArtworks(response.data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const fetchExhibitions = async () => {
    try {
      const response = await axios.get(`${API}/exhibitions?artist_id=${profile.id}&status=active`);
      setExhibitions(response.data);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
    }
  };

  const handleProfileCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/artists/profile`, {
        ...profileForm,
        user_id: user.id
      });
      toast.success('Profile created successfully!');
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  const handleArtworkCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/artworks`, {
        ...artworkForm,
        artist_id: profile.id,
        price: parseFloat(artworkForm.price)
      });
      toast.success('Artwork added!');
      fetchArtworks();
      setArtworkForm({
        title: '',
        description: '',
        category: '',
        price: '',
        currency: 'INR',
        image_url: '',
        dimensions: ''
      });
    } catch (error) {
      toast.error('Failed to add artwork');
    }
  };

  const handleExhibitionCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/exhibitions`, {
        ...exhibitionForm,
        artist_id: profile.id
      });
      toast.success('Exhibition created! Proceed to payment.');
      // Redirect to payment
      const paymentResponse = await axios.post(
        `${API}/payments/checkout`,
        {
          user_id: user.id,
          order_type: 'exhibition',
          amount: response.data.price_paid,
          currency: 'INR',
          metadata: { exhibition_id: response.data.id }
        },
        { headers: { 'origin': window.location.origin } }
      );
      window.location.href = paymentResponse.data.url;
    } catch (error) {
      toast.error('Failed to create exhibition');
    }
  };

  const handlePayAnnualFee = async () => {
    try {
      const response = await axios.post(
        `${API}/payments/checkout`,
        {
          user_id: user.id,
          order_type: 'artist_annual',
          amount: 500.0,
          currency: 'INR',
          metadata: { fee_type: 'annual_artist_fee' }
        },
        { headers: { 'origin': window.location.origin } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  const handleSkillToggle = (skill) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleArtworkSelect = (artworkId) => {
    setExhibitionForm((prev) => ({
      ...prev,
      artwork_ids: prev.artwork_ids.includes(artworkId)
        ? prev.artwork_ids.filter((id) => id !== artworkId)
        : [...prev.artwork_ids, artworkId]
    }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Create Your Artist Profile</CardTitle>
            <CardDescription>Let's set up your profile to start showcasing your work</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  data-testid="profile-bio"
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        data-testid={`skill-${skill}`}
                        checked={profileForm.skills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <label className="text-sm">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    data-testid="profile-city"
                    id="city"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    data-testid="profile-pincode"
                    id="pincode"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button data-testid="create-profile-btn" type="submit" className="w-full rounded-full">
                Create Profile
              </Button>
            </form>
          </CardContent>
        </Card>
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button data-testid="logout-btn" onClick={onLogout} variant="ghost" className="rounded-full">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Artist Dashboard</h1>
          {!profile.annual_fee_paid && (
            <Card data-testid="annual-fee-card" className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle>Annual Fee Required</CardTitle>
                <CardDescription>Pay ₹500 annual fee to start receiving orders and display artworks</CardDescription>
              </CardHeader>
              <CardContent>
                <Button data-testid="pay-annual-fee-btn" onClick={handlePayAnnualFee} className="rounded-full">
                  <DollarSign className="h-4 w-4 mr-2" /> Pay ₹500 Annual Fee
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card data-testid="stat-earnings">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{profile.total_earnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-orders">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{profile.total_orders}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-artworks">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Artworks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{artworks.length}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-exhibitions">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Exhibitions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{exhibitions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Dialog>
            <DialogTrigger asChild>
              <Card data-testid="add-artwork-card" className="cursor-pointer hover:border-accent/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Plus className="h-16 w-16 text-accent mb-4" />
                  <h3 className="text-xl font-medium">Add Artwork</h3>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Artwork</DialogTitle>
                <DialogDescription>Upload your artwork to your portfolio</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleArtworkCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artwork-title">Title</Label>
                  <Input
                    data-testid="artwork-title"
                    id="artwork-title"
                    value={artworkForm.title}
                    onChange={(e) => setArtworkForm({ ...artworkForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artwork-description">Description</Label>
                  <Textarea
                    data-testid="artwork-description"
                    id="artwork-description"
                    value={artworkForm.description}
                    onChange={(e) => setArtworkForm({ ...artworkForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={artworkForm.category} onValueChange={(value) => setArtworkForm({ ...artworkForm, category: value })}>
                      <SelectTrigger data-testid="artwork-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artwork-price">Price (INR)</Label>
                    <Input
                      data-testid="artwork-price"
                      id="artwork-price"
                      type="number"
                      value={artworkForm.price}
                      onChange={(e) => setArtworkForm({ ...artworkForm, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artwork-image">Image URL</Label>
                  <Input
                    data-testid="artwork-image-url"
                    id="artwork-image"
                    value={artworkForm.image_url}
                    onChange={(e) => setArtworkForm({ ...artworkForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <Button data-testid="submit-artwork-btn" type="submit" className="w-full rounded-full">
                  Add Artwork
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card data-testid="create-exhibition-card" className="cursor-pointer hover:border-accent/50 transition-colors" disabled={!profile.annual_fee_paid}>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Gallery className="h-16 w-16 text-accent mb-4" />
                  <h3 className="text-xl font-medium">Create Exhibition</h3>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Virtual Exhibition</DialogTitle>
                <DialogDescription>₹1000 for 3 days (10 artworks max)</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleExhibitionCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exhibition-title">Title</Label>
                  <Input
                    data-testid="exhibition-title"
                    id="exhibition-title"
                    value={exhibitionForm.title}
                    onChange={(e) => setExhibitionForm({ ...exhibitionForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exhibition-description">Description</Label>
                  <Textarea
                    data-testid="exhibition-description"
                    id="exhibition-description"
                    value={exhibitionForm.description}
                    onChange={(e) => setExhibitionForm({ ...exhibitionForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exhibition-duration">Duration (days)</Label>
                  <Input
                    data-testid="exhibition-duration"
                    id="exhibition-duration"
                    type="number"
                    min="3"
                    value={exhibitionForm.duration_days}
                    onChange={(e) => setExhibitionForm({ ...exhibitionForm, duration_days: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Artworks (Max 10)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {artworks.map((artwork) => (
                      <div key={artwork.id} className="flex items-center space-x-2">
                        <Checkbox
                          data-testid={`artwork-select-${artwork.id}`}
                          checked={exhibitionForm.artwork_ids.includes(artwork.id)}
                          onCheckedChange={() => handleArtworkSelect(artwork.id)}
                          disabled={exhibitionForm.artwork_ids.length >= 10 && !exhibitionForm.artwork_ids.includes(artwork.id)}
                        />
                        <label className="text-sm">{artwork.title}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button data-testid="submit-exhibition-btn" type="submit" className="w-full rounded-full" disabled={exhibitionForm.artwork_ids.length === 0}>
                  Create & Pay
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Artworks */}
        <div>
          <h2 className="text-3xl font-medium mb-6">My Artworks</h2>
          {artworks.length === 0 ? (
            <p className="text-muted-foreground">No artworks yet. Add your first artwork to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <Card key={artwork.id} data-testid={`my-artwork-${artwork.id}`} className="group overflow-hidden">
                  <img src={artwork.image_url} alt={artwork.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" />
                  <CardHeader>
                    <CardTitle className="text-lg">{artwork.title}</CardTitle>
                    <CardDescription>{artwork.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-accent">₹{artwork.price}</p>
                    <p className="text-sm text-muted-foreground">{artwork.status}</p>
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