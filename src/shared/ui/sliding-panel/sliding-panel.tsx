import { GradientBackground } from '@/shared/ui/gradient-background';
import { Overlay } from '@/shared/ui/overlay';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  createSlidingPanelEnterAnimation,
  createSlidingPanelExitAnimation,
} from './animations';

type SlidingPanelProps = {
  contentClassName?: string;
  contentHeight: number;
  onClose: () => void;
};

export function SlidingPanel({
  children,
  contentClassName,
  contentHeight,
  onClose,
}: PropsWithChildren<SlidingPanelProps>) {
  const { bottom } = useSafeAreaInsets();
  const panelHeight = contentHeight + bottom;
  const enterAnimation = useMemo(
    () => createSlidingPanelEnterAnimation(panelHeight),
    [panelHeight],
  );
  const exitAnimation = useMemo(
    () => createSlidingPanelExitAnimation(panelHeight),
    [panelHeight],
  );

  return (
    <>
      <Overlay onPress={onClose} />

      <Animated.View
        className="absolute inset-x-0 bottom-0 z-30"
        entering={enterAnimation}
        exiting={exitAnimation}
        style={{ height: panelHeight }}
      >
        <GradientBackground>
          <SafeAreaView
            className={`flex-1 ${contentClassName ?? ''}`}
            edges={['bottom']}
          >
            {children}
          </SafeAreaView>
        </GradientBackground>
      </Animated.View>
    </>
  );
}
