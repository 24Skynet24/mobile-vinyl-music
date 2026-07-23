import type { SortType } from "@/shared/ui/search-toolbar";

export interface MusicPanelProps {
  onClose: () => void;
  onSortChange: (sort: SortType) => void;
  playlistId?: string | null;
  sort: SortType;
}
