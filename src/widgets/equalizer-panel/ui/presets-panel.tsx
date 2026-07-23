import { Pressable, ScrollView, View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

import type { EqualizerPreset } from '../model/types';
import { PresetGrid } from './preset-grid';
import { PresetPanelHeader } from './preset-panel-header';

type PresetsPanelProps = {
  customPresets: EqualizerPreset[];
  defaultPresets: EqualizerPreset[];
  isEditing: boolean;
  markedPresetIds: string[];
  onBack: () => void;
  onDelete: () => void;
  onSelect: (preset: EqualizerPreset) => void;
  onToggleSettings: () => void;
  selectedPresetId: string;
};

export function PresetsPanel({
  customPresets,
  defaultPresets,
  isEditing,
  markedPresetIds,
  onBack,
  onDelete,
  onSelect,
  onToggleSettings,
  selectedPresetId,
}: PresetsPanelProps) {
  const canDelete = markedPresetIds.length > 0;

  return (
    <View className="flex-1 items-center">
      <View className="w-full flex-1 px-4 pb-7 pt-10">
        <PresetPanelHeader
          isEditing={isEditing}
          onBack={onBack}
          onToggleSettings={onToggleSettings}
        />

        <ScrollView
          contentContainerClassName="gap-12 pb-24 pt-7"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <PresetGrid
            markedPresetIds={[]}
            onSelect={onSelect}
            presets={defaultPresets}
            selectedPresetId={selectedPresetId}
          />
          {customPresets.length > 0 ? (
            <PresetGrid
              markedPresetIds={markedPresetIds}
              onSelect={onSelect}
              presets={customPresets}
              selectedPresetId={isEditing ? '' : selectedPresetId}
            />
          ) : (
            <TextBebas className="text-[18px] uppercase text-gray-main">
              No custom presets yet
            </TextBebas>
          )}
        </ScrollView>

        {isEditing && (
          <Pressable
            accessibilityRole="button"
            className={`absolute bottom-7 right-12 rounded-[4px] border border-orange-main bg-black-main px-3 py-1 active:opacity-70 ${
              canDelete ? '' : 'opacity-40'
            }`}
            disabled={!canDelete}
            onPress={onDelete}
          >
            <TextBebas className="text-[20px] uppercase text-white-main">
              Delete
            </TextBebas>
          </Pressable>
        )}
      </View>
    </View>
  );
}
