import { View } from "react-native";

import { ControlButton, RandomButton, RepeatButton } from "../control-button";
import type { ControlsProps } from "./types";

export function Controls({
  className,
  disabled = false,
  isPlaying,
  randomEnabled,
  repeatMode,
  onNextPress,
  onPlaybackTogglePress,
  onPreviousPress,
  onRandomPress,
  onRepeatPress,
}: ControlsProps) {
  return (
    <View
      accessibilityRole="toolbar"
      className={`w-full max-w-[360px] flex-row gap-4 items-center justify-center self-center ${className ?? ""}`}
    >
      <RandomButton
        disabled={disabled}
        enabled={randomEnabled}
        onPress={onRandomPress}
      />
      <ControlButton
        accessibilityLabel="Previous track"
        disabled={disabled}
        icon="prev"
        onPress={onPreviousPress}
      />
      <ControlButton
        accessibilityLabel={isPlaying ? "Stop" : "Play"}
        disabled={disabled}
        icon={isPlaying ? "stop" : "play"}
        onPress={onPlaybackTogglePress}
      />
      <ControlButton
        accessibilityLabel="Next track"
        disabled={disabled}
        icon="next"
        onPress={onNextPress}
      />
      <RepeatButton
        disabled={disabled}
        mode={repeatMode}
        onPress={onRepeatPress}
      />
    </View>
  );
}
