import { View } from "react-native";

import { ControlButtonFrame } from "./frame";
import { ControlIcon } from "./icon";
import type { ControlButtonProps } from "./types";

export function ControlButton({
  icon,
  accessibilityLabel,
  className,
  disabled,
  ...pressableProps
}: ControlButtonProps) {
  const hasOffset = icon === "prev" || icon === "next";
  const isStop = icon === "stop";

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
          isStop
            ? "border-black-main bg-orange-main"
            : "border-orange-main bg-black-main"
        }`}
      >
        <ControlIcon icon={icon} />
      </View>
    </ControlButtonFrame>
  );
}
