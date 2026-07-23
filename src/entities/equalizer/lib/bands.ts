import type { EqualizerBand } from '../model/types';

export const EQUALIZER_FREQUENCIES = [
  { frequency: '60', hz: 60 },
  { frequency: '170', hz: 170 },
  { frequency: '310', hz: 310 },
  { frequency: '600', hz: 600 },
  { frequency: '1k', hz: 1_000 },
  { frequency: '3k', hz: 3_000 },
  { frequency: '6k', hz: 6_000 },
  { frequency: '12k', hz: 12_000 },
] as const;

export function createBands(gains: number[]): EqualizerBand[] {
  return EQUALIZER_FREQUENCIES.map(({ frequency }, index) => ({
    frequency,
    gain: gains[index] ?? 0,
  }));
}

export function cloneBands(bands: EqualizerBand[]) {
  return bands.map((band) => ({ ...band }));
}

export function areBandsEqual(
  firstBands: EqualizerBand[],
  secondBands: EqualizerBand[],
) {
  return firstBands.every(
    (band, index) =>
      band.frequency === secondBands[index]?.frequency &&
      Math.abs(band.gain - secondBands[index].gain) < 0.01,
  );
}

export function normalizeBands(bands: unknown): EqualizerBand[] {
  if (!Array.isArray(bands)) {
    return createBands([]);
  }

  return EQUALIZER_FREQUENCIES.map(({ frequency }) => {
    const storedBand = bands.find(
      (band): band is Partial<EqualizerBand> =>
        typeof band === 'object' &&
        band !== null &&
        'frequency' in band &&
        band.frequency === frequency,
    );
    const rawGain = storedBand?.gain;
    const gain =
      typeof rawGain === 'number' && Number.isFinite(rawGain) ? rawGain : 0;

    return {
      frequency,
      gain: Math.max(-12, Math.min(12, gain)),
    };
  });
}
