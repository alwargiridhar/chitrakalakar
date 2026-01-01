import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Users, Award } from 'lucide-react';

export default function LandingPage({ user, onLogout }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header data-testid="header" className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div data-testid="logo" className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-medium">ChitraKalakar</h1>
          </div>
          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button data-testid="dashboard-btn" variant="ghost" className="rounded-full">Dashboard</Button>
                </Link>
                <Button data-testid="logout-btn" onClick={onLogout} variant="ghost" className="rounded-full">Logout</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button data-testid="signin-btn" className="rounded-full px-8 py-6">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section data-testid="hero-section" className="pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm tracking-widest uppercase font-semibold text-muted-foreground mb-4">Welcome to ChitraKalakar</p>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
                Give Life To Your Imagination
              </h1>
              <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground mb-8">
                Connect with talented artisans, commission custom artwork, and explore virtual exhibitions from artists across the globe.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button data-testid="get-started-btn" size="lg" className="rounded-full px-8 py-6 text-base font-medium transition-all hover:scale-105 active:scale-95">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/exhibitions">
                  <Button data-testid="browse-exhibitions-btn" size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-medium">
                    Browse Exhibitions
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1759143102721-929f34e42a6a?crop=entropy&cs=srgb&fm=jpg&q=85" 
                alt="Artist painting in studio"
                className="w-full h-[500px] object-cover rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section data-testid="features-section" className="py-24 md:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Why Choose ChitraKalakar</h2>
            <p className="text-lg text-muted-foreground">A platform built for artists and art lovers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div data-testid="feature-card-1" className="bg-card border border-border/40 p-6 hover:border-accent/50 transition-colors duration-300">
              <Palette className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-medium mb-3">Custom Commissions</h3>
              <p className="text-muted-foreground leading-relaxed">Order bespoke artwork tailored to your vision. Connect with artists who match your style and budget.</p>
            </div>
            <div data-testid="feature-card-2" className="bg-card border border-border/40 p-6 hover:border-accent/50 transition-colors duration-300">
              <Users className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-medium mb-3">Virtual Exhibitions</h3>
              <p className="text-muted-foreground leading-relaxed">Artists can showcase their work in stunning virtual galleries, reaching a global audience.</p>
            </div>
            <div data-testid="feature-card-3" className="bg-card border border-border/40 p-6 hover:border-accent/50 transition-colors duration-300">
              <Award className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-medium mb-3">Location-Based Matching</h3>
              <p className="text-muted-foreground leading-relaxed">Find artists in your city for easy collaboration and delivery of physical artworks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-testid="cta-section" className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Ready to Start Your Journey?</h2>
          <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground mb-8">
            Join thousands of artists and art enthusiasts on ChitraKalakar
          </p>
          <Link to="/auth">
            <Button data-testid="join-now-btn" size="lg" className="rounded-full px-8 py-6 text-base font-medium transition-all hover:scale-105 active:scale-95">
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/30 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 ChitraKalakar. Give Life To Your Imagination.
          </p>
        </div>
      </footer>
    </div>
  );
}