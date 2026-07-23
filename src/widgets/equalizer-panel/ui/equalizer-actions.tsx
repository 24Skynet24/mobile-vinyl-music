import { Pressable, View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

const actions = ['Create preset', 'Presets', 'Save'];

export function EqualizerActions() {
  return (
    <View className="flex-row flex-wrap justify-center gap-4">
      {actions.map((action) => (
        <Pressable
          accessibilityRole="button"
          className="border border-orange-main bg-black-main active:opacity-70 px-4 py-2 rounded-[4px]"
          key={action}
        >
          <TextBebas className="text-[18px] uppercase text-white-main">
            {action}
          </TextBebas>
        </Pressable>
      ))}
    </View>
  );
}
