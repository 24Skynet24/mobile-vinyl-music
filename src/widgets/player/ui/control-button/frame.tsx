import type { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";

import type { ControlButtonFrameProps } from "./types";

export function ControlButtonFrame({
  children,
  className,
  disabled,
  hasOffset = true,
  ...pressableProps
}: PropsWithChildren<ControlButtonFrameProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`relative h-[52px] w-[52px] transition-transform duration-150 ease-out active:scale-95 disabled:opacity-40 ${className ?? ""}`}
      disabled={disabled}
      hitSlop={8}
      {...pressableProps}
    >
      {hasOffset && (
        <View className="absolute left-[3px] top-[3px] h-full w-full bg-orange-main" />
      )}

      {children}
    </Pressable>
  );
}
