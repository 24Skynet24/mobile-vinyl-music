export interface PlaylistPanelProps {
  onClose: () => void;
  onOpenPlaylist: (playlistId: string) => void;
}

export interface PlaylistItemProps {
  image?: string;
  trackCount: number;
  playlistTitle: string;
  playlistDescription: string;
  isProtected?: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
