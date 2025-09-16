import Sidebar from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 bg-muted/30" data-testid="main-content">
        {children}
      </main>
    </div>
  );
}
