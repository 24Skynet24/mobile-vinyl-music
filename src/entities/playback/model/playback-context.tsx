import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { useLibrary } from '@/entities/library';
import type { Track } from '@/entities/track';

import type { RepeatMode } from './types';
import {
  clearPlaybackState,
  loadPlaybackState,
  savePlaybackState,
} from './playback-storage';

type PlaybackContextValue = {
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  isHydrated: boolean;
  isPlaying: boolean;
  randomEnabled: boolean;
  repeatMode: RepeatMode;
  playTrack: (trackId: string, queueIds?: string[]) => void;
  togglePlayback: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  toggleRandom: () => void;
  cycleRepeatMode: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

const NEXT_REPEAT_MODE: Record<RepeatMode, RepeatMode> = {
  none: 'all',
  all: 'one',
  one: 'none',
};

const POSITION_SAVE_INTERVAL_MS = 2_000;

type PendingRestore = {
  position: number;
  trackId: string;
};

export function PlaybackProvider({ children }: PropsWithChildren) {
  const {
    isHydrated: isLibraryHydrated,
    tracks,
    updateTrackDuration,
  } = useLibrary();
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [randomEnabled, setRandomEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cyclePlayedIds, setCyclePlayedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const didJustFinishRef = useRef(false);
  const currentPositionRef = useRef(0);
  const currentTrackIdRef = useRef<string | null>(null);
  const hasUserSelectedTrackRef = useRef(false);
  const isApplyingRestoreRef = useRef(false);
  const isWaitingForTrackResetRef = useRef(false);
  const pendingRestoreRef = useRef<PendingRestore | null>(null);

  const currentTrack =
    tracks.find((track) => track.id === currentTrackId) ?? null;

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (!isLibraryHydrated || isHydrated) {
      return;
    }

    let isCancelled = false;

    void loadPlaybackState().then((savedState) => {
      if (isCancelled) {
        return;
      }

      if (hasUserSelectedTrackRef.current) {
        setIsHydrated(true);
        return;
      }

      const savedTrack = savedState
        ? tracks.find((track) => track.id === savedState.trackId)
        : undefined;

      if (savedState && savedTrack) {
        const restoredQueue = tracks.map((track) => track.id);
        pendingRestoreRef.current = savedState;
        currentTrackIdRef.current = savedTrack.id;
        currentPositionRef.current = savedState.position;
        isWaitingForTrackResetRef.current = true;
        setQueueIds(restoredQueue);
        setHistory([savedTrack.id]);
        setHistoryIndex(0);
        setCyclePlayedIds([savedTrack.id]);
        setCurrentTrackId(savedTrack.id);
        player.pause();
        player.replace({ uri: savedTrack.uri });
      } else if (savedState) {
        void clearPlaybackState();
      }

      setIsHydrated(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [isHydrated, isLibraryHydrated, player, tracks]);

  useEffect(() => {
    const pendingRestore = pendingRestoreRef.current;
    if (
      !pendingRestore ||
      isApplyingRestoreRef.current ||
      !status.isLoaded ||
      currentTrackId !== pendingRestore.trackId
    ) {
      return;
    }

    const knownDuration = status.duration || currentTrack?.duration || 0;
    const restoredPosition = knownDuration
      ? Math.min(pendingRestore.position, knownDuration)
      : pendingRestore.position;

    isApplyingRestoreRef.current = true;
    void player
      .seekTo(restoredPosition)
      .then(() => {
        if (pendingRestoreRef.current !== pendingRestore) {
          return;
        }

        pendingRestoreRef.current = null;
        isApplyingRestoreRef.current = false;
        isWaitingForTrackResetRef.current = false;
        currentPositionRef.current = restoredPosition;
        void savePlaybackState({
          position: restoredPosition,
          trackId: pendingRestore.trackId,
        });
      })
      .catch(() => {
        if (pendingRestoreRef.current === pendingRestore) {
          pendingRestoreRef.current = null;
          isApplyingRestoreRef.current = false;
          isWaitingForTrackResetRef.current = false;
          currentPositionRef.current = 0;
        }
      });
  }, [
    currentTrack?.duration,
    currentTrackId,
    player,
    status.duration,
    status.isLoaded,
  ]);

  useEffect(() => {
    if (pendingRestoreRef.current) {
      return;
    }

    if (isWaitingForTrackResetRef.current) {
      if (status.isLoaded && status.currentTime <= 0.25) {
        isWaitingForTrackResetRef.current = false;
        currentPositionRef.current = 0;
      }
      return;
    }

    currentPositionRef.current = status.currentTime;
  }, [status.currentTime, status.isLoaded]);

  const persistCurrentPlayback = useCallback(() => {
    const trackId = currentTrackIdRef.current;
    if (
      !isHydrated ||
      !trackId ||
      pendingRestoreRef.current ||
      isWaitingForTrackResetRef.current
    ) {
      return;
    }

    void savePlaybackState({
      position: currentPositionRef.current,
      trackId,
    });
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const intervalId = setInterval(
      persistCurrentPlayback,
      POSITION_SAVE_INTERVAL_MS,
    );
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (nextState !== 'active') {
          persistCurrentPlayback();
        }
      },
    );

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
      persistCurrentPlayback();
    };
  }, [isHydrated, persistCurrentPlayback]);

  const activateTrack = useCallback(
    (trackId: string, shouldPlay = true) => {
      const track = tracks.find((item) => item.id === trackId);
      if (!track) {
        return;
      }

      player.pause();
      player.replace({ uri: track.uri });
      hasUserSelectedTrackRef.current = true;
      pendingRestoreRef.current = null;
      isApplyingRestoreRef.current = false;
      isWaitingForTrackResetRef.current = true;
      currentTrackIdRef.current = trackId;
      currentPositionRef.current = 0;
      setCurrentTrackId(trackId);
      void savePlaybackState({ position: 0, trackId });

      if (shouldPlay) {
        player.play();
      }
    },
    [player, tracks],
  );

  const playTrack = useCallback(
    (trackId: string, requestedQueue?: string[]) => {
      const validIds = new Set(tracks.map((track) => track.id));
      const nextQueue = (requestedQueue ?? tracks.map((track) => track.id)).filter(
        (id) => validIds.has(id),
      );
      const queue = nextQueue.includes(trackId)
        ? nextQueue
        : [trackId, ...nextQueue];

      setQueueIds(queue);
      setHistory([trackId]);
      setHistoryIndex(0);
      setCyclePlayedIds([trackId]);
      activateTrack(trackId);
    },
    [activateTrack, tracks],
  );

  const goNext = useCallback(
    (automatic = false) => {
      if (!currentTrackId || queueIds.length === 0) {
        return;
      }

      if (automatic && repeatMode === 'one') {
        void player.seekTo(0);
        player.play();
        return;
      }

      if (randomEnabled) {
        if (historyIndex < history.length - 1) {
          const nextHistoryIndex = historyIndex + 1;
          setHistoryIndex(nextHistoryIndex);
          activateTrack(history[nextHistoryIndex]);
          return;
        }

        let candidates = queueIds.filter(
          (id) => id !== currentTrackId && !cyclePlayedIds.includes(id),
        );
        let nextCyclePlayed = cyclePlayedIds;

        if (candidates.length === 0 && repeatMode === 'all') {
          candidates = queueIds.filter((id) => id !== currentTrackId);
          nextCyclePlayed = [currentTrackId];
        }

        if (candidates.length === 0) {
          if (queueIds.length === 1 && repeatMode === 'all') {
            void player.seekTo(0);
            player.play();
          }
          return;
        }

        const nextId = candidates[Math.floor(Math.random() * candidates.length)];
        setHistory((current) => [...current, nextId]);
        setHistoryIndex(history.length);
        setCyclePlayedIds([...nextCyclePlayed, nextId]);
        activateTrack(nextId);
        return;
      }

      const currentIndex = queueIds.indexOf(currentTrackId);
      const nextId = queueIds[currentIndex + 1];
      if (nextId) {
        activateTrack(nextId);
        return;
      }

      if (repeatMode === 'all') {
        activateTrack(queueIds[0]);
      }
    },
    [
      activateTrack,
      currentTrackId,
      cyclePlayedIds,
      history,
      historyIndex,
      player,
      queueIds,
      randomEnabled,
      repeatMode,
    ],
  );

  const previousTrack = useCallback(() => {
    if (status.currentTime > 3) {
      void player.seekTo(0);
      return;
    }

    if (randomEnabled) {
      if (historyIndex > 0) {
        const previousHistoryIndex = historyIndex - 1;
        setHistoryIndex(previousHistoryIndex);
        activateTrack(history[previousHistoryIndex]);
      } else {
        void player.seekTo(0);
      }
      return;
    }

    if (!currentTrackId || queueIds.length === 0) {
      return;
    }

    const currentIndex = queueIds.indexOf(currentTrackId);
    if (currentIndex > 0) {
      activateTrack(queueIds[currentIndex - 1]);
    } else if (repeatMode === 'all') {
      activateTrack(queueIds.at(-1)!);
    } else {
      void player.seekTo(0);
    }
  }, [
    activateTrack,
    currentTrackId,
    history,
    historyIndex,
    player,
    queueIds,
    randomEnabled,
    repeatMode,
    status.currentTime,
  ]);

  const togglePlayback = useCallback(() => {
    if (!currentTrack) {
      if (tracks[0]) {
        playTrack(tracks[0].id);
      }
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
      void player.seekTo(0);
    }
    player.play();
  }, [currentTrack, playTrack, player, status, tracks]);

  const seekTo = useCallback(
    (seconds: number) => {
      const safeDuration = status.duration || currentTrack?.duration || 0;
      void player.seekTo(Math.max(0, Math.min(seconds, safeDuration)));
    },
    [currentTrack?.duration, player, status.duration],
  );

  const toggleRandom = useCallback(() => {
    setRandomEnabled((enabled) => {
      const nextEnabled = !enabled;
      if (nextEnabled && currentTrackId) {
        setHistory([currentTrackId]);
        setHistoryIndex(0);
        setCyclePlayedIds([currentTrackId]);
      }
      if (nextEnabled) {
        setRepeatMode('all');
      }
      return nextEnabled;
    });
  }, [currentTrackId]);

  const cycleRepeatMode = useCallback(() => {
    setRandomEnabled(false);
    setRepeatMode((current) => NEXT_REPEAT_MODE[current]);
  }, []);

  useEffect(() => {
    if (currentTrackId && status.duration > 0) {
      updateTrackDuration(currentTrackId, status.duration);
    }
  }, [currentTrackId, status.duration, updateTrackDuration]);

  useEffect(() => {
    if (status.didJustFinish && !didJustFinishRef.current && currentTrackId) {
      goNext(true);
    }
    didJustFinishRef.current = status.didJustFinish;
  }, [currentTrackId, goNext, status.didJustFinish]);

  useEffect(() => {
    if (currentTrackId && !currentTrack) {
      player.pause();
      player.replace(null);
      currentTrackIdRef.current = null;
      currentPositionRef.current = 0;
      pendingRestoreRef.current = null;
      isApplyingRestoreRef.current = false;
      setCurrentTrackId(null);
      void clearPlaybackState();
    }
  }, [currentTrack, currentTrackId, player]);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      currentTrack,
      currentTime: status.currentTime,
      duration: status.duration || currentTrack?.duration || 0,
      isBuffering: status.isBuffering,
      isHydrated,
      isPlaying: status.playing,
      randomEnabled,
      repeatMode,
      playTrack,
      togglePlayback,
      nextTrack: goNext,
      previousTrack,
      seekTo,
      toggleRandom,
      cycleRepeatMode,
    }),
    [
      currentTrack,
      cycleRepeatMode,
      goNext,
      playTrack,
      previousTrack,
      randomEnabled,
      repeatMode,
      seekTo,
      status.currentTime,
      status.duration,
      status.isBuffering,
      status.playing,
      isHydrated,
      togglePlayback,
      toggleRandom,
    ],
  );

  return <PlaybackContext value={value}>{children}</PlaybackContext>;
}

export function usePlayback() {
  const playback = use(PlaybackContext);
  if (!playback) {
    throw new Error('usePlayback must be used inside PlaybackProvider');
  }
  return playback;
}
