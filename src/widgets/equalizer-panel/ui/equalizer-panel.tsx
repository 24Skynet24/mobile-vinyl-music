import { useWindowDimensions } from 'react-native';

import { SlidingPanel } from '@/shared/ui/sliding-panel';

import type { EqualizerPanelProps } from '../model/types';
import { useEqualizer } from '../model/use-equalizer';
import { CreatePresetModal } from './create-preset-modal';
import { EqualizerView } from './equalizer-view';
import { PresetsPanel } from './presets-panel';

const EQUALIZER_PANEL_HEIGHT_RATIO = 0.72;

export function EqualizerPanel({ onClose }: EqualizerPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const contentHeight = windowHeight * EQUALIZER_PANEL_HEIGHT_RATIO;
  const {
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
  } = useEqualizer();

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        {view === 'equalizer' ? (
          <EqualizerView
            bands={bands}
            onBandGainChange={updateBandGain}
            onCreatePreset={openCreatePreset}
            onOpenPresets={openPresetList}
            onSavePreset={saveSelectedPreset}
            showSave={hasUnsavedChanges}
          />
        ) : (
          <PresetsPanel
            customPresets={customPresets}
            defaultPresets={defaultPresets}
            isEditing={isEditingPresets}
            markedPresetIds={presetIdsToDelete}
            onBack={returnToEqualizer}
            onDelete={deleteSelectedPresets}
            onSelect={selectPreset}
            onToggleSettings={togglePresetSettings}
            selectedPresetId={selectedPresetId}
          />
        )}
      </SlidingPanel>

      <CreatePresetModal
        name={presetName}
        onCancel={closeCreatePreset}
        onChangeName={setPresetName}
        onSave={createPreset}
        visible={isCreatePresetOpen}
      />
    </>
  );
}
