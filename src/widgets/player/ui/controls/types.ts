import type { RepeatMode } from '../control-button';

export interface ControlsProps {
  className?: string;
  disabled?: boolean;
  isPlaying: boolean;
  randomEnabled: boolean;
  repeatMode: RepeatMode;
  onNextPress: () => void;
  onPlaybackTogglePress: () => void;
  onPreviousPress: () => void;
  onRandomPress: () => void;
  onRepeatPress: () => void;
}
