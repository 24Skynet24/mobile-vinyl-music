import { Pressable, View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

type EqualizerActionsProps = {
  onCreatePreset: () => void;
  onOpenPresets: () => void;
  onSavePreset: () => void;
  showSave: boolean;
};

export function EqualizerActions({
  onCreatePreset,
  onOpenPresets,
  onSavePreset,
  showSave,
}: EqualizerActionsProps) {
  const actions = [
    { label: 'Create preset', onPress: onCreatePreset, visible: true },
    { label: 'Presets', onPress: onOpenPresets, visible: true },
    { label: 'Save', onPress: onSavePreset, visible: showSave },
  ];

  return (
    <View className="flex-row flex-wrap justify-center gap-4">
      {actions.filter((action) => action.visible).map((action) => (
        <Pressable
          accessibilityRole="button"
          className="rounded-[4px] border border-orange-main bg-black-main px-4 py-2 active:opacity-70"
          key={action.label}
          onPress={action.onPress}
        >
          <TextBebas className="text-[18px] uppercase text-white-main">
            {action.label}
          </TextBebas>
        </Pressable>
      ))}
    </View>
  );
}
