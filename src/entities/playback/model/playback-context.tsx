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

import { useEqualizer } from '@/entities/equalizer';
import { useLibrary } from '@/entities/library';
import type { Track } from '@/entities/track';

import type { PlaybackAudioEngineHandle } from './audio-engine-types';
import type { RepeatMode } from './types';
import {
  clearPlaybackState,
  loadPlaybackState,
  savePlaybackState,
} from './playback-storage';
import { PlaybackAudioEngine } from '../ui/playback-audio-engine';

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

type PlaybackAudioStatus = {
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  isLoaded: boolean;
  playing: boolean;
};

function getDefaultQueueIds(tracks: Track[]) {
  return [...tracks]
    .sort((left, right) => right.addedAt - left.addedAt)
    .map((track) => track.id);
}

function getShuffleKey(track?: Track) {
  return track?.fileName.trim().toLocaleLowerCase() ?? '';
}

export function PlaybackProvider({ children }: PropsWithChildren) {
  const { bands } = useEqualizer();
  const {
    isHydrated: isLibraryHydrated,
    tracks,
    updateTrackDuration,
  } = useLibrary();
  const audioEngineRef = useRef<PlaybackAudioEngineHandle>(null);
  const [status, setStatus] = useState<PlaybackAudioStatus>({
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    isLoaded: false,
    playing: false,
  });
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [sourceRevision, setSourceRevision] = useState(0);
  const [shouldPlayOnLoad, setShouldPlayOnLoad] = useState(false);
  const [endedSequence, setEndedSequence] = useState(0);
  const [randomEnabled, setRandomEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cyclePlayedIds, setCyclePlayedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const currentPositionRef = useRef(0);
  const currentTrackIdRef = useRef<string | null>(null);
  const hasUserSelectedTrackRef = useRef(false);
  const isApplyingRestoreRef = useRef(false);
  const isWaitingForTrackResetRef = useRef(false);
  const pendingRestoreRef = useRef<PendingRestore | null>(null);
  const handledEndedSequenceRef = useRef(0);
  const previousRestartPendingRef = useRef(false);
  const previousLibraryTrackIdsRef = useRef(
    tracks.map((track) => track.id),
  );

  const currentTrack =
    tracks.find((track) => track.id === currentTrackId) ?? null;

  const playAudio = useCallback(() => {
    audioEngineRef.current?.play();
  }, []);

  const pauseAudio = useCallback(() => {
    audioEngineRef.current?.pause();
  }, []);

  const seekAudio = useCallback((seconds: number) => {
    return audioEngineRef.current?.seekTo(seconds) ?? Promise.resolve();
  }, []);

  useEffect(() => {
    const previousLibraryIds = previousLibraryTrackIdsRef.current;
    const nextLibraryIds = tracks.map((track) => track.id);
    const nextLibraryIdSet = new Set(nextLibraryIds);

    setQueueIds((currentQueue) => {
      const validQueue = currentQueue.filter((id) =>
        nextLibraryIdSet.has(id),
      );
      const previousLibraryIdSet = new Set(previousLibraryIds);
      const wasFullLibraryQueue =
        previousLibraryIds.length > 0 &&
        currentQueue.length === previousLibraryIds.length &&
        currentQueue.every((id) => previousLibraryIdSet.has(id));

      if (!wasFullLibraryQueue) {
        return validQueue.length === currentQueue.length
          ? currentQueue
          : validQueue;
      }

      const previousDefaultQueue = getDefaultQueueIds(
        tracks.filter((track) => previousLibraryIdSet.has(track.id)),
      );
      const wasDefaultQueueOrder = currentQueue.every(
        (id, index) => id === previousDefaultQueue[index],
      );
      if (wasDefaultQueueOrder) {
        const nextDefaultQueue = getDefaultQueueIds(tracks);
        const queueDidNotChange = nextDefaultQueue.every(
          (id, index) => id === currentQueue[index],
        );

        return queueDidNotChange ? currentQueue : nextDefaultQueue;
      }

      const queuedIds = new Set(validQueue);
      const nextQueue = [
        ...validQueue,
        ...nextLibraryIds.filter((id) => !queuedIds.has(id)),
      ];
      const queueDidNotChange =
        nextQueue.length === currentQueue.length &&
        nextQueue.every((id, index) => id === currentQueue[index]);

      return queueDidNotChange ? currentQueue : nextQueue;
    });

    previousLibraryTrackIdsRef.current = nextLibraryIds;
  }, [tracks]);

  useEffect(() => {
    if (status.currentTime <= 0.25) {
      previousRestartPendingRef.current = false;
    }
  }, [currentTrackId, status.currentTime]);

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
        const restoredQueue = getDefaultQueueIds(tracks);
        pendingRestoreRef.current = savedState;
        currentTrackIdRef.current = savedTrack.id;
        currentPositionRef.current = savedState.position;
        isWaitingForTrackResetRef.current = true;
        setQueueIds(restoredQueue);
        setHistory([savedTrack.id]);
        setHistoryIndex(0);
        setCyclePlayedIds([savedTrack.id]);
        setCurrentTrackId(savedTrack.id);
        audioEngineRef.current?.pause();
        setStatus({
          currentTime: 0,
          duration: savedTrack.duration,
          isBuffering: true,
          isLoaded: false,
          playing: false,
        });
        setShouldPlayOnLoad(false);
        setSourceRevision((revision) => revision + 1);
      } else if (savedState) {
        void clearPlaybackState();
      }

      setIsHydrated(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [isHydrated, isLibraryHydrated, tracks]);

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
    void seekAudio(restoredPosition)
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
    seekAudio,
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

      pauseAudio();
      hasUserSelectedTrackRef.current = true;
      pendingRestoreRef.current = null;
      isApplyingRestoreRef.current = false;
      isWaitingForTrackResetRef.current = true;
      previousRestartPendingRef.current = false;
      currentTrackIdRef.current = trackId;
      currentPositionRef.current = 0;
      setCurrentTrackId(trackId);
      setStatus({
        currentTime: 0,
        duration: track.duration,
        isBuffering: true,
        isLoaded: false,
        playing: false,
      });
      setShouldPlayOnLoad(shouldPlay);
      setSourceRevision((revision) => revision + 1);
      void savePlaybackState({ position: 0, trackId });
    },
    [pauseAudio, tracks],
  );

  const playTrack = useCallback(
    (trackId: string, requestedQueue?: string[]) => {
      const validIds = new Set(tracks.map((track) => track.id));
      const nextQueue = (
        requestedQueue ?? getDefaultQueueIds(tracks)
      ).filter((id) => validIds.has(id));
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
    (automatic: boolean) => {
      if (!currentTrackId || queueIds.length === 0) {
        return;
      }

      if (automatic && repeatMode === 'one') {
        void seekAudio(0);
        playAudio();
        return;
      }

      if (randomEnabled) {
        const tracksById = new Map(
          tracks.map((track) => [track.id, track]),
        );
        const currentShuffleKey = getShuffleKey(
          tracksById.get(currentTrackId),
        );

        if (historyIndex < history.length - 1) {
          const nextHistoryIndex = historyIndex + 1;
          setHistoryIndex(nextHistoryIndex);
          activateTrack(history[nextHistoryIndex]);
          return;
        }

        const playedShuffleKeys = new Set(
          cyclePlayedIds.map((id) =>
            getShuffleKey(tracksById.get(id)),
          ),
        );
        let candidates = queueIds.filter(
          (id) =>
            id !== currentTrackId &&
            !playedShuffleKeys.has(
              getShuffleKey(tracksById.get(id)),
            ),
        );
        let nextCyclePlayed = cyclePlayedIds;

        const shouldStartNewCycle =
          repeatMode === 'all' || !automatic;
        if (candidates.length === 0 && shouldStartNewCycle) {
          candidates = queueIds.filter(
            (id) =>
              id !== currentTrackId &&
              getShuffleKey(tracksById.get(id)) !==
                currentShuffleKey,
          );
          nextCyclePlayed = [currentTrackId];
        }

        if (candidates.length === 0) {
          const uniqueTrackCount = new Set(
            queueIds.map((id) =>
              getShuffleKey(tracksById.get(id)),
            ),
          ).size;
          if (uniqueTrackCount === 1 && shouldStartNewCycle) {
            void seekAudio(0);
            playAudio();
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

      const firstTrackId = queueIds[0];
      if (automatic && repeatMode === 'none') {
        activateTrack(firstTrackId, false);
        return;
      }

      activateTrack(firstTrackId);
    },
    [
      activateTrack,
      currentTrackId,
      cyclePlayedIds,
      history,
      historyIndex,
      playAudio,
      queueIds,
      randomEnabled,
      repeatMode,
      seekAudio,
      tracks,
    ],
  );

  const nextTrack = useCallback(() => {
    goNext(false);
  }, [goNext]);

  const previousTrack = useCallback(() => {
    if (
      status.currentTime > 3 &&
      !previousRestartPendingRef.current
    ) {
      previousRestartPendingRef.current = true;
      void seekAudio(0);
      return;
    }

    previousRestartPendingRef.current = false;

    if (randomEnabled) {
      if (historyIndex > 0) {
        const previousHistoryIndex = historyIndex - 1;
        setHistoryIndex(previousHistoryIndex);
        activateTrack(history[previousHistoryIndex]);
      } else {
        void seekAudio(0);
      }
      return;
    }

    if (!currentTrackId || queueIds.length === 0) {
      return;
    }

    const currentIndex = queueIds.indexOf(currentTrackId);
    if (currentIndex > 0) {
      activateTrack(queueIds[currentIndex - 1]);
    } else {
      activateTrack(queueIds.at(-1)!);
    }
  }, [
    activateTrack,
    currentTrackId,
    history,
    historyIndex,
    queueIds,
    randomEnabled,
    seekAudio,
    status.currentTime,
  ]);

  const togglePlayback = useCallback(() => {
    if (!currentTrack) {
      const firstTrackId = getDefaultQueueIds(tracks)[0];
      if (firstTrackId) {
        playTrack(firstTrackId);
      }
      return;
    }

    if (status.playing) {
      pauseAudio();
      return;
    }

    if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
      void seekAudio(0);
    }
    playAudio();
  }, [
    currentTrack,
    pauseAudio,
    playAudio,
    playTrack,
    seekAudio,
    status,
    tracks,
  ]);

  const seekTo = useCallback(
    (seconds: number) => {
      const safeDuration = status.duration || currentTrack?.duration || 0;
      void seekAudio(Math.max(0, Math.min(seconds, safeDuration)));
    },
    [currentTrack?.duration, seekAudio, status.duration],
  );

  const toggleRandom = useCallback(() => {
    setRandomEnabled((enabled) => {
      const nextEnabled = !enabled;
      if (nextEnabled) {
        setRepeatMode('all');
        if (currentTrackId) {
          setHistory([currentTrackId]);
          setHistoryIndex(0);
          setCyclePlayedIds([currentTrackId]);
        }
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
    if (
      endedSequence > handledEndedSequenceRef.current &&
      currentTrackId
    ) {
      handledEndedSequenceRef.current = endedSequence;
      goNext(true);
    }
  }, [currentTrackId, endedSequence, goNext]);

  useEffect(() => {
    if (currentTrackId && !currentTrack) {
      pauseAudio();
      currentTrackIdRef.current = null;
      currentPositionRef.current = 0;
      pendingRestoreRef.current = null;
      isApplyingRestoreRef.current = false;
      setCurrentTrackId(null);
      void clearPlaybackState();
    }
  }, [currentTrack, currentTrackId, pauseAudio]);

  const handleAudioLoading = useCallback(() => {
    setStatus((current) => ({
      ...current,
      isBuffering: true,
      isLoaded: false,
      playing: false,
    }));
  }, []);

  const handleAudioLoaded = useCallback(() => {
    setStatus((current) => ({
      ...current,
      isBuffering: false,
      isLoaded: true,
    }));
  }, []);

  const handleAudioDurationChange = useCallback((duration: number) => {
    if (!Number.isFinite(duration) || duration < 0) {
      return;
    }

    setStatus((current) => ({ ...current, duration }));
  }, []);

  const handleAudioPositionChange = useCallback((currentTime: number) => {
    if (!Number.isFinite(currentTime) || currentTime < 0) {
      return;
    }

    setStatus((current) => ({ ...current, currentTime }));
  }, []);

  const handleAudioPlay = useCallback(() => {
    setStatus((current) => ({
      ...current,
      isBuffering: false,
      playing: true,
    }));
  }, []);

  const handleAudioPause = useCallback(() => {
    setStatus((current) => ({ ...current, playing: false }));
  }, []);

  const handleAudioEnded = useCallback(() => {
    setStatus((current) => ({
      ...current,
      currentTime: current.duration,
      playing: false,
    }));
    setEndedSequence((sequence) => sequence + 1);
  }, []);

  const handleAudioError = useCallback((_error: Error) => {
    setStatus((current) => ({
      ...current,
      isBuffering: false,
      isLoaded: false,
      playing: false,
    }));
  }, []);

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
      nextTrack,
      previousTrack,
      seekTo,
      toggleRandom,
      cycleRepeatMode,
    }),
    [
      currentTrack,
      cycleRepeatMode,
      nextTrack,
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

  return (
    <PlaybackContext value={value}>
      <PlaybackAudioEngine
        bands={bands}
        onDurationChange={handleAudioDurationChange}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onLoaded={handleAudioLoaded}
        onLoading={handleAudioLoading}
        onPause={handleAudioPause}
        onPlay={handleAudioPlay}
        onPositionChange={handleAudioPositionChange}
        ref={audioEngineRef}
        shouldPlayOnLoad={shouldPlayOnLoad}
        source={currentTrack?.uri ?? ''}
        sourceRevision={sourceRevision}
      />
      {children}
    </PlaybackContext>
  );
}

export function usePlayback() {
  const playback = use(PlaybackContext);
  if (!playback) {
    throw new Error('usePlayback must be used inside PlaybackProvider');
  }
  return playback;
}
