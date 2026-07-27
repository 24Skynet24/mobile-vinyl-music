import { useState } from "react";
import { Alert } from "react-native";

import { useLibrary } from "@/entities/library";
import type { Track } from "@/entities/track";
import { usePlayback } from "@/features/playback";

import { useTrackDurations } from "./use-track-durations";

export function useMusicPanel(playlistId?: string | null) {
  const {
    addTrackToPlaylist,
    playlists,
    removeTrack,
    removeTrackFromPlaylist,
    tracks,
    updateTrackDuration,
  } = useLibrary();
  const { currentTrack, playTrack } = usePlayback();
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const playlist = playlists.find((item) => item.id === playlistId);

  useTrackDurations(tracks, updateTrackDuration);

  const removeMusicTrack = (track: Track) => {
    if (playlist) {
      removeTrackFromPlaylist(playlist.id, track.id);
      return;
    }

    Alert.alert(
      "Remove track?",
      `${track.title} will be deleted from the app and every playlist.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeTrack(track.id),
        },
      ],
    );
  };

  const closePlaylistPicker = () => setTrackToAdd(null);

  const addSelectedTrackToPlaylist = (targetPlaylistId: string) => {
    if (trackToAdd) {
      addTrackToPlaylist(targetPlaylistId, trackToAdd.id);
    }
    closePlaylistPicker();
  };

  return {
    addSelectedTrackToPlaylist,
    closePlaylistPicker,
    currentTrack,
    openPlaylistPicker: setTrackToAdd,
    playlist,
    playlists,
    playTrack,
    removeMusicTrack,
    tracks,
    trackToAdd,
  };
}
