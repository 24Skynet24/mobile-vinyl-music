import { GradientBackground } from '@/shared/ui/gradient-background';
import { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  createBottomMenuEnterAnimation,
  createBottomMenuExitAnimation,
} from '../lib/animations';
import {
  bottomMenuItems,
  type BottomMenuAction,
} from '../model/menu-items';
import { BottomMenuButton } from './bottom-menu-button';

type BottomMenuProps = {
  onActionPress: (action: BottomMenuAction) => void;
};

const MENU_CONTENT_HEIGHT = 128;

export function BottomMenu({ onActionPress }: BottomMenuProps) {
  const { bottom } = useSafeAreaInsets();
  const menuHeight = MENU_CONTENT_HEIGHT + bottom;
  const enterBottomMenu = useMemo(
    () => createBottomMenuEnterAnimation(menuHeight),
    [menuHeight],
  );
  const exitBottomMenu = useMemo(
    () => createBottomMenuExitAnimation(menuHeight),
    [menuHeight],
  );

  return (
    <Animated.View
      className="absolute inset-x-0 bottom-0 z-30"
      entering={enterBottomMenu}
      exiting={exitBottomMenu}
      style={{ height: menuHeight }}
    >
      <GradientBackground>
        <SafeAreaView
          className="flex-1 flex-row items-start justify-center gap-4 pt-8"
          edges={['bottom']}
        >
          {bottomMenuItems.map((item) => (
            <BottomMenuButton
              key={item.id}
              accessibilityLabel={item.accessibilityLabel}
              iconName={item.iconName}
              onPress={() => onActionPress(item.id)}
            />
          ))}
        </SafeAreaView>
      </GradientBackground>
    </Animated.View>
  );
}
