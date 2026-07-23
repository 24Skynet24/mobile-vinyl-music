import type { EqualizerBand } from '@/entities/equalizer';

export type PlaybackAudioEngineHandle = {
  pause: () => void;
  play: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

export type PlaybackAudioEngineProps = {
  bands: EqualizerBand[];
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onError: (error: Error) => void;
  onLoaded: () => void;
  onLoading: () => void;
  onPause: () => void;
  onPlay: () => void;
  onPositionChange: (position: number) => void;
  shouldPlayOnLoad: boolean;
  source: string;
  sourceRevision: number;
};
