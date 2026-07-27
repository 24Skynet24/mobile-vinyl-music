import type { DocumentPickerAsset } from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";

import type { Track } from "@/entities/track/@x/library";

const MUSIC_DIRECTORY = "music-library";
const COVER_DIRECTORY = "playlist-covers";

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").trim() || "Untitled";
}

function metadataFromFileName(fileName: string) {
  const rawTitle = titleFromFileName(fileName);
  const [title, ...artistParts] = rawTitle.split(" - ");

  if (artistParts.length === 0) {
    return { artist: "", title: rawTitle };
  }

  return {
    artist: artistParts.join(" - ").trim(),
    title: title.trim() || rawTitle,
  };
}

function copyAsset(asset: DocumentPickerAsset, directoryName: string) {
  const directory = new Directory(Paths.document, directoryName);
  directory.create({ idempotent: true, intermediates: true });

  const destination = new File(
    directory,
    `${createId()}-${safeFileName(asset.name)}`,
  );
  new File(asset.uri).copy(destination);
  return destination.uri;
}

export type ImportedTrackMetadata = {
  title: string;
  artist: string;
  album: string;
  year: number | null;
};

export function persistAudioAsset(
  asset: DocumentPickerAsset,
  metadataOverride?: ImportedTrackMetadata,
  duration = 0,
): Track {
  const fileMetadata = metadataFromFileName(asset.name);
  const metadata = metadataOverride ?? {
    ...fileMetadata,
    album: "",
    year: null,
  };

  return {
    id: createId(),
    ...metadata,
    duration,
    uri: copyAsset(asset, MUSIC_DIRECTORY),
    fileName: asset.name,
    addedAt: Date.now(),
  };
}

export function persistCoverAsset(asset: DocumentPickerAsset) {
  return copyAsset(asset, COVER_DIRECTORY);
}

export function deleteStoredFile(uri?: string) {
  if (!uri || !uri.startsWith(Paths.document.uri)) {
    return;
  }

  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}
