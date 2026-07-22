import type { PressableProps } from 'react-native';

import type { RepeatMode } from '@/entities/playback';

export type ControlButtonIcon = 'play' | 'stop' | 'next' | 'prev';

export type { RepeatMode };

export interface ControlButtonFrameProps
  extends Omit<PressableProps, 'children'> {
  hasOffset?: boolean;
}

export interface ControlButtonProps extends ControlButtonFrameProps {
  icon: ControlButtonIcon;
  accessibilityLabel: string;
}

export interface RandomButtonProps extends ControlButtonFrameProps {
  enabled: boolean;
}

export interface RepeatButtonProps extends ControlButtonFrameProps {
  mode: RepeatMode;
}
