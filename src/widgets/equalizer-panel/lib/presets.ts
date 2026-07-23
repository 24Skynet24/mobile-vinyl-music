import type { EqualizerBand } from '../model/types';

const FREQUENCIES = ['60', '170', '310', '600', '1k', '3k', '6k', '12k'];

export function createBands(gains: number[]): EqualizerBand[] {
  return FREQUENCIES.map((frequency, index) => ({
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
