import { View } from 'react-native';

import { ControlButtonFrame } from './control-button-frame';
import { RandomIcon } from './control-button-icons';
import type { RandomButtonProps } from './control-button.types';

const WHITE_MAIN = '#FFFEE9';
const ORANGE_MAIN = '#D7452C';

export function RandomButton({
  enabled,
  accessibilityLabel = enabled ? 'Disable shuffle' : 'Enable shuffle',
  accessibilityState,
  ...pressableProps
}: RandomButtonProps) {
  return (
    <ControlButtonFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, selected: enabled }}
      {...pressableProps}
    >
      <View className="relative h-full w-full items-center justify-center border-2 border-orange-main bg-black-main">
        <RandomIcon color={enabled ? ORANGE_MAIN : WHITE_MAIN} />
      </View>
    </ControlButtonFrame>
  );
}
