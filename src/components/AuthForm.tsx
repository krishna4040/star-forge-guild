import React, { useState } from 'react';
import { Github, Key, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

export function AuthForm() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (tokenType: 'oauth' | 'personal') => {
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(token.trim(), tokenType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-github-canvas p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Github className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect to GitHub</CardTitle>
          <CardDescription>
            Access your starred repositories with a GitHub token
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Token</TabsTrigger>
              <TabsTrigger value="oauth">OAuth Token</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personal-token">Personal Access Token</Label>
                <Input
                  id="personal-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Create a token at{' '}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    github.com/settings/tokens
                  </a>{' '}
                  with "repo" scope
                </p>
              </div>

              <Button
                onClick={() => handleSubmit('personal')}
                disabled={isLoading}
                className="w-full btn-github-primary"
              >
                <Key className="h-4 w-4 mr-2" />
                {isLoading ? 'Connecting...' : 'Connect with Token'}
              </Button>
            </TabsContent>

            <TabsContent value="oauth" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oauth-token">OAuth Access Token</Label>
                <Input
                  id="oauth-token"
                  type="password"
                  placeholder="gho_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Use an OAuth token from your GitHub App
                </p>
              </div>

              <Button
                onClick={() => handleSubmit('oauth')}
                disabled={isLoading}
                className="w-full btn-github-primary"
              >
                <Github className="h-4 w-4 mr-2" />
                {isLoading ? 'Connecting...' : 'Connect with OAuth'}
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Required permissions:</p>
              <ul className="text-xs space-y-1">
                <li>• Read access to starred repositories</li>
                <li>• Read access to user profile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}