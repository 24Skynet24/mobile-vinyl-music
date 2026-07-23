import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeBands } from '../lib/bands';
import type { EqualizerBand, EqualizerPreset } from './types';

const EQUALIZER_STORAGE_KEY = 'vinyl-music/equalizer-v1';

export type StoredEqualizerState = {
  bands: EqualizerBand[];
  customPresets: EqualizerPreset[];
  selectedPresetId: string;
};

function normalizeCustomPresets(value: unknown): EqualizerPreset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((preset) => {
    if (
      typeof preset !== 'object' ||
      preset === null ||
      !('id' in preset) ||
      !('name' in preset) ||
      !('bands' in preset) ||
      typeof preset.id !== 'string' ||
      typeof preset.name !== 'string'
    ) {
      return [];
    }

    const name = preset.name.trim();
    if (!name) {
      return [];
    }

    return [
      {
        id: preset.id,
        name,
        kind: 'custom' as const,
        bands: normalizeBands(preset.bands),
      },
    ];
  });
}

export async function loadEqualizerState(): Promise<StoredEqualizerState | null> {
  try {
    const savedState = await AsyncStorage.getItem(EQUALIZER_STORAGE_KEY);
    if (!savedState) {
      return null;
    }

    const parsed = JSON.parse(savedState) as Partial<StoredEqualizerState>;

    return {
      bands: normalizeBands(parsed.bands),
      customPresets: normalizeCustomPresets(parsed.customPresets),
      selectedPresetId:
        typeof parsed.selectedPresetId === 'string'
          ? parsed.selectedPresetId
          : '',
    };
  } catch {
    return null;
  }
}

export function saveEqualizerState(state: StoredEqualizerState) {
  return AsyncStorage.setItem(
    EQUALIZER_STORAGE_KEY,
    JSON.stringify(state),
  ).catch(() => undefined);
}
