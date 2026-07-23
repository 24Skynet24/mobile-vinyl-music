import { View } from 'react-native';

import type { EqualizerBand } from '../model/types';
import { EqualizerBandRow } from './equalizer-band-row';
import { EqualizerScale } from './equalizer-scale';

type EqualizerControlProps = {
  bands: EqualizerBand[];
  onBandGainChange: (frequency: string, gain: number) => void;
};

export function EqualizerControl({
  bands,
  onBandGainChange,
}: EqualizerControlProps) {
  return (
    <View className="h-[420px] w-full max-w-[468px] rounded-[16px] bg-black-main px-6 py-4">
      <EqualizerScale />

      <View className="mt-8 flex-1 justify-between">
        {bands.map((band) => (
          <EqualizerBandRow
            key={band.frequency}
            {...band}
            onGainChange={(gain) =>
              onBandGainChange(band.frequency, gain)
            }
          />
        ))}
      </View>
    </View>
  );
}
