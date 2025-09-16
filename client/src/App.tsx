import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import FocusSongs from "@/pages/focus-songs";
import Tasks from "@/pages/tasks";
import Team from "@/pages/team";
import Meetings from "@/pages/meetings";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Prefetch commonly used data once when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Prefetch shared data to avoid repeated API calls during navigation
      queryClient.prefetchQuery({ queryKey: ['/api/team-members'] });
      queryClient.prefetchQuery({ queryKey: ['/api/focus-songs'] });
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <MainLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/focus-songs" component={FocusSongs} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/team" component={Team} />
          <Route path="/meetings" component={Meetings} />
        </MainLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
