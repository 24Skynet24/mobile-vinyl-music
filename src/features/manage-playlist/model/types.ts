import type * as DocumentPicker from "expo-document-picker";

export type PlaylistEditorState = {
  coverAsset?: DocumentPicker.DocumentPickerAsset;
  coverUri?: string;
  description: string;
  playlistId?: string;
  title: string;
};
