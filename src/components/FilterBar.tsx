import React from 'react';
import { Search, Filter, Calendar, Code2, Archive, GitFork, Copy, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { FilterOptions, GitHubRepo } from '@/types/github';
import { getUniqueLanguages } from '@/lib/filters';
import { subDays, subWeeks, subMonths } from 'date-fns';

interface FilterBarProps {
  repos: GitHubRepo[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({
  repos,
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const languages = getUniqueLanguages(repos);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleLanguageChange = (value: string) => {
    onFiltersChange({ ...filters, language: value === 'all' ? undefined : value });
  };

  const handleRepoTypeChange = (value: string) => {
    onFiltersChange({ ...filters, repoType: value as FilterOptions['repoType'] });
  };

  const handleDateFilterChange = (value: string) => {
    let updatedAfter: Date | undefined;
    
    switch (value) {
      case 'week':
        updatedAfter = subWeeks(new Date(), 1);
        break;
      case 'month':
        updatedAfter = subMonths(new Date(), 1);
        break;
      case '3months':
        updatedAfter = subMonths(new Date(), 3);
        break;
      case 'year':
        updatedAfter = subMonths(new Date(), 12);
        break;
      default:
        updatedAfter = undefined;
    }

    onFiltersChange({ ...filters, updatedAfter });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(filters.language || filters.updatedAfter || filters.repoType !== 'all' || filters.search);

  return (
    <Card className="border border-github-border-default">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filters.language || 'all'}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={
                  filters.updatedAfter
                    ? (() => {
                        const now = new Date();
                        const diff = now.getTime() - filters.updatedAfter.getTime();
                        const days = diff / (1000 * 60 * 60 * 24);
                        
                        if (days <= 7) return 'week';
                        if (days <= 31) return 'month';
                        if (days <= 93) return '3months';
                        if (days <= 365) return 'year';
                        return 'all';
                      })()
                    : 'all'
                }
                onValueChange={handleDateFilterChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Updated" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="week">Past week</SelectItem>
                  <SelectItem value="month">Past month</SelectItem>
                  <SelectItem value="3months">Past 3 months</SelectItem>
                  <SelectItem value="year">Past year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filters.repoType || 'all'}
                onValueChange={handleRepoTypeChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="source">
                    <div className="flex items-center space-x-2">
                      <span>Source</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fork">
                    <div className="flex items-center space-x-2">
                      <GitFork className="h-3 w-3" />
                      <span>Forks</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="template">
                    <div className="flex items-center space-x-2">
                      <Copy className="h-3 w-3" />
                      <span>Templates</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="archived">
                    <div className="flex items-center space-x-2">
                      <Archive className="h-3 w-3" />
                      <span>Archived</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results count and active filters */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} repositories
            </div>

            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <div className="flex items-center space-x-1">
                  {filters.language && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.language}
                    </Badge>
                  )}
                  {filters.updatedAfter && (
                    <Badge variant="secondary" className="text-xs">
                      Recently updated
                    </Badge>
                  )}
                  {filters.repoType && filters.repoType !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.repoType}
                    </Badge>
                  )}
                  {filters.search && (
                    <Badge variant="secondary" className="text-xs">
                      "{filters.search}"
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}