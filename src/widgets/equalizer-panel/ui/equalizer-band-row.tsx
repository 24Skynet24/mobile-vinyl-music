import { View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

import { formatGain } from '../lib/gain';
import type { EqualizerBandRowProps } from '../model/types';
import { EqualizerSlider } from './equalizer-slider';

export function EqualizerBandRow({
  frequency,
  gain,
  onGainChange,
}: EqualizerBandRowProps) {
  return (
    <View className="w-full flex-row items-center">
      <TextBebas className="w-[48px] text-left text-[22px] uppercase text-white-main">
        {frequency}
      </TextBebas>

      <EqualizerSlider
        frequency={frequency}
        gain={gain}
        onGainChange={onGainChange}
      />

      <TextBebas
        className="w-8 text-right text-[22px] text-orange-main"
        numberOfLines={1}
      >
        {formatGain(gain)}
      </TextBebas>
    </View>
  );
}
