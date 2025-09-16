import { useLocation } from "wouter";
import { Calendar, Music, Users, CheckCircle, BarChart3, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Focus Songs', href: '/focus-songs', icon: Music },
  { name: 'Tasks', href: '/tasks', icon: CheckCircle },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Meetings', href: '/meetings', icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Roton Meetings</h1>
            <p className="text-sm text-muted-foreground">Team Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" data-testid="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "nav-item flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "active bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground" data-testid="user-name">
                {user && typeof user === 'object' && 'firstName' in user && 'lastName' in user && user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="user-role">Team Member</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
