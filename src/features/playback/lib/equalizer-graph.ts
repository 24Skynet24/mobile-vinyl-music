import {
  type AudioContext,
  type AudioNode,
  type BiquadFilterNode,
  type GainNode,
} from "react-native-audio-api";

import {
  EQUALIZER_FREQUENCIES,
  type EqualizerBand,
} from "@/entities/equalizer";

const FILTER_Q = 1.4;
const PARAMETER_RAMP_SECONDS = 0.05;
const PARAMETER_CHANGE_EPSILON = 0.01;

export type EqualizerGraph = {
  filters: BiquadFilterNode[];
  input: AudioNode;
  lastGains: number[];
  output: GainNode;
};

export function createEqualizerGraph(context: AudioContext): EqualizerGraph {
  const filters = EQUALIZER_FREQUENCIES.map(({ hz }) => {
    const filter = context.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = hz;
    filter.Q.value = FILTER_Q;
    filter.gain.value = 0;
    return filter;
  });
  const output = context.createGain();

  filters.forEach((filter, index) => {
    const nextFilter = filters[index + 1];
    filter.connect(nextFilter ?? output);
  });
  output.connect(context.destination);

  return {
    filters,
    input: filters[0],
    lastGains: filters.map(() => 0),
    output,
  };
}

export function updateEqualizerGraph(
  context: AudioContext,
  graph: EqualizerGraph,
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

export function disconnectEqualizerGraph(graph: EqualizerGraph) {
  graph.filters.forEach((filter) => filter.disconnect());
  graph.output.disconnect();
}
