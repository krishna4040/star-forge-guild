export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  archived: boolean;
  fork: boolean;
  template: boolean;
  visibility: 'public' | 'private';
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubStarredList {
  id: number;
  name: string;
  description: string | null;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  starred_at?: string;
  repository_count?: number;
}

export interface FilterOptions {
  language?: string;
  updatedAfter?: Date;
  repoType?: 'all' | 'template' | 'fork' | 'source' | 'archived';
  search?: string;
}

export interface CacheData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface AuthConfig {
  token?: string;
  tokenType: 'oauth' | 'personal';
}