import { View } from 'react-native';

import { useEqualizer } from '../model/use-equalizer';
import { EqualizerBandRow } from './equalizer-band-row';
import { EqualizerScale } from './equalizer-scale';

export function EqualizerControl() {
  const { bands, updateBandGain } = useEqualizer();

  return (
    <View className="h-[420px] w-full max-w-[468px] rounded-[16px] bg-black-main px-6 py-4">
      <EqualizerScale />

      <View className="mt-8 flex-1 justify-between">
        {bands.map((band) => (
          <EqualizerBandRow
            key={band.frequency}
            {...band}
            onGainChange={(gain) => updateBandGain(band.frequency, gain)}
          />
        ))}
      </View>
    </View>
  );
}
