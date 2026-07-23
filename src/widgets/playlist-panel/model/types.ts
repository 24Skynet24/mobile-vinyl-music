import type * as DocumentPicker from "expo-document-picker";

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

export type PlaylistEditorState = {
  playlistId?: string;
  title: string;
  description: string;
  coverUri?: string;
  coverAsset?: DocumentPicker.DocumentPickerAsset;
};
