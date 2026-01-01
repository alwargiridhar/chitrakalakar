import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ContactPage({ user, onLogout }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      <Navigation user={user} onLogout={onLogout} />

      <div className="pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
              Get In Touch
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card data-testid="contact-email" className="text-center">
              <CardContent className="pt-8">
                <Mail className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="font-medium mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">info@chitrakalakar.com</p>
              </CardContent>
            </Card>
            <Card data-testid="contact-phone" className="text-center">
              <CardContent className="pt-8">
                <Phone className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="font-medium mb-2">Phone</h3>
                <p className="text-sm text-muted-foreground">+91 9884984454</p>
              </CardContent>
            </Card>
            <Card data-testid="contact-location" className="text-center">
              <CardContent className="pt-8">
                <MapPin className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="font-medium mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">Chennai, India</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      data-testid="contact-name"
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email-input">Email</Label>
                    <Input
                      data-testid="contact-email-input"
                      id="contact-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input
                    data-testid="contact-subject"
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    data-testid="contact-message"
                    id="contact-message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button data-testid="contact-submit" type="submit" className="w-full rounded-full" size="lg">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
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