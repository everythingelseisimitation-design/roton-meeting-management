import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Music, Users, CheckCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Roton Meetings</h1>
                <p className="text-sm text-muted-foreground">Team Management Platform</p>
              </div>
            </div>
            <Button 
              onClick={handleLogin}
              data-testid="button-login"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Streamline Your Team Meetings
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage weekly meetings, track focus songs across all channels, and keep your team aligned with Roton's comprehensive meeting management platform.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            data-testid="button-get-started"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-3"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need to Manage Your Team
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-feature-meetings">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Weekly Meetings
                </h4>
                <p className="text-muted-foreground text-sm">
                  Schedule and manage Marketing, Focus Songs, Strategy, and Recap meetings with standardized agendas.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-focus-songs">
              <CardContent className="p-6 text-center">
                <Music className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Focus Songs Tracking
                </h4>
                <p className="text-muted-foreground text-sm">
                  Track progress across YouTube, social media, Spotify, and radio channels for each focus song.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-team">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Team Management
                </h4>
                <p className="text-muted-foreground text-sm">
                  Organize team members across Marketing, Digital, and A&R departments with clear responsibilities.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-tasks">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Task Management
                </h4>
                <p className="text-muted-foreground text-sm">
                  Assign tasks with deadlines, track progress, and ensure accountability across all team activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Designed for Roton's Team Structure
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="department-marketing">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Marketing</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>Press & Media Relations</li>
                <li>Social Media & Campaigns</li>
                <li>Radio & TV Promotion</li>
                <li>Content Creation</li>
                <li>Video Production</li>
              </ul>
            </div>

            <div className="text-center" data-testid="department-digital">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Digital</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>YouTube Management</li>
                <li>Digital Strategy</li>
                <li>Spotify Analytics</li>
                <li>Platform Optimization</li>
              </ul>
            </div>

            <div className="text-center" data-testid="department-ar">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">A&R & International</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>Artist Development</li>
                <li>International Partnerships</li>
                <li>Global Radio Relations</li>
                <li>Market Expansion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2023 Roton Team Meeting Manager. Streamlining music industry collaboration.
          </p>
        </div>
      </footer>
    </div>
  );
}
