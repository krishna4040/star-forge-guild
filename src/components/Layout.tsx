import React from 'react';
import { Star, Github, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
}

export function Layout({ children, onRefresh, isRefreshing, lastUpdated }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-github-canvas">
      <header className="bg-card border-b border-github-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">GitHub Star Organizer</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="btn-github-secondary"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}

              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.login} />
                      <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.login}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-github-canvas-subtle border-t border-github-border-muted mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Github className="h-4 w-4" />
            <span className="text-sm">GitHub Star Organizer - Built with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}