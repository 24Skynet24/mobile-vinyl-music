import { View } from 'react-native';

import { ControlButtonFrame } from './control-button-frame';
import { RepeatIcon } from './control-button-icons';
import type { RepeatButtonProps } from './control-button.types';

const WHITE_MAIN = '#FFFEE9';
const ORANGE_MAIN = '#D7452C';

const REPEAT_LABELS = {
  none: 'Repeat disabled',
  all: 'Repeat enabled',
  one: 'Repeat one enabled',
} as const;

export function RepeatButton({
  mode,
  accessibilityLabel = REPEAT_LABELS[mode],
  accessibilityState,
  ...pressableProps
}: RepeatButtonProps) {
  const enabled = mode !== 'none';

  return (
    <ControlButtonFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, selected: enabled }}
      {...pressableProps}
    >
      <View className="relative h-full w-full items-center justify-center border-2 border-orange-main bg-black-main">
        <RepeatIcon
          color={enabled ? ORANGE_MAIN : WHITE_MAIN}
          showOne={mode === 'one'}
        />
      </View>
    </ControlButtonFrame>
  );
}
