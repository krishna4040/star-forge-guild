import { isAfter, parseISO } from 'date-fns';
import type { GitHubRepo, FilterOptions } from '@/types/github';

export function filterRepositories(repos: GitHubRepo[], filters: FilterOptions): GitHubRepo[] {
  return repos.filter(repo => {
    // Language filter
    if (filters.language && filters.language !== 'all') {
      const repoLang = repo.language?.toLowerCase() || 'other';
      if (repoLang !== filters.language.toLowerCase()) {
        return false;
      }
    }

    // Updated after filter
    if (filters.updatedAfter) {
      const repoUpdated = parseISO(repo.updated_at);
      if (!isAfter(repoUpdated, filters.updatedAfter)) {
        return false;
      }
    }

    // Repository type filter
    if (filters.repoType && filters.repoType !== 'all') {
      switch (filters.repoType) {
        case 'template':
          if (!repo.template) return false;
          break;
        case 'fork':
          if (!repo.fork) return false;
          break;
        case 'source':
          if (repo.fork || repo.template) return false;
          break;
        case 'archived':
          if (!repo.archived) return false;
          break;
      }
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      const nameMatch = repo.name.toLowerCase().includes(searchTerm);
      const descMatch = repo.description?.toLowerCase().includes(searchTerm);
      const topicMatch = repo.topics.some(topic => topic.toLowerCase().includes(searchTerm));
      
      if (!nameMatch && !descMatch && !topicMatch) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueLanguages(repos: GitHubRepo[]): string[] {
  const languages = new Set<string>();
  repos.forEach(repo => {
    languages.add(repo.language || 'Other');
  });
  return Array.from(languages).sort();
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    'JavaScript': 'hsl(var(--lang-javascript))',
    'TypeScript': 'hsl(var(--lang-typescript))',
    'Python': 'hsl(var(--lang-python))',
    'Java': 'hsl(var(--lang-java))',
    'Go': 'hsl(var(--lang-go))',
    'Rust': 'hsl(var(--lang-rust))',
    'C++': 'hsl(var(--lang-cpp))',
    'HTML': 'hsl(var(--lang-html))',
    'CSS': 'hsl(var(--lang-css))',
    'PHP': 'hsl(var(--lang-php))',
    'Other': 'hsl(var(--muted-foreground))',
  };
  
  return colors[language] || colors['Other'];
}

export function sortRepositories(repos: GitHubRepo[], sortBy: 'updated' | 'stars' | 'name'): GitHubRepo[] {
  return [...repos].sort((a, b) => {
    switch (sortBy) {
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}