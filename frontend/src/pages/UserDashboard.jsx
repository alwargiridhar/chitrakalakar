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
import { toast } from 'sonner';
import { Palette, ShoppingCart, Package, LogOut } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = ['Acrylic Colors', 'Watercolors', 'Pencil Work', 'Pastels', 'Indian Ink', 'Illustrations', 'Visual Art', 'Digital Art'];
const CURRENCIES = ['INR', 'USD', 'EUR'];

export default function UserDashboard({ user, onLogout }) {
  const [artworks, setArtworks] = useState([]);
  const [allLocationArtworks, setAllLocationArtworks] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    currency: 'INR',
    preferred_city: '',
    preferred_pincode: ''
  });

  useEffect(() => {
    fetchArtworks();
    fetchMyOrders();
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await axios.get(`${API}/featured/artworks`);
      setArtworks(response.data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/custom/user/${user.id}`);
      setMyOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

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
      toast.success(`Order created! ${response.data.matched_artists.length} artists matched.`);
      fetchMyOrders();
      setOrderForm({
        title: '',
        description: '',
        category: '',
        budget: '',
        currency: 'INR',
        preferred_city: '',
        preferred_pincode: ''
      });
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipPurchase = async () => {
    try {
      const response = await axios.post(
        `${API}/payments/checkout`,
        {
          user_id: user.id,
          order_type: 'membership',
          amount: 1000.0,
          currency: 'INR',
          metadata: { membership_type: 'annual' }
        },
        { headers: { 'origin': window.location.origin } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

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
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Dashboard</h1>
          {!user.has_membership && (
            <Card data-testid="membership-card" className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle>Unlock Premium Benefits</CardTitle>
                <CardDescription>Get a membership to save 10% on all purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <Button data-testid="buy-membership-btn" onClick={handleMembershipPurchase} className="rounded-full">
                  Buy Membership - ₹1000/year
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Dialog>
            <DialogTrigger asChild>
              <Card data-testid="create-order-card" className="cursor-pointer hover:border-accent/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Package className="h-16 w-16 text-accent mb-4" />
                  <h3 className="text-xl font-medium">Create Custom Order</h3>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Order</DialogTitle>
                <DialogDescription>Describe your artwork requirements</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input data-testid="order-title" id="title" name="title" value={orderForm.title} onChange={handleOrderChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea data-testid="order-description" id="description" name="description" value={orderForm.description} onChange={handleOrderChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={orderForm.category} onValueChange={(value) => setOrderForm({ ...orderForm, category: value })}>
                      <SelectTrigger data-testid="order-category">
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
                    <Label htmlFor="budget">Budget</Label>
                    <div className="flex space-x-2">
                      <Input data-testid="order-budget" id="budget" name="budget" type="number" value={orderForm.budget} onChange={handleOrderChange} required />
                      <Select value={orderForm.currency} onValueChange={(value) => setOrderForm({ ...orderForm, currency: value })}>
                        <SelectTrigger className="w-24">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input data-testid="order-city" id="city" name="preferred_city" value={orderForm.preferred_city} onChange={handleOrderChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input data-testid="order-pincode" id="pincode" name="preferred_pincode" value={orderForm.preferred_pincode} onChange={handleOrderChange} />
                  </div>
                </div>
                <Button data-testid="submit-order-btn" type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Link to="/exhibitions">
            <Card data-testid="browse-exhibitions-card" className="cursor-pointer hover:border-accent/50 transition-colors h-full">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <ShoppingCart className="h-16 w-16 text-accent mb-4" />
                <h3 className="text-xl font-medium">Browse Exhibitions</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* My Orders */}
        <div className="mb-12">
          <h2 className="text-3xl font-medium mb-6">My Orders</h2>
          {myOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myOrders.map((order) => (
                <Card key={order.id} data-testid={`order-${order.id}`}>
                  <CardHeader>
                    <CardTitle>{order.title}</CardTitle>
                    <CardDescription>{order.category} - {order.budget} {order.currency}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                    <p className="text-sm">Status: <span className="font-medium text-accent">{order.status}</span></p>
                    <p className="text-sm">Matched Artists: {order.matched_artists.length}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Featured Artworks */}
        <div>
          <h2 className="text-3xl font-medium mb-6">Featured Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id} data-testid={`artwork-${artwork.id}`} className="group overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}