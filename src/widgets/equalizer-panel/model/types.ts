import type {
  EqualizerBand,
  EqualizerPreset,
} from '@/entities/equalizer';

export interface EqualizerPanelProps {
  onClose: () => void;
}

export type EqualizerPanelView = 'equalizer' | 'presets';

export type { EqualizerBand, EqualizerPreset };

export type EqualizerSliderProps = EqualizerBand & {
  onGainChange: (gain: number) => void;
};

export type EqualizerBandRowProps = EqualizerSliderProps;
