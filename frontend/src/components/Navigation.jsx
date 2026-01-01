import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header data-testid="header" className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Palette className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-medium">ChitraKalakar</h1>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/about">
            <Button 
              data-testid="nav-about" 
              variant="ghost" 
              className={`rounded-full ${isActive('/about') ? 'text-accent' : ''}`}
            >
              About
            </Button>
          </Link>
          <Link to="/artists">
            <Button 
              data-testid="nav-artists" 
              variant="ghost" 
              className={`rounded-full ${isActive('/artists') ? 'text-accent' : ''}`}
            >
              Artists
            </Button>
          </Link>
          <Link to="/exhibitions">
            <Button 
              data-testid="nav-exhibitions" 
              variant="ghost" 
              className={`rounded-full ${isActive('/exhibitions') ? 'text-accent' : ''}`}
            >
              Exhibitions
            </Button>
          </Link>
          <Link to="/contact">
            <Button 
              data-testid="nav-contact" 
              variant="ghost" 
              className={`rounded-full ${isActive('/contact') ? 'text-accent' : ''}`}
            >
              Contact
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button data-testid="dashboard-btn" variant="ghost" className="rounded-full">Dashboard</Button>
              </Link>
              <Button data-testid="logout-btn" onClick={onLogout} variant="outline" className="rounded-full">Logout</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button data-testid="signin-btn" className="rounded-full px-8 py-6">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};