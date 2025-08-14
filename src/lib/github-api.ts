import type { GitHubUser, GitHubRepo, GitHubStarredList } from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>('/user');
  }

  async getStarredRepos(page = 1, perPage = 100): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>(`/user/starred?page=${page}&per_page=${perPage}&sort=updated`);
  }

  async getAllStarredRepos(): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const repos = await this.getStarredRepos(page, perPage);
      allRepos.push(...repos);

      if (repos.length < perPage) {
        break; // Last page
      }
      page++;
    }

    return allRepos;
  }

  // Note: GitHub Lists API is limited - this is a placeholder for when it becomes available
  // For now, we'll simulate lists with grouping logic
  async getStarredLists(): Promise<GitHubStarredList[]> {
    // Placeholder - GitHub doesn't have public lists API yet
    // We'll create virtual lists based on topics, languages, etc.
    const repos = await this.getAllStarredRepos();
    
    // Create virtual lists
    const languageGroups = new Map<string, GitHubRepo[]>();
    const topicGroups = new Map<string, GitHubRepo[]>();
    
    repos.forEach(repo => {
      // Group by language
      const lang = repo.language || 'Other';
      if (!languageGroups.has(lang)) {
        languageGroups.set(lang, []);
      }
      languageGroups.get(lang)!.push(repo);

      // Group by topics
      repo.topics.forEach(topic => {
        if (!topicGroups.has(topic)) {
          topicGroups.set(topic, []);
        }
        topicGroups.get(topic)!.push(repo);
      });
    });

    const lists: GitHubStarredList[] = [];

    // Add "All Stars" list
    lists.push({
      id: 0,
      name: 'All Stars',
      description: 'All your starred repositories',
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      repository_count: repos.length,
    });

    // Add language-based lists
    languageGroups.forEach((repos, language) => {
      if (repos.length > 2) { // Only show languages with multiple repos
        lists.push({
          id: lists.length,
          name: `${language} Projects`,
          description: `Repositories written in ${language}`,
          visibility: 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          repository_count: repos.length,
        });
      }
    });

    // Add topic-based lists
    topicGroups.forEach((repos, topic) => {
      if (repos.length > 3) { // Only show topics with multiple repos
        lists.push({
          id: lists.length,
          name: topic.charAt(0).toUpperCase() + topic.slice(1),
          description: `Repositories tagged with ${topic}`,
          visibility: 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          repository_count: repos.length,
        });
      }
    });

    return lists;
  }

  async getReposInList(listId: number): Promise<GitHubRepo[]> {
    const allRepos = await this.getAllStarredRepos();
    
    if (listId === 0) {
      return allRepos; // All stars
    }

    const lists = await this.getStarredLists();
    const list = lists.find(l => l.id === listId);
    
    if (!list) {
      return [];
    }

    // Filter repos based on list type
    if (list.name.includes('Projects')) {
      const language = list.name.replace(' Projects', '');
      return allRepos.filter(repo => (repo.language || 'Other') === language);
    }

    // Topic-based list
    const topic = list.name.toLowerCase();
    return allRepos.filter(repo => repo.topics.includes(topic));
  }
}