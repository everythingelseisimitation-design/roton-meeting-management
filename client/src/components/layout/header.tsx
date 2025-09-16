import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewMeeting?: () => void;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, onNewMeeting, children }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="page-header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground" data-testid="page-subtitle">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {onNewMeeting && (
            <Button 
              onClick={onNewMeeting}
              data-testid="button-header-new-meeting"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Button>
          )}
          {children}
        </div>
      </div>
    </header>
  );
}
