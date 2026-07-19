import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type OverlayProps = {
  onPress: () => void;
};

export function Overlay({ onPress }: OverlayProps) {
  return (
    <Animated.View
      className="absolute inset-0 z-20 bg-black/[0.68]"
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(200)}
    >
      <Pressable
        accessibilityLabel="Close menu"
        accessibilityRole="button"
        className="flex-1"
        onPress={onPress}
      />
    </Animated.View>
  );
}
