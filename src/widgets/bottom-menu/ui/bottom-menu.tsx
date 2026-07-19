import { GradientBg } from '@/shared/ui/gradient-bg';
import { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { createEnterBottomMenu, createExitBottomMenu } from './animation';
import { type BottomMenuAction } from './data';
import { MenuButton } from '@/shared/ui/menu-button';
import { View } from 'react-native';

type BottomMenuProps = {
  onActionPress?: (action: BottomMenuAction) => void;
};

const MENU_CONTENT_HEIGHT = 128;

export function BottomMenu({ onActionPress }: BottomMenuProps) {
  const { bottom } = useSafeAreaInsets();
  const menuHeight = MENU_CONTENT_HEIGHT + bottom;
  const enterBottomMenu = useMemo(
    () => createEnterBottomMenu(menuHeight),
    [menuHeight],
  );
  const exitBottomMenu = useMemo(
    () => createExitBottomMenu(menuHeight),
    [menuHeight],
  );

  return (
    <Animated.View
      className="absolute inset-x-0 bottom-0 z-30"
      entering={enterBottomMenu}
      exiting={exitBottomMenu}
      style={{ height: menuHeight }}
    >
      <GradientBg>
        <View className='flex flex-row items-start justify-center flex-1 mt-8 gap-4'>
          <MenuButton iconName='equalizer' onPress={() => {}}/>
          <MenuButton iconName='add-music' onPress={() => {}}/>
          <MenuButton iconName='all-music' onPress={() => {}}/>
          <MenuButton iconName='playlists' onPress={() => {}}/>
        </View>
      </GradientBg>
    </Animated.View>
  );
}
