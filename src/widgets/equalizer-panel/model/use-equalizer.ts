import { useState } from 'react';

import {
  useEqualizer as useEqualizerState,
} from '@/entities/equalizer';

import type { EqualizerPanelView, EqualizerPreset } from './types';

export function useEqualizer() {
  const {
    bands,
    createPreset: createEqualizerPreset,
    customPresets,
    defaultPresets,
    deleteCustomPresets,
    hasUnsavedChanges,
    saveSelectedPreset,
    selectPreset: selectEqualizerPreset,
    selectedPresetId,
    updateBandGain,
  } = useEqualizerState();
  const [view, setView] = useState<EqualizerPanelView>('equalizer');
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [presetIdsToDelete, setPresetIdsToDelete] = useState<string[]>([]);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

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

    selectEqualizerPreset(preset);
  };

  const togglePresetSettings = () => {
    setPresetIdsToDelete([]);
    setIsEditingPresets((isEditing) => !isEditing);
  };

  const deleteSelectedPresets = () => {
    if (presetIdsToDelete.length === 0) {
      return;
    }

    deleteCustomPresets(presetIdsToDelete);
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
    if (!presetName.trim()) {
      return;
    }

    createEqualizerPreset(presetName);
    closeCreatePreset();
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
