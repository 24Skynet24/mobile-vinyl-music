export type SortType = 'duration' | 'alphabet' | 'date-added';

export type SearchToolbarProps = {
  placeholder: string;
  query?: string;
  selectedSort?: SortType;
  showSort?: boolean;
  onQueryChange?: (query: string) => void;
  onSortChange?: (sortType: SortType) => void;
};

export type SortOption = {
  label: string;
  value: SortType;
};
