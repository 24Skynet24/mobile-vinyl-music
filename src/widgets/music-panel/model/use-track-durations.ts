import { useEffect } from "react";

import { getAudioDuration, type Track } from "@/entities/track";

export function useTrackDurations(
  tracks: Track[],
  updateTrackDuration: (trackId: string, duration: number) => void,
) {
  useEffect(() => {
    let isCancelled = false;
    const tracksWithoutDuration = tracks.filter((track) => track.duration <= 0);

    void (async () => {
      for (const track of tracksWithoutDuration) {
        const duration = await getAudioDuration(track.uri);
        if (isCancelled) {
          return;
        }
        if (duration > 0) {
          updateTrackDuration(track.id, duration);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [tracks, updateTrackDuration]);
}
