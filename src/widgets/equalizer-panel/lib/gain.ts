export const MIN_GAIN = -12;
export const MAX_GAIN = 12;

const GAIN_RANGE = MAX_GAIN - MIN_GAIN;

export function clampGain(gain: number) {
  return Math.max(MIN_GAIN, Math.min(gain, MAX_GAIN));
}

export function formatGain(gain: number) {
  const roundedGain = Math.round(gain);

  return roundedGain > 0 ? `+${roundedGain}` : `${roundedGain}`;
}

export function gainFromOffset(offset: number, trackWidth: number) {
  if (!Number.isFinite(offset) || trackWidth <= 0) {
    return null;
  }

  const progress = Math.max(0, Math.min(offset / trackWidth, 1));

  return MIN_GAIN + progress * GAIN_RANGE;
}

export function gainToProgressWidth(gain: number) {
  const progress = (clampGain(gain) - MIN_GAIN) / GAIN_RANGE;

  return `${progress * 100}%` as const;
}
