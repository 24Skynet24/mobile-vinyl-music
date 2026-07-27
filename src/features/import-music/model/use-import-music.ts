import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { persistAudioAsset, useLibrary } from "@/entities/library";
import { getAudioDuration } from "@/entities/track";

import { metadataFromAsset } from "../lib/track-metadata";
import type { MetadataEditor, PendingTrack } from "./types";

export function useImportMusic(onImportComplete: () => void) {
  const { addTracks, tracks } = useLibrary();
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [metadataEditor, setMetadataEditor] = useState<MetadataEditor | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingDurations, setIsReadingDurations] = useState(false);
  const selectionRevisionRef = useRef(0);

  useEffect(() => {
    return () => {
      selectionRevisionRef.current += 1;
    };
  }, []);

  const selectMusic = async () => {
    if (isReadingDurations || isSaving) {
      return;
    }

    const selectionRevision = ++selectionRevisionRef.current;
    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: "audio/*",
      });
    } catch {
      Alert.alert(
        "File picker error",
        "The system file picker could not be opened.",
      );
      return;
    }

    if (result.canceled || selectionRevision !== selectionRevisionRef.current) {
      return;
    }

    const selectedTracks = result.assets.map((asset) => ({
      asset,
      duration: 0,
      metadata: metadataFromAsset(asset),
    }));

    setPendingTracks((current) => {
      const existing = new Set(
        [
          ...tracks.map((track) => track.fileName),
          ...current.map(({ asset }) => asset.name),
        ].map((fileName) => fileName.trim().toLocaleLowerCase()),
      );
      return [
        ...current,
        ...selectedTracks.filter(({ asset }) => {
          const fileName = asset.name.trim().toLocaleLowerCase();
          if (existing.has(fileName)) {
            return false;
          }

          existing.add(fileName);
          return true;
        }),
      ];
    });

    setIsReadingDurations(true);
    try {
      for (const selectedTrack of selectedTracks) {
        if (selectionRevision !== selectionRevisionRef.current) {
          return;
        }

        let duration = 0;
        try {
          duration = await getAudioDuration(selectedTrack.asset.uri);
        } catch {
          // A track can still be imported when its duration is unavailable.
        }
        if (
          duration > 0 &&
          selectionRevision === selectionRevisionRef.current
        ) {
          setPendingTracks((current) =>
            current.map((track) =>
              track.asset.uri === selectedTrack.asset.uri
                ? { ...track, duration }
                : track,
            ),
          );
        }
      }
    } finally {
      if (selectionRevision === selectionRevisionRef.current) {
        setIsReadingDurations(false);
      }
    }
  };

  const confirmImport = () => {
    if (pendingTracks.length === 0 || isSaving || isReadingDurations) {
      return;
    }

    setIsSaving(true);
    const existingFileNames = new Set(
      tracks.map((track) => track.fileName.trim().toLocaleLowerCase()),
    );
    const tracksToImport = pendingTracks.filter(({ asset }) => {
      const fileName = asset.name.trim().toLocaleLowerCase();
      if (existingFileNames.has(fileName)) {
        return false;
      }

      existingFileNames.add(fileName);
      return true;
    });
    const importedTracks = [];
    const failedTracks: PendingTrack[] = [];

    for (const pendingTrack of tracksToImport) {
      try {
        importedTracks.push(
          persistAudioAsset(
            pendingTrack.asset,
            pendingTrack.metadata,
            pendingTrack.duration,
          ),
        );
      } catch {
        failedTracks.push(pendingTrack);
      }
    }

    if (importedTracks.length > 0) {
      addTracks(importedTracks);
    }
    setPendingTracks(failedTracks);
    setIsSaving(false);

    if (failedTracks.length > 0) {
      Alert.alert(
        "Some files were not added",
        `${importedTracks.length} imported, ${failedTracks.length} failed.`,
      );
    } else {
      Alert.alert(
        "Music added",
        `${importedTracks.length} track(s) are now in your library.${
          tracksToImport.length < pendingTracks.length
            ? " Duplicate files were skipped."
            : ""
        }`,
      );
    }

    if (importedTracks.length > 0) {
      onImportComplete();
    }
  };

  const openMetadataEditor = (index: number) => {
    const track = pendingTracks[index];
    if (!track) {
      return;
    }

    setMetadataEditor({
      ...track.metadata,
      index,
      yearText: track.metadata.year?.toString() ?? "",
    });
  };

  const closeMetadataEditor = () => setMetadataEditor(null);

  const updateMetadataEditor = (changes: Partial<MetadataEditor>) => {
    setMetadataEditor((current) =>
      current ? { ...current, ...changes } : current,
    );
  };

  const saveMetadata = () => {
    if (!metadataEditor || !metadataEditor.title.trim()) {
      return;
    }

    const { index, yearText, ...metadata } = metadataEditor;
    setPendingTracks((current) =>
      current.map((track, trackIndex) =>
        trackIndex === index
          ? {
              ...track,
              metadata: {
                ...metadata,
                title: metadata.title.trim(),
                artist: metadata.artist.trim(),
                album: metadata.album.trim(),
                year: yearText.trim() ? Number(yearText) : null,
              },
            }
          : track,
      ),
    );
    closeMetadataEditor();
  };

  const removePendingTrack = (index: number) => {
    setPendingTracks((current) =>
      current.filter((_, trackIndex) => trackIndex !== index),
    );
  };

  return {
    closeMetadataEditor,
    confirmImport,
    isReadingDurations,
    isSaving,
    metadataEditor,
    openMetadataEditor,
    pendingTracks,
    removePendingTrack,
    saveMetadata,
    selectMusic,
    updateMetadataEditor,
  };
}
