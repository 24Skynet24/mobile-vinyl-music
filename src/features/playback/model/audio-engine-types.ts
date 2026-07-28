import type { EqualizerBand } from "@/entities/equalizer";

export type PlaybackAudioEngineHandle = {
  pause: () => void;
  play: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

export type PlaybackAudioMetadata = {
  album: string;
  artist: string;
  artworkUri?: string;
  title: string;
};

export type PlaybackAudioEngineProps = {
  bands: EqualizerBand[];
  metadata: PlaybackAudioMetadata | null;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onError: (error: Error) => void;
  onLoaded: () => void;
  onLoading: () => void;
  onNext: () => void;
  onPause: () => void;
  onPlay: () => void;
  onPositionChange: (position: number) => void;
  onPrevious: () => void;
  shouldPlayOnLoad: boolean;
  source: string;
  sourceRevision: number;
};
