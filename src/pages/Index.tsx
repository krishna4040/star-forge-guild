import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-github-canvas">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <AuthForm />;
};

export default Index;
