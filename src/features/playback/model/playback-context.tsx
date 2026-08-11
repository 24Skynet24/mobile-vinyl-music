import type { PropsWithChildren } from "react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { useEqualizer } from "@/entities/equalizer";
import { useLibrary } from "@/entities/library";
import type { Track } from "@/entities/track";

import {
  getDefaultQueueIds,
  getQueueAfterRemoval,
  getShuffleCandidates,
  hasSingleUniqueTrack,
  reconcileQueueIds,
  reconcileShuffleHistory,
  type ShuffleHistory,
} from "../lib/playback-queue";
import type { PlaybackAudioEngineHandle } from "./audio-engine-types";
import type { RepeatMode } from "./types";
import {
  clearPlaybackState,
  loadPlaybackState,
  savePlaybackState,
} from "./playback-storage";
import { PlaybackAudioEngine } from "../ui/playback-audio-engine";

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
  selectTrackAfterRemoval: (
    trackId: string,
    sourceQueueIds: string[],
  ) => void;
  togglePlayback: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  toggleRandom: () => void;
  cycleRepeatMode: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

const NEXT_REPEAT_MODE: Record<RepeatMode, RepeatMode> = {
  none: "all",
  all: "one",
  one: "none",
};

const POSITION_SAVE_INTERVAL_MS = 2_000;
const SHUFFLE_HISTORY_LIMIT = 100;

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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [shuffleHistory, setShuffleHistory] = useState<ShuffleHistory>({
    ids: [],
    index: -1,
  });
  const [cyclePlayedIds, setCyclePlayedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const currentPositionRef = useRef(0);
  const currentTrackIdRef = useRef<string | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const hasUserSelectedTrackRef = useRef(false);
  const isApplyingRestoreRef = useRef(false);
  const isWaitingForTrackResetRef = useRef(false);
  const pendingRestoreRef = useRef<PendingRestore | null>(null);
  const handledEndedSequenceRef = useRef(0);
  const previousRestartPendingRef = useRef(false);
  const previousLibraryTrackIdsRef = useRef(tracks.map((track) => track.id));

  const currentTrack =
    tracks.find((track) => track.id === currentTrackId) ?? null;
  const audioMetadata = useMemo(
    () =>
      currentTrack
        ? {
            album: currentTrack.album,
            artist: currentTrack.artist,
            artworkUri: currentTrack.coverUri,
            title: currentTrack.title,
          }
        : null,
    [currentTrack],
  );

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
        setShuffleHistory({ ids: [savedTrack.id], index: 0 });
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

    const intervalId = setInterval(() => {
      if (appStateRef.current === "active") {
        persistCurrentPlayback();
      }
    }, POSITION_SAVE_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const prevState = appStateRef.current;
        appStateRef.current = nextState;

        if (nextState !== "active") {
          persistCurrentPlayback();
        } else if (prevState !== "active") {
          setStatus((current) => {
            if (
              Math.abs(current.currentTime - currentPositionRef.current) > 0.05
            ) {
              return { ...current, currentTime: currentPositionRef.current };
            }
            return current;
          });
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

  const deactivateTrack = useCallback(() => {
    pauseAudio();
    pendingRestoreRef.current = null;
    isApplyingRestoreRef.current = false;
    isWaitingForTrackResetRef.current = false;
    previousRestartPendingRef.current = false;
    currentTrackIdRef.current = null;
    currentPositionRef.current = 0;
    setCurrentTrackId(null);
    setQueueIds([]);
    setShuffleHistory({ ids: [], index: -1 });
    setCyclePlayedIds([]);
    setStatus({
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      isLoaded: false,
      playing: false,
    });
    setShouldPlayOnLoad(false);
    setSourceRevision((revision) => revision + 1);
    void clearPlaybackState();
  }, [pauseAudio]);

  useEffect(() => {
    const previousLibraryIds = previousLibraryTrackIdsRef.current;
    const nextLibraryIds = tracks.map((track) => track.id);
    const nextLibraryIdSet = new Set(nextLibraryIds);

    setQueueIds((currentQueue) =>
      reconcileQueueIds(currentQueue, previousLibraryIds, tracks),
    );
    setShuffleHistory((currentHistory) =>
      reconcileShuffleHistory(currentHistory, nextLibraryIdSet),
    );

    if (
      isLibraryHydrated &&
      isHydrated &&
      previousLibraryIds.length === 0 &&
      nextLibraryIds.length > 0 &&
      !currentTrackIdRef.current
    ) {
      const firstTrackId = getDefaultQueueIds(tracks)[0];
      setQueueIds(getDefaultQueueIds(tracks));
      setShuffleHistory({ ids: [firstTrackId], index: 0 });
      setCyclePlayedIds([firstTrackId]);
      activateTrack(firstTrackId, false);
    }

    previousLibraryTrackIdsRef.current = nextLibraryIds;
  }, [
    activateTrack,
    isHydrated,
    isLibraryHydrated,
    tracks,
  ]);

  const playTrack = useCallback(
    (trackId: string, requestedQueue?: string[]) => {
      const validIds = new Set(tracks.map((track) => track.id));
      const nextQueue = (requestedQueue ?? getDefaultQueueIds(tracks)).filter(
        (id) => validIds.has(id),
      );
      const queue = nextQueue.includes(trackId)
        ? nextQueue
        : [trackId, ...nextQueue];

      setQueueIds(queue);
      setShuffleHistory({ ids: [trackId], index: 0 });
      setCyclePlayedIds([trackId]);
      activateTrack(trackId);
    },
    [activateTrack, tracks],
  );

  const selectTrackAfterRemoval = useCallback(
    (trackId: string, sourceQueueIds: string[]) => {
      if (currentTrackIdRef.current !== trackId) {
        return;
      }

      const validTrackIds = new Set(tracks.map((track) => track.id));
      const validSourceQueueIds = sourceQueueIds.filter((id) =>
        validTrackIds.has(id),
      );
      const { nextQueueIds, nextTrackId } = getQueueAfterRemoval(
        trackId,
        validSourceQueueIds,
        getDefaultQueueIds(tracks),
      );

      if (!nextTrackId) {
        deactivateTrack();
        return;
      }

      setQueueIds(nextQueueIds);
      setShuffleHistory({ ids: [nextTrackId], index: 0 });
      setCyclePlayedIds([nextTrackId]);
      activateTrack(nextTrackId, status.playing);
    },
    [activateTrack, deactivateTrack, status.playing, tracks],
  );

  const goNext = useCallback(
    (automatic: boolean) => {
      if (!currentTrackId || queueIds.length === 0) {
        return;
      }

      if (automatic && repeatMode === "one") {
        void seekAudio(0);
        playAudio();
        return;
      }

      if (randomEnabled) {
        if (shuffleHistory.index < shuffleHistory.ids.length - 1) {
          const nextHistoryIndex = shuffleHistory.index + 1;
          setShuffleHistory((current) => ({
            ...current,
            index: nextHistoryIndex,
          }));
          activateTrack(shuffleHistory.ids[nextHistoryIndex]);
          return;
        }

        const shouldStartNewCycle = repeatMode === "all" || !automatic;
        const { candidates, nextCyclePlayedIds } = getShuffleCandidates({
          currentTrackId,
          cyclePlayedIds,
          queueIds,
          restartCycle: shouldStartNewCycle,
          tracks,
        });

        if (candidates.length === 0) {
          if (hasSingleUniqueTrack(queueIds, tracks) && shouldStartNewCycle) {
            void seekAudio(0);
            playAudio();
          }
          return;
        }

        const nextId =
          candidates[Math.floor(Math.random() * candidates.length)];
        setShuffleHistory((current) => {
          const ids = [...current.ids, nextId].slice(-SHUFFLE_HISTORY_LIMIT);
          return { ids, index: ids.length - 1 };
        });
        setCyclePlayedIds([...nextCyclePlayedIds, nextId]);
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
      if (automatic && repeatMode === "none") {
        activateTrack(firstTrackId, false);
        return;
      }

      activateTrack(firstTrackId);
    },
    [
      activateTrack,
      currentTrackId,
      cyclePlayedIds,
      playAudio,
      queueIds,
      randomEnabled,
      repeatMode,
      seekAudio,
      shuffleHistory,
      tracks,
    ],
  );

  const nextTrack = useCallback(() => {
    goNext(false);
  }, [goNext]);

  const previousTrack = useCallback(() => {
    if (status.currentTime > 3 && !previousRestartPendingRef.current) {
      previousRestartPendingRef.current = true;
      void seekAudio(0);
      return;
    }

    previousRestartPendingRef.current = false;

    if (randomEnabled) {
      if (shuffleHistory.index > 0) {
        const previousHistoryIndex = shuffleHistory.index - 1;
        setShuffleHistory((current) => ({
          ...current,
          index: previousHistoryIndex,
        }));
        activateTrack(shuffleHistory.ids[previousHistoryIndex]);
        return;
      }

      if (!currentTrackId || queueIds.length === 0) {
        return;
      }

      const { candidates, nextCyclePlayedIds } = getShuffleCandidates({
        currentTrackId,
        cyclePlayedIds,
        queueIds,
        restartCycle: true,
        tracks,
      });

      if (candidates.length === 0) {
        void seekAudio(0);
        playAudio();
        return;
      }

      const previousId =
        candidates[Math.floor(Math.random() * candidates.length)];
      setShuffleHistory((current) => ({
        ids: [previousId, ...current.ids].slice(0, SHUFFLE_HISTORY_LIMIT),
        index: 0,
      }));
      setCyclePlayedIds([...nextCyclePlayedIds, previousId]);
      activateTrack(previousId);
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
    cyclePlayedIds,
    playAudio,
    queueIds,
    randomEnabled,
    seekAudio,
    shuffleHistory,
    status.currentTime,
    tracks,
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
        setRepeatMode("all");
        if (currentTrackId) {
          setShuffleHistory({ ids: [currentTrackId], index: 0 });
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
      if (
        !currentTrack ||
        Math.abs(currentTrack.duration - status.duration) > 0.5
      ) {
        updateTrackDuration(currentTrackId, status.duration);
      }
    }
  }, [currentTrack, currentTrackId, status.duration, updateTrackDuration]);

  useEffect(() => {
    if (endedSequence > handledEndedSequenceRef.current && currentTrackId) {
      handledEndedSequenceRef.current = endedSequence;
      goNext(true);
    }
  }, [currentTrackId, endedSequence, goNext]);

  useEffect(() => {
    if (currentTrackId && !currentTrack) {
      const { nextQueueIds, nextTrackId } = getQueueAfterRemoval(
        currentTrackId,
        queueIds,
        getDefaultQueueIds(tracks),
      );

      if (nextTrackId) {
        setQueueIds(nextQueueIds);
        setShuffleHistory({ ids: [nextTrackId], index: 0 });
        setCyclePlayedIds([nextTrackId]);
        activateTrack(nextTrackId, status.playing);
      } else {
        deactivateTrack();
      }
    }
  }, [
    activateTrack,
    currentTrack,
    currentTrackId,
    deactivateTrack,
    queueIds,
    status.playing,
    tracks,
  ]);

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

    currentPositionRef.current = currentTime;
    if (appStateRef.current === "active") {
      setStatus((current) => ({ ...current, currentTime }));
    }
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
      selectTrackAfterRemoval,
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
      selectTrackAfterRemoval,
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
        metadata={audioMetadata}
        onDurationChange={handleAudioDurationChange}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onLoaded={handleAudioLoaded}
        onLoading={handleAudioLoading}
        onNext={nextTrack}
        onPause={handleAudioPause}
        onPlay={handleAudioPlay}
        onPositionChange={handleAudioPositionChange}
        onPrevious={previousTrack}
        ref={audioEngineRef}
        shouldPlayOnLoad={shouldPlayOnLoad}
        source={currentTrack?.uri ?? ""}
        sourceRevision={sourceRevision}
      />
      {children}
    </PlaybackContext>
  );
}

export function usePlayback() {
  const playback = use(PlaybackContext);
  if (!playback) {
    throw new Error("usePlayback must be used inside PlaybackProvider");
  }
  return playback;
}
