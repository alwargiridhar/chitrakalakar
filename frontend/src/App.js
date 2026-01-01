import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import UserDashboard from '@/pages/UserDashboard';
import ArtistDashboard from '@/pages/ArtistDashboard';
import ExhibitionPage from '@/pages/ExhibitionPage';
import ExhibitionArchivePage from '@/pages/ExhibitionArchivePage';
import ArtistProfilePage from '@/pages/ArtistProfilePage';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import AboutPage from '@/pages/AboutPage';
import ArtistsPage from '@/pages/ArtistsPage';
import ContactPage from '@/pages/ContactPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage user={user} onLogout={handleLogout} />} />
          <Route path="/about" element={<AboutPage user={user} onLogout={handleLogout} />} />
          <Route path="/artists" element={<ArtistsPage user={user} onLogout={handleLogout} />} />
          <Route path="/contact" element={<ContactPage user={user} onLogout={handleLogout} />} />
          <Route path="/custom-order" element={<CustomOrderPage user={user} onLogout={handleLogout} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                user.role === 'artist' ? (
                  <ArtistDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <UserDashboard user={user} onLogout={handleLogout} />
                )
              ) : (
                <Navigate to="/auth" />
              )
            } 
          />
          <Route path="/exhibitions" element={<ExhibitionPage user={user} onLogout={handleLogout} />} />
          <Route path="/exhibitions/archive" element={<ExhibitionArchivePage user={user} onLogout={handleLogout} />} />
          <Route path="/artist/:artistId" element={<ArtistProfilePage />} />
          <Route path="/payment-success" element={<PaymentSuccess user={user} />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;