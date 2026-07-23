import { View } from 'react-native';

import type { EqualizerPreset } from '../model/types';
import { PresetButton } from './preset-button';

type PresetGridProps = {
  markedPresetIds: string[];
  onSelect: (preset: EqualizerPreset) => void;
  presets: EqualizerPreset[];
  selectedPresetId: string;
};

export function PresetGrid({
  markedPresetIds,
  onSelect,
  presets,
  selectedPresetId,
}: PresetGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {presets.map((preset) => (
        <PresetButton
          isMarkedForDeletion={markedPresetIds.includes(preset.id)}
          isSelected={selectedPresetId === preset.id}
          key={preset.id}
          onPress={() => onSelect(preset)}
          preset={preset}
        />
      ))}
    </View>
  );
}
