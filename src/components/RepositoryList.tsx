import React, { useState, useMemo } from 'react';
import { ArrowLeft, Package, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RepositoryCard } from './RepositoryCard';
import { FilterBar } from './FilterBar';
import { filterRepositories, sortRepositories } from '@/lib/filters';
import type { GitHubRepo, GitHubStarredList, FilterOptions } from '@/types/github';

interface RepositoryListProps {
  list: GitHubStarredList;
  repositories: GitHubRepo[];
  onBack: () => void;
}

export function RepositoryList({ list, repositories, onBack }: RepositoryListProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');

  const filteredAndSortedRepos = useMemo(() => {
    const filtered = filterRepositories(repositories, filters);
    return sortRepositories(filtered, sortBy);
  }, [repositories, filters, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            {list.description && (
              <p className="text-muted-foreground">{list.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{repositories.length} repositories</span>
          </div>

          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="stars">Most stars</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        repos={repositories}
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={repositories.length}
        filteredCount={filteredAndSortedRepos.length}
      />

      {/* Repository Grid */}
      {filteredAndSortedRepos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {filteredAndSortedRepos.map(repo => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
          <p className="text-muted-foreground">
            {repositories.length === 0
              ? 'This list is empty.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      )}
    </div>
  );
}