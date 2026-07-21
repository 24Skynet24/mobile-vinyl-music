export type SortType = 'duration' | 'alphabet' | 'date-added';

export type SearchToolbarProps = {
  onSortChange?: (sortType: SortType) => void;
};

export type SortOption = {
  label: string;
  value: SortType;
};
