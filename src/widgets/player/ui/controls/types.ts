export interface ControlsProps {
  className?: string;
  disabled?: boolean;
  isPlaying: boolean;
  randomEnabled: boolean;
  repeatMode: 'none' | 'all' | 'one';
  onNextPress: () => void;
  onPlayPausePress: () => void;
  onPreviousPress: () => void;
  onRandomPress: () => void;
  onRepeatPress: () => void;
}
