import { View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

export function EqualizerScale() {
  return (
    <View className="flex-row items-center justify-between">
      <TextBebas className="text-[20px] uppercase text-white-main">
        -12DB
      </TextBebas>
      <TextBebas className="text-[20px] uppercase text-white-main">
        Gain
      </TextBebas>
      <TextBebas className="text-[20px] uppercase text-white-main">
        12DB
      </TextBebas>
    </View>
  );
}
