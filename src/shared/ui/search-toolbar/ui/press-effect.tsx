import type { PropsWithChildren } from 'react';
import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressEffectProps = PropsWithChildren<
  PressableProps & { className?: string }
>;

export function PressEffect({
  children,
  onPressIn,
  onPressOut,
  ...props
}: PressEffectProps) {
  const progress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.2,
    transform: [{ scale: 1 - progress.value * 0.04 }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        progress.value = withTiming(1, { duration: 90 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        progress.value = withTiming(0, { duration: 140 });
        onPressOut?.(event);
      }}
      style={animatedStyle}
    >
      {children}
    </AnimatedPressable>
  );
}
