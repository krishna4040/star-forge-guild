import React from 'react';
import { Star, GitFork, ExternalLink, Archive, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLanguageColor } from '@/lib/filters';
import type { GitHubRepo } from '@/types/github';

interface RepositoryCardProps {
  repo: GitHubRepo;
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  const languageColor = getLanguageColor(repo.language || 'Other');

  return (
    <Card className="hover:shadow-md transition-shadow border border-github-border-default">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-base text-primary hover:underline">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1"
                >
                  <span className="truncate">{repo.name}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </h3>
              
              <div className="flex items-center space-x-1">
                {repo.archived && (
                  <Badge variant="secondary" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
                {repo.fork && (
                  <Badge variant="secondary" className="text-xs">
                    <GitFork className="h-3 w-3 mr-1" />
                    Fork
                  </Badge>
                )}
                {repo.template && (
                  <Badge variant="secondary" className="text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    Template
                  </Badge>
                )}
              </div>
            </div>

            {repo.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {repo.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {repo.language && (
                <div className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: languageColor }}
                  />
                  <span>{repo.language}</span>
                </div>
              )}

              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{repo.stargazers_count.toLocaleString()}</span>
              </div>

              <div className="flex items-center space-x-1">
                <GitFork className="h-4 w-4" />
                <span>{repo.forks_count.toLocaleString()}</span>
              </div>

              <span>
                Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
              </span>
            </div>

            {repo.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {repo.topics.slice(0, 5).map(topic => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="text-xs bg-primary/5 text-primary border-primary/20"
                  >
                    {topic}
                  </Badge>
                ))}
                {repo.topics.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{repo.topics.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}