import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';

import type { BottomMenuIconName } from '../model/menu-items';
import { BottomMenuIcon } from './bottom-menu-icon';

type BottomMenuButtonProps = Pick<PressableProps, 'onPress'> & {
  accessibilityLabel: string;
  iconName: BottomMenuIconName;
};

export function BottomMenuButton({
  accessibilityLabel,
  iconName,
  onPress,
}: BottomMenuButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-20 w-20 items-center justify-center rounded-lg bg-black-main transition-transform duration-150 ease-out active:scale-95"
      hitSlop={8}
      onPress={onPress}
    >
      <BottomMenuIcon iconName={iconName} />
    </Pressable>
  );
}
