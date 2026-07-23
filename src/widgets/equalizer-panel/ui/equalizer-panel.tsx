import { ScrollView, useWindowDimensions } from 'react-native';

import { SlidingPanel } from '@/shared/ui/sliding-panel';

import type { EqualizerPanelProps } from '../model/types';
import { EqualizerActions } from './equalizer-actions';
import { EqualizerControl } from './equalizer-control';

const EQUALIZER_PANEL_HEIGHT_RATIO = 0.72;

export function EqualizerPanel({ onClose }: EqualizerPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const contentHeight = windowHeight * EQUALIZER_PANEL_HEIGHT_RATIO;

  return (
    <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
      <ScrollView
        contentContainerClassName="items-center gap-6 px-8 pb-4 pt-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <EqualizerActions />
        <EqualizerControl />
      </ScrollView>
    </SlidingPanel>
  );
}
