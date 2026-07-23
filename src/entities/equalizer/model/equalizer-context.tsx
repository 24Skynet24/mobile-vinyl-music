import type { PropsWithChildren } from 'react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  areBandsEqual,
  cloneBands,
  normalizeBands,
} from '../lib/bands';
import { defaultPresets } from './default-presets';
import {
  loadEqualizerState,
  saveEqualizerState,
} from './equalizer-storage';
import type { EqualizerBand, EqualizerPreset } from './types';

type EqualizerContextValue = {
  bands: EqualizerBand[];
  customPresets: EqualizerPreset[];
  defaultPresets: EqualizerPreset[];
  hasUnsavedChanges: boolean;
  isHydrated: boolean;
  selectedPresetId: string;
  createPreset: (name: string) => void;
  deleteCustomPresets: (presetIds: string[]) => void;
  saveSelectedPreset: () => void;
  selectPreset: (preset: EqualizerPreset) => void;
  updateBandGain: (frequency: string, gain: number) => void;
};

const EqualizerContext = createContext<EqualizerContextValue | null>(null);
const flatPreset = defaultPresets[0];
const STORAGE_SAVE_DELAY_MS = 300;

function createCustomPresetId() {
  return `custom-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function EqualizerProvider({ children }: PropsWithChildren) {
  const [bands, setBands] = useState(() => cloneBands(flatPreset.bands));
  const [customPresets, setCustomPresets] = useState<EqualizerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState(flatPreset.id);
  const [isHydrated, setIsHydrated] = useState(false);
  const presets = useMemo(
    () => [...defaultPresets, ...customPresets],
    [customPresets],
  );
  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId,
  );
  const hasUnsavedChanges =
    selectedPreset?.kind === 'custom' &&
    !areBandsEqual(bands, selectedPreset.bands);

  useEffect(() => {
    let isMounted = true;

    void loadEqualizerState()
      .then((storedState) => {
        if (!isMounted || !storedState) {
          return;
        }

        const storedPresets = [
          ...defaultPresets,
          ...storedState.customPresets,
        ];
        const hasStoredSelection = storedPresets.some(
          (preset) => preset.id === storedState.selectedPresetId,
        );

        setBands(normalizeBands(storedState.bands));
        setCustomPresets(storedState.customPresets);
        setSelectedPresetId(
          hasStoredSelection ? storedState.selectedPresetId : '',
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const timeoutId = setTimeout(() => {
      void saveEqualizerState({
        bands,
        customPresets,
        selectedPresetId,
      });
    }, STORAGE_SAVE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [bands, customPresets, isHydrated, selectedPresetId]);

  const updateBandGain = useCallback(
    (frequency: string, gain: number) => {
      if (!Number.isFinite(gain)) {
        return;
      }

      if (selectedPreset?.kind === 'default') {
        setSelectedPresetId('');
      }

      const nextGain = Math.max(-12, Math.min(12, gain));
      setBands((currentBands) => {
        const currentBand = currentBands.find(
          (band) => band.frequency === frequency,
        );
        if (
          !currentBand ||
          Math.abs(currentBand.gain - nextGain) < 0.01
        ) {
          return currentBands;
        }

        return currentBands.map((band) =>
          band.frequency === frequency
            ? { ...band, gain: nextGain }
            : band,
        );
      });
    },
    [selectedPreset?.kind],
  );

  const selectPreset = useCallback((preset: EqualizerPreset) => {
    setSelectedPresetId(preset.id);
    setBands(cloneBands(preset.bands));
  }, []);

  const createPreset = useCallback(
    (rawName: string) => {
      const name = rawName.trim();
      if (!name) {
        return;
      }

      const preset: EqualizerPreset = {
        bands: cloneBands(bands),
        id: createCustomPresetId(),
        kind: 'custom',
        name,
      };

      setCustomPresets((currentPresets) => [...currentPresets, preset]);
      setSelectedPresetId(preset.id);
    },
    [bands],
  );

  const saveSelectedPreset = useCallback(() => {
    if (selectedPreset?.kind !== 'custom' || !hasUnsavedChanges) {
      return;
    }

    setCustomPresets((currentPresets) =>
      currentPresets.map((preset) =>
        preset.id === selectedPreset.id
          ? { ...preset, bands: cloneBands(bands) }
          : preset,
      ),
    );
  }, [bands, hasUnsavedChanges, selectedPreset]);

  const deleteCustomPresets = useCallback(
    (presetIds: string[]) => {
      if (presetIds.length === 0) {
        return;
      }

      setCustomPresets((currentPresets) =>
        currentPresets.filter((preset) => !presetIds.includes(preset.id)),
      );
      if (presetIds.includes(selectedPresetId)) {
        setSelectedPresetId('');
      }
    },
    [selectedPresetId],
  );

  const value = useMemo<EqualizerContextValue>(
    () => ({
      bands,
      createPreset,
      customPresets,
      defaultPresets,
      deleteCustomPresets,
      hasUnsavedChanges,
      isHydrated,
      saveSelectedPreset,
      selectPreset,
      selectedPresetId,
      updateBandGain,
    }),
    [
      bands,
      createPreset,
      customPresets,
      deleteCustomPresets,
      hasUnsavedChanges,
      isHydrated,
      saveSelectedPreset,
      selectPreset,
      selectedPresetId,
      updateBandGain,
    ],
  );

  return <EqualizerContext value={value}>{children}</EqualizerContext>;
}

export function useEqualizer() {
  const equalizer = use(EqualizerContext);
  if (!equalizer) {
    throw new Error('useEqualizer must be used inside EqualizerProvider');
  }
  return equalizer;
}
