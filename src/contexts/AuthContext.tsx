import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GitHubUser, AuthConfig } from '@/types/github';
import { GitHubAPI } from '@/lib/github-api';

interface AuthContextType {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, tokenType: 'oauth' | 'personal') => Promise<void>;
  logout: () => void;
  githubAPI: GitHubAPI | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'github-star-organizer-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [githubAPI, setGithubAPI] = useState<GitHubAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const authConfig: AuthConfig = JSON.parse(storedAuth);
        if (authConfig.token) {
          authenticateWithToken(authConfig.token);
        }
      } catch (error) {
        console.error('Failed to parse stored auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const authenticateWithToken = async (token: string) => {
    try {
      const api = new GitHubAPI(token);
      const userData = await api.getCurrentUser();
      
      setUser(userData);
      setGithubAPI(api);
      setIsLoading(false);
    } catch (error) {
      console.error('Authentication failed:', error);
      logout();
      throw error;
    }
  };

  const login = async (token: string, tokenType: 'oauth' | 'personal') => {
    setIsLoading(true);
    
    try {
      await authenticateWithToken(token);
      
      // Store auth config
      const authConfig: AuthConfig = { token, tokenType };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authConfig));
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setGithubAPI(null);
    setIsLoading(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    githubAPI,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}