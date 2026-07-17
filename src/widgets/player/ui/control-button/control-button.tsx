import { View } from 'react-native';

import { ControlButtonFrame } from './control-button-frame';
import { ControlIcon } from './control-button-icons';
import type { ControlButtonProps } from './control-button.types';

export function ControlButton({
  icon,
  accessibilityLabel,
  className,
  disabled,
  ...pressableProps
}: ControlButtonProps) {
  const hasOffset = icon === 'prev' || icon === 'next';
  const isPause = icon === 'pause';

  return (
    <ControlButtonFrame
      accessibilityLabel={accessibilityLabel}
      className={className}
      disabled={disabled}
      hasOffset={hasOffset}
      {...pressableProps}
    >
      <View
        className={`relative h-full w-full items-center justify-center border-2 ${
          isPause
            ? 'border-black-main bg-orange-main'
            : 'border-orange-main bg-black-main'
        }`}
      >
        <ControlIcon icon={icon} />
      </View>
    </ControlButtonFrame>
  );
}
