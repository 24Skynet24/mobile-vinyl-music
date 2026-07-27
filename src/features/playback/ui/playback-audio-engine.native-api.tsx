import {
  AudioContext,
  AudioManager,
  type AudioBuffer,
  type AudioBufferSourceNode,
} from "react-native-audio-api";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import {
  createEqualizerGraph,
  disconnectEqualizerGraph,
  updateEqualizerGraph,
} from "../lib/equalizer-graph";
import type {
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps,
} from "../model/audio-engine-types";

const POSITION_UPDATE_INTERVAL_MS = 100;
const SOURCE_RELEASE_DELAY_MS = 50;

export const PlaybackAudioEngine = forwardRef<
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps
>(function PlaybackAudioEngine(
  {
    bands,
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
  const contextRef = useRef<AudioContext>(null);
  const graphRef = useRef<ReturnType<typeof createEqualizerGraph>>(null);
  const bufferRef = useRef<AudioBuffer>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode>(null);
  const positionRef = useRef(0);
  const startedAtRef = useRef(0);
  const startedOffsetRef = useRef(0);
  const loadRevisionRef = useRef(0);
  const playRequestRef = useRef(0);
  const playIntentRef = useRef(false);
  const pendingSourceReleasesRef = useRef(
    new Map<AudioBufferSourceNode, ReturnType<typeof setTimeout>>(),
  );

  if (!contextRef.current) {
    contextRef.current = new AudioContext();
    graphRef.current = createEqualizerGraph(contextRef.current);
  }

  const releaseSource = useCallback((sourceNode: AudioBufferSourceNode) => {
    const timeoutId = pendingSourceReleasesRef.current.get(sourceNode);
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingSourceReleasesRef.current.delete(sourceNode);
    }

    sourceNode.onEnded = null;
    sourceNode.onPositionChanged = null;
    sourceNode.buffer = null;
    sourceNode.disconnect();
  }, []);

  const scheduleSourceRelease = useCallback(
    (sourceNode: AudioBufferSourceNode) => {
      const timeoutId = setTimeout(() => {
        releaseSource(sourceNode);
      }, SOURCE_RELEASE_DELAY_MS);

      pendingSourceReleasesRef.current.set(sourceNode, timeoutId);
    },
    [releaseSource],
  );

  const stopSource = useCallback(() => {
    const sourceNode = sourceNodeRef.current;
    if (!sourceNode) {
      return;
    }

    sourceNode.onEnded = null;
    sourceNode.onPositionChanged = null;

    try {
      sourceNode.stop();
      scheduleSourceRelease(sourceNode);
    } catch {
      // A source that has already ended cannot be stopped again.
      releaseSource(sourceNode);
    }

    sourceNodeRef.current = null;
  }, [releaseSource, scheduleSourceRelease]);

  const cancelPendingOperations = useCallback(() => {
    playIntentRef.current = false;
    playRequestRef.current += 1;
    loadRevisionRef.current += 1;
  }, []);

  const getCurrentPosition = useCallback(() => {
    const context = contextRef.current;
    const buffer = bufferRef.current;
    if (!context || !buffer || !sourceNodeRef.current) {
      return positionRef.current;
    }

    return Math.min(
      buffer.duration,
      startedOffsetRef.current +
        Math.max(0, context.currentTime - startedAtRef.current),
    );
  }, []);

  const play = useCallback(() => {
    const context = contextRef.current;
    const graph = graphRef.current;
    const buffer = bufferRef.current;
    if (!context || !graph || !buffer) {
      return;
    }

    if (sourceNodeRef.current) {
      playIntentRef.current = true;
      onPlay();
      return;
    }

    playIntentRef.current = true;
    const request = ++playRequestRef.current;
    void Promise.all([
      context.resume(),
      AudioManager.setAudioSessionActivity(true),
    ])
      .then(() => {
        if (
          request !== playRequestRef.current ||
          !playIntentRef.current ||
          sourceNodeRef.current ||
          bufferRef.current !== buffer
        ) {
          return;
        }

        const offset =
          positionRef.current >= buffer.duration ? 0 : positionRef.current;
        const sourceNode = context.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.onPositionChangedInterval = POSITION_UPDATE_INTERVAL_MS;
        sourceNode.onPositionChanged = ({ value }) => {
          positionRef.current = Math.min(buffer.duration, value);
          onPositionChange(positionRef.current);
        };
        sourceNode.onEnded = () => {
          releaseSource(sourceNode);

          if (sourceNodeRef.current !== sourceNode) {
            return;
          }

          sourceNodeRef.current = null;
          playIntentRef.current = false;
          positionRef.current = buffer.duration;
          onPositionChange(buffer.duration);
          onEnded();
        };
        sourceNode.connect(graph.input);

        startedOffsetRef.current = offset;
        startedAtRef.current = context.currentTime;
        positionRef.current = offset;
        sourceNodeRef.current = sourceNode;
        sourceNode.start(0, offset);
        onPlay();
      })
      .catch((error) => {
        if (request === playRequestRef.current) {
          playIntentRef.current = false;
        }
        onError(error instanceof Error ? error : new Error(String(error)));
      });
  }, [onEnded, onError, onPlay, onPositionChange, releaseSource]);

  const pause = useCallback(() => {
    const wasPlaying = playIntentRef.current || Boolean(sourceNodeRef.current);
    playIntentRef.current = false;
    ++playRequestRef.current;

    if (!sourceNodeRef.current) {
      if (wasPlaying) {
        onPause();
      }
      return;
    }

    positionRef.current = getCurrentPosition();
    stopSource();
    onPositionChange(positionRef.current);
    onPause();
  }, [getCurrentPosition, onPause, onPositionChange, stopSource]);

  const seekTo = useCallback(
    async (seconds: number) => {
      const buffer = bufferRef.current;
      if (!buffer) {
        return;
      }

      const shouldResume =
        playIntentRef.current || Boolean(sourceNodeRef.current);
      ++playRequestRef.current;
      stopSource();
      positionRef.current = Math.max(0, Math.min(seconds, buffer.duration));
      onPositionChange(positionRef.current);

      if (shouldResume) {
        play();
      }
    },
    [onPositionChange, play, stopSource],
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
    const context = contextRef.current;
    const graph = graphRef.current;
    if (context && graph) {
      updateEqualizerGraph(context, graph, bands);
    }
  }, [bands]);

  useEffect(() => {
    AudioManager.setAudioSessionOptions({
      iosCategory: "playback",
      iosMode: "default",
    });
    AudioManager.observeAudioInterruptions(true);

    let shouldResumeAfterInterruption = false;
    const interruptionSubscription = AudioManager.addSystemEventListener(
      "interruption",
      ({ shouldResume, type }) => {
        if (type === "began") {
          shouldResumeAfterInterruption = playIntentRef.current;
          pause();
        } else if (shouldResume && shouldResumeAfterInterruption) {
          shouldResumeAfterInterruption = false;
          play();
        }
      },
    );
    const pendingSourceReleases = pendingSourceReleasesRef.current;

    return () => {
      interruptionSubscription?.remove();
      cancelPendingOperations();
      stopSource();

      for (const sourceNode of pendingSourceReleases.keys()) {
        releaseSource(sourceNode);
      }

      if (graphRef.current) {
        disconnectEqualizerGraph(graphRef.current);
      }

      void contextRef.current?.close();
      void AudioManager.setAudioSessionActivity(false);
    };
  }, [cancelPendingOperations, pause, play, releaseSource, stopSource]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context) {
      return;
    }

    const loadRevision = ++loadRevisionRef.current;
    playIntentRef.current = false;
    ++playRequestRef.current;
    stopSource();
    bufferRef.current = null;
    positionRef.current = 0;
    onPositionChange(0);

    if (!source) {
      onDurationChange(0);
      return;
    }

    onLoading();

    void context
      .decodeAudioData(source)
      .then((buffer) => {
        if (loadRevision !== loadRevisionRef.current) {
          return;
        }

        bufferRef.current = buffer;
        onDurationChange(buffer.duration);
        onLoaded();

        if (shouldPlayOnLoad) {
          play();
        }
      })
      .catch((error) => {
        if (loadRevision !== loadRevisionRef.current) {
          return;
        }

        onError(error instanceof Error ? error : new Error(String(error)));
      });
  }, [
    onDurationChange,
    onError,
    onLoaded,
    onLoading,
    onPositionChange,
    play,
    shouldPlayOnLoad,
    source,
    sourceRevision,
    stopSource,
  ]);

  return null;
});
