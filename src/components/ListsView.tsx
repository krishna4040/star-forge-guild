import React from 'react';
import { Star, ChevronRight, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GitHubStarredList } from '@/types/github';

interface ListsViewProps {
  lists: GitHubStarredList[];
  onSelectList: (listId: number) => void;
}

export function ListsView({ lists, onSelectList }: ListsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Star className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Your Starred Lists</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists.map(list => (
          <Card
            key={list.id}
            className="hover:shadow-md transition-all cursor-pointer border border-github-border-default hover:border-primary/30"
            onClick={() => onSelectList(list.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-base truncate">{list.name}</h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {list.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{list.repository_count || 0} repos</span>
                      </div>
                      
                      <Badge
                        variant={list.visibility === 'public' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {list.visibility}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(list.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lists.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No starred lists found</h3>
          <p className="text-muted-foreground">
            Start starring repositories on GitHub to see them organized here.
          </p>
        </div>
      )}
    </div>
  );
}