import type * as DocumentPicker from "expo-document-picker";

import type { ImportedTrackMetadata } from "@/entities/library";

export function metadataFromAsset(
  asset: DocumentPicker.DocumentPickerAsset,
): ImportedTrackMetadata {
  const rawTitle = asset.name.replace(/\.[^/.]+$/, "") || "Untitled";
  const [title, ...artistParts] = rawTitle.split(" - ");

  return {
    artist: artistParts.join(" - ").trim(),
    title: title.trim() || rawTitle,
    album: "",
    year: null,
  };
}

export function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "Audio file";
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
