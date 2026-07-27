import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import {
  EQUALIZER_FREQUENCIES,
  type EqualizerBand,
} from "@/entities/equalizer";

import type {
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps,
} from "../model/audio-engine-types";

const FILTER_Q = 1.4;
const PARAMETER_RAMP_SECONDS = 0.05;
const PARAMETER_CHANGE_EPSILON = 0.01;

type WebEqualizerGraph = {
  filters: BiquadFilterNode[];
  input: AudioNode;
  lastGains: number[];
  output: GainNode;
};

function createWebEqualizerGraph(
  context: AudioContext,
  bands: EqualizerBand[],
): WebEqualizerGraph {
  const filters = EQUALIZER_FREQUENCIES.map(({ hz }, index) => {
    const filter = context.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = hz;
    filter.Q.value = FILTER_Q;
    filter.gain.value = bands[index]?.gain ?? 0;
    return filter;
  });
  const output = context.createGain();
  const initialGains = filters.map((filter) => filter.gain.value);

  filters.forEach((filter, index) => {
    filter.connect(filters[index + 1] ?? output);
  });
  output.connect(context.destination);

  return {
    filters,
    input: filters[0],
    lastGains: initialGains,
    output,
  };
}

function updateWebEqualizerGraph(
  context: AudioContext,
  graph: WebEqualizerGraph,
  bands: EqualizerBand[],
) {
  const now = context.currentTime;

  graph.filters.forEach((filter, index) => {
    const gain = bands[index]?.gain ?? 0;
    if (
      Math.abs(gain - (graph.lastGains[index] ?? 0)) < PARAMETER_CHANGE_EPSILON
    ) {
      return;
    }

    filter.gain.cancelAndHoldAtTime(now);
    filter.gain.linearRampToValueAtTime(gain, now + PARAMETER_RAMP_SECONDS);
    graph.lastGains[index] = gain;
  });
}

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const contextRef = useRef<AudioContext>(null);
  const graphRef = useRef<WebEqualizerGraph>(null);
  const sourceNodeRef =
    useRef<ReturnType<AudioContext["createMediaElementSource"]>>(null);
  const routedElementRef = useRef<HTMLAudioElement>(null);

  if (!contextRef.current) {
    contextRef.current = new AudioContext();
    graphRef.current = createWebEqualizerGraph(contextRef.current, bands);
  }

  const play = useCallback(() => {
    const context = contextRef.current;
    if (!context) {
      return;
    }

    void context
      .resume()
      .then(() => audioRef.current?.play())
      .catch(onError);
  }, [onError]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  }, []);

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
      updateWebEqualizerGraph(context, graph, bands);
    }
  }, [bands]);

  useEffect(() => {
    return () => {
      sourceNodeRef.current?.disconnect();
      if (graphRef.current) {
        graphRef.current.filters.forEach((filter) => filter.disconnect());
        graphRef.current.output.disconnect();
      }
      void contextRef.current?.close();
    };
  }, []);

  const handleCanPlay = useCallback(() => {
    const context = contextRef.current;
    const graph = graphRef.current;
    const audio = audioRef.current;
    if (!context || !graph || !audio) {
      return;
    }

    try {
      if (routedElementRef.current !== audio) {
        sourceNodeRef.current?.disconnect();
        const sourceNode = context.createMediaElementSource(audio);
        sourceNode.connect(graph.input);
        sourceNodeRef.current = sourceNode;
        routedElementRef.current = audio;
      }
      onDurationChange(Number.isFinite(audio.duration) ? audio.duration : 0);
      onLoaded();

      if (shouldPlayOnLoad) {
        play();
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [onDurationChange, onError, onLoaded, play, shouldPlayOnLoad]);

  return (
    <audio
      key={`${source}-${sourceRevision}`}
      onCanPlay={handleCanPlay}
      onEnded={onEnded}
      onError={() => onError(new Error("Failed to load audio source"))}
      onLoadStart={onLoading}
      onPause={onPause}
      onPlay={onPlay}
      onTimeUpdate={(event) =>
        onPositionChange(event.currentTarget.currentTime)
      }
      preload="auto"
      ref={audioRef}
      src={source || undefined}
      style={{ display: "none" }}
    />
  );
});
