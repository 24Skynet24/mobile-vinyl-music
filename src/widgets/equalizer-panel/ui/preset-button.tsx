import { Pressable } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

import type { EqualizerPreset } from '../model/types';

type PresetButtonProps = {
  isMarkedForDeletion: boolean;
  isSelected: boolean;
  onPress: () => void;
  preset: EqualizerPreset;
};

export function PresetButton({
  isMarkedForDeletion,
  isSelected,
  onPress,
  preset,
}: PresetButtonProps) {
  const isHighlighted = isMarkedForDeletion || isSelected;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isHighlighted }}
      className={`rounded-[4px] border border-orange-main px-3 py-1 active:opacity-70 ${
        isHighlighted ? 'bg-orange-main' : 'bg-black-main'
      }`}
      onPress={onPress}
    >
      <TextBebas
        className={`text-[18px] uppercase ${
          isSelected && !isMarkedForDeletion
            ? 'text-black-main'
            : 'text-white-main'
        }`}
      >
        {preset.name}
      </TextBebas>
    </Pressable>
  );
}
