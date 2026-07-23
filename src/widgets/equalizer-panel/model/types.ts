export interface EqualizerPanelProps {
  onClose: () => void;
}

export type EqualizerPanelView = 'equalizer' | 'presets';

export type EqualizerBand = {
  frequency: string;
  gain: number;
};

export type EqualizerPreset = {
  bands: EqualizerBand[];
  id: string;
  kind: 'custom' | 'default';
  name: string;
};

export type EqualizerSliderProps = EqualizerBand & {
  onGainChange: (gain: number) => void;
};

export type EqualizerBandRowProps = EqualizerSliderProps;
