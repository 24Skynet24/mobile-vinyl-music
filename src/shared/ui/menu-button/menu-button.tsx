import type { PressableProps } from "react-native";
import { Pressable, View } from "react-native";

type MenuButtonProps = Pick<PressableProps, "onPress">;

export function MenuButton({ onPress }: MenuButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      className="h-[36px] w-[36px] items-center justify-center gap-1 rounded bg-black-main/30 active:opacity-60"
      hitSlop={8}
      onPress={onPress}
    >
      {[0, 1, 2].map((item) => (
        <View key={item} className="flex-row items-center gap-1">
          <View className="h-1 w-1 rounded-full bg-orange-main" />
          <View className="h-1 w-5 rounded-full bg-orange-main" />
        </View>
      ))}
    </Pressable>
  );
}