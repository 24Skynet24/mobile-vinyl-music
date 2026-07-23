import { useRef, useState } from 'react';

import { areBandsEqual, cloneBands } from '../lib/presets';
import { equalizerBands } from './equalizer-bands';
import { defaultPresets } from './presets';
import type { EqualizerPanelView, EqualizerPreset } from './types';

export function useEqualizer() {
  const nextCustomPresetId = useRef(1);
  const [bands, setBands] = useState(() => cloneBands(equalizerBands));
  const [customPresets, setCustomPresets] = useState<EqualizerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>('default-flat');
  const [view, setView] = useState<EqualizerPanelView>('equalizer');
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [presetIdsToDelete, setPresetIdsToDelete] = useState<string[]>([]);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const presets = [...defaultPresets, ...customPresets];
  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId,
  );
  const hasUnsavedChanges =
    selectedPreset?.kind === 'custom' &&
    !areBandsEqual(bands, selectedPreset.bands);

  const updateBandGain = (frequency: string, gain: number) => {
    if (selectedPreset?.kind === 'default') {
      setSelectedPresetId('');
    }

    setBands((currentBands) =>
      currentBands.map((band) =>
        band.frequency === frequency ? { ...band, gain } : band,
      ),
    );
  };

  const openPresetList = () => setView('presets');

  const returnToEqualizer = () => {
    setIsEditingPresets(false);
    setPresetIdsToDelete([]);
    setView('equalizer');
  };

  const selectPreset = (preset: EqualizerPreset) => {
    if (isEditingPresets) {
      if (preset.kind === 'custom') {
        setPresetIdsToDelete((currentIds) =>
          currentIds.includes(preset.id)
            ? currentIds.filter((id) => id !== preset.id)
            : [...currentIds, preset.id],
        );
      }
      return;
    }

    setSelectedPresetId(preset.id);
    setBands(cloneBands(preset.bands));
  };

  const togglePresetSettings = () => {
    setPresetIdsToDelete([]);
    setIsEditingPresets((isEditing) => !isEditing);
  };

  const deleteSelectedPresets = () => {
    if (presetIdsToDelete.length === 0) {
      return;
    }

    setCustomPresets((currentPresets) =>
      currentPresets.filter(
        (preset) => !presetIdsToDelete.includes(preset.id),
      ),
    );
    if (presetIdsToDelete.includes(selectedPresetId)) {
      setSelectedPresetId('');
    }
    setPresetIdsToDelete([]);
  };

  const openCreatePreset = () => {
    setPresetName('');
    setIsCreatePresetOpen(true);
  };

  const closeCreatePreset = () => {
    setIsCreatePresetOpen(false);
    setPresetName('');
  };

  const createPreset = () => {
    const name = presetName.trim();
    if (!name) {
      return;
    }

    const id = `custom-${nextCustomPresetId.current}`;
    const preset: EqualizerPreset = {
      bands: cloneBands(bands),
      id,
      kind: 'custom',
      name,
    };
    nextCustomPresetId.current += 1;
    setCustomPresets((currentPresets) => [...currentPresets, preset]);
    setSelectedPresetId(id);
    closeCreatePreset();
  };

  const saveSelectedPreset = () => {
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
  };

  return {
    bands,
    closeCreatePreset,
    createPreset,
    customPresets,
    defaultPresets,
    deleteSelectedPresets,
    hasUnsavedChanges,
    isCreatePresetOpen,
    isEditingPresets,
    openCreatePreset,
    openPresetList,
    presetIdsToDelete,
    presetName,
    returnToEqualizer,
    saveSelectedPreset,
    selectPreset,
    selectedPresetId,
    setPresetName,
    togglePresetSettings,
    updateBandGain,
    view,
  };
}
