import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert } from "react-native";

import { persistCoverAsset, useLibrary } from "@/entities/library";
import type { Playlist } from "@/entities/playlist";

import type { PlaylistEditorState } from "./types";

export function usePlaylistEditor() {
  const { createPlaylist, updatePlaylist } = useLibrary();
  const [editor, setEditor] = useState<PlaylistEditorState | null>(null);

  const openEditor = (playlist?: Playlist) => {
    setEditor({
      playlistId: playlist?.id,
      title: playlist?.title ?? "",
      description: playlist?.description ?? "",
      coverUri: playlist?.coverUri,
    });
  };

  const closeEditor = () => setEditor(null);

  const updateEditor = (changes: Partial<PlaylistEditorState>) => {
    setEditor((current) => (current ? { ...current, ...changes } : current));
  };

  const selectCover = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const coverAsset = result.assets[0];
      updateEditor({ coverAsset, coverUri: coverAsset.uri });
    }
  };

  const saveEditor = () => {
    if (!editor || !editor.title.trim()) {
      return;
    }

    let coverUri = editor.coverUri;
    if (editor.coverAsset) {
      try {
        coverUri = persistCoverAsset(editor.coverAsset);
      } catch {
        Alert.alert("Cover error", "The selected image could not be saved.");
        return;
      }
    }

    const input = {
      title: editor.title.trim(),
      description: editor.description.trim(),
      coverUri,
    };

    if (editor.playlistId) {
      updatePlaylist(editor.playlistId, input);
    } else {
      createPlaylist(input);
    }
    closeEditor();
  };

  return {
    closeEditor,
    editor,
    openEditor,
    saveEditor,
    selectCover,
    updateEditor,
  };
}
