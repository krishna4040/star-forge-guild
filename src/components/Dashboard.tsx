import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { cacheManager } from '@/lib/cache';
import { Layout } from './Layout';
import { ListsView } from './ListsView';
import { RepositoryList } from './RepositoryList';
import type { GitHubStarredList, GitHubRepo } from '@/types/github';

export function Dashboard() {
  const { githubAPI } = useAuth();
  const [lists, setLists] = useState<GitHubStarredList[]>([]);
  const [selectedList, setSelectedList] = useState<GitHubStarredList | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    initializeCache();
    loadInitialData();
  }, []);

  const initializeCache = async () => {
    try {
      await cacheManager.init();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      setError(null);
      
      // Try to load from cache first
      const cachedLists = await cacheManager.get<GitHubStarredList[]>('starred-lists');
      const cacheTimestamp = await cacheManager.getLastUpdated('starred-lists');
      
      if (cachedLists && cacheTimestamp) {
        setLists(cachedLists);
        setLastUpdated(cacheTimestamp);
        setIsLoading(false);
      } else {
        // No cache, fetch fresh data
        await fetchFreshData();
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      setIsLoading(false);
    }
  };

  const fetchFreshData = async () => {
    if (!githubAPI) return;

    try {
      setIsRefreshing(true);
      setError(null);

      const fetchedLists = await githubAPI.getStarredLists();
      setLists(fetchedLists);

      // Cache the data
      await cacheManager.set('starred-lists', fetchedLists, 30 * 60 * 1000); // 30 minutes
      setLastUpdated(new Date());

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleSelectList = async (listId: number) => {
    if (!githubAPI) return;

    try {
      setError(null);
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      setSelectedList(list);

      // Try cache first
      const cacheKey = `repos-list-${listId}`;
      const cachedRepos = await cacheManager.get<GitHubRepo[]>(cacheKey);

      if (cachedRepos) {
        setRepositories(cachedRepos);
      } else {
        // Fetch fresh data
        const repos = await githubAPI.getReposInList(listId);
        setRepositories(repos);
        
        // Cache the repos
        await cacheManager.set(cacheKey, repos, 15 * 60 * 1000); // 15 minutes
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repositories');
    }
  };

  const handleBack = () => {
    setSelectedList(null);
    setRepositories([]);
  };

  const handleRefresh = async () => {
    if (selectedList) {
      // Refresh current list
      await cacheManager.delete(`repos-list-${selectedList.id}`);
      await handleSelectList(selectedList.id);
    } else {
      // Refresh lists
      await cacheManager.delete('starred-lists');
      await fetchFreshData();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your starred repositories...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lastUpdated={lastUpdated}
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedList ? (
        <RepositoryList
          list={selectedList}
          repositories={repositories}
          onBack={handleBack}
        />
      ) : (
        <ListsView
          lists={lists}
          onSelectList={handleSelectList}
        />
      )}
    </Layout>
  );
}