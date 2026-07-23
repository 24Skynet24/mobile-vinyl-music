export interface EqualizerPanelProps {
  onClose: () => void;
}

export type EqualizerBand = {
  frequency: string;
  gain: number;
};

export type EqualizerSliderProps = EqualizerBand & {
  onGainChange: (gain: number) => void;
};

export type EqualizerBandRowProps = EqualizerSliderProps;
