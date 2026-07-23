import { ScrollView } from 'react-native';

import type { EqualizerBand } from '../model/types';
import { EqualizerActions } from './equalizer-actions';
import { EqualizerControl } from './equalizer-control';

type EqualizerViewProps = {
  bands: EqualizerBand[];
  onBandGainChange: (frequency: string, gain: number) => void;
  onCreatePreset: () => void;
  onOpenPresets: () => void;
  onSavePreset: () => void;
  showSave: boolean;
};

export function EqualizerView({
  bands,
  onBandGainChange,
  onCreatePreset,
  onOpenPresets,
  onSavePreset,
  showSave,
}: EqualizerViewProps) {
  return (
    <ScrollView
      contentContainerClassName="items-center gap-6 px-8 pb-4 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <EqualizerActions
        onCreatePreset={onCreatePreset}
        onOpenPresets={onOpenPresets}
        onSavePreset={onSavePreset}
        showSave={showSave}
      />
      <EqualizerControl
        bands={bands}
        onBandGainChange={onBandGainChange}
      />
    </ScrollView>
  );
}
