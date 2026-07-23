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
