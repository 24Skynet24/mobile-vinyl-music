import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const PLAYING_TONEARM_ROTATION = -8;
const STOPPED_TONEARM_ROTATION = 40;
const RECORD_ROTATION_DURATION = 10000;
const TONEARM_ANIMATION_DURATION = 450;

export function usePlayerAnimation(isPlaying: boolean) {
  const recordRotation = useSharedValue(0);
  const tonearmRotation = useSharedValue(STOPPED_TONEARM_ROTATION);

  const recordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${recordRotation.value}deg` }],
  }));

  const tonearmAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tonearmRotation.value}deg` }],
  }));

  useEffect(() => {
    tonearmRotation.value = withTiming(
      isPlaying ? PLAYING_TONEARM_ROTATION : STOPPED_TONEARM_ROTATION,
      {
        duration: TONEARM_ANIMATION_DURATION,
        easing: Easing.inOut(Easing.cubic),
      },
    );

    if (isPlaying) {
      recordRotation.value = withRepeat(
        withTiming(recordRotation.value + 360, {
          duration: RECORD_ROTATION_DURATION,
          easing: Easing.linear,
        }),
        -1,
      );
    } else {
      cancelAnimation(recordRotation);
    }

    return () => {
      cancelAnimation(recordRotation);
      cancelAnimation(tonearmRotation);
    };
  }, [isPlaying, recordRotation, tonearmRotation]);

  return { recordAnimatedStyle, tonearmAnimatedStyle };
}
