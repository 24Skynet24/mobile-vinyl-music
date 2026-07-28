import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import type {
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps,
} from "../model/audio-engine-types";

export const ExpoGoPlaybackAudioEngine = forwardRef<
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps
>(function ExpoGoPlaybackAudioEngine(
  {
    metadata,
    onDurationChange,
    onEnded,
    onError,
    onLoaded,
    onLoading,
    onPause,
    onPlay,
    onPositionChange,
    shouldPlayOnLoad,
    source,
    sourceRevision,
  },
  ref,
) {
  const player = useAudioPlayer(null, {
    keepAudioSessionActive: true,
    updateInterval: 100,
  });
  const status = useAudioPlayerStatus(player);
  const loadedRevisionRef = useRef(-1);
  const endedRevisionRef = useRef(-1);
  const previousPlayingRef = useRef<boolean | null>(null);

  useEffect(() => {
    void setAudioModeAsync({
      interruptionMode: "doNotMix",
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!source || !metadata) {
      player.clearLockScreenControls();
      return;
    }

    player.setActiveForLockScreen(
      true,
      {
        albumTitle: metadata.album,
        artist: metadata.artist,
        artworkUrl: metadata.artworkUri,
        title: metadata.title,
      },
      {
        showSeekBackward: false,
        showSeekForward: false,
      },
    );

    return () => {
      player.clearLockScreenControls();
    };
  }, [metadata, player, source]);

  const play = useCallback(() => {
    try {
      player.play();
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [onError, player]);

  const pause = useCallback(() => {
    player.pause();
  }, [player]);

  const seekTo = useCallback(
    async (seconds: number) => {
      await player.seekTo(seconds);
    },
    [player],
  );

  useImperativeHandle(
    ref,
    () => ({
      pause,
      play,
      seekTo,
    }),
    [pause, play, seekTo],
  );

  useEffect(() => {
    loadedRevisionRef.current = -1;
    endedRevisionRef.current = -1;
    previousPlayingRef.current = null;
    player.pause();

    if (!source) {
      onDurationChange(0);
      onPositionChange(0);
      return;
    }

    onLoading();

    try {
      player.replace({ uri: source });
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [
    onDurationChange,
    onError,
    onLoading,
    onPositionChange,
    player,
    source,
    sourceRevision,
  ]);

  useEffect(() => {
    if (!source) {
      return;
    }

    onPositionChange(
      Number.isFinite(status.currentTime) ? status.currentTime : 0,
    );
  }, [onPositionChange, source, status.currentTime]);

  useEffect(() => {
    if (!source) {
      return;
    }

    onDurationChange(Number.isFinite(status.duration) ? status.duration : 0);
  }, [onDurationChange, source, status.duration]);

  useEffect(() => {
    if (
      !source ||
      !status.isLoaded ||
      !player.isLoaded ||
      loadedRevisionRef.current === sourceRevision
    ) {
      return;
    }

    loadedRevisionRef.current = sourceRevision;
    onLoaded();

    if (shouldPlayOnLoad) {
      play();
    }
  }, [
    onLoaded,
    play,
    player,
    shouldPlayOnLoad,
    source,
    sourceRevision,
    status.isLoaded,
  ]);

  useEffect(() => {
    if (!source || !status.isLoaded) {
      return;
    }

    const previousPlaying = previousPlayingRef.current;
    previousPlayingRef.current = status.playing;

    if (previousPlaying === null || previousPlaying === status.playing) {
      return;
    }

    if (status.playing) {
      onPlay();
    } else if (!status.didJustFinish) {
      onPause();
    }
  }, [
    onPause,
    onPlay,
    source,
    status.didJustFinish,
    status.isLoaded,
    status.playing,
  ]);

  useEffect(() => {
    if (
      !source ||
      !status.didJustFinish ||
      !player.isLoaded ||
      endedRevisionRef.current === sourceRevision
    ) {
      return;
    }

    endedRevisionRef.current = sourceRevision;
    onEnded();
  }, [onEnded, player, source, sourceRevision, status.didJustFinish]);

  return null;
});
