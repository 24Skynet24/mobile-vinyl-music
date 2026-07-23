import { Pressable, View } from 'react-native';

import { formatGain, MAX_GAIN, MIN_GAIN } from '../lib/gain';
import type { EqualizerSliderProps } from '../model/types';
import { useEqualizerSlider } from '../model/use-equalizer-slider';

export function EqualizerSlider({
  frequency,
  gain,
  onGainChange,
}: EqualizerSliderProps) {
  const {
    changeGainBy,
    handleTrackLayout,
    progressWidth,
    trackRef,
    updateGainFromPointer,
  } = useEqualizerSlider({ gain, onGainChange });

  return (
    <Pressable
      accessibilityActions={[
        { name: 'increment', label: 'Increase gain' },
        { name: 'decrement', label: 'Decrease gain' },
      ]}
      accessibilityLabel={`${frequency} hertz gain`}
      accessibilityRole="adjustable"
      accessibilityValue={{
        max: MAX_GAIN,
        min: MIN_GAIN,
        now: Math.round(gain),
        text: `${formatGain(gain)} dB`,
      }}
      className="relative mx-4 h-5 flex-1 justify-center"
      hitSlop={8}
      ref={trackRef}
      onAccessibilityAction={(event) =>
        changeGainBy(event.nativeEvent.actionName === 'increment' ? 1 : -1)
      }
      onLayout={handleTrackLayout}
      onPress={(event) =>
        updateGainFromPointer(
          event.nativeEvent as typeof event.nativeEvent & {
            offsetX?: number;
          },
        )
      }
      onPointerDown={(event) =>
        updateGainFromPointer(
          event.nativeEvent as typeof event.nativeEvent & {
            offsetX?: number;
          },
        )
      }
      onPointerMove={(event) => {
        if (event.nativeEvent.buttons !== 1) {
          return;
        }

        updateGainFromPointer(
          event.nativeEvent as typeof event.nativeEvent & {
            offsetX?: number;
          },
        );
      }}
      onTouchEnd={(event) => updateGainFromPointer(event.nativeEvent)}
      onTouchMove={(event) => updateGainFromPointer(event.nativeEvent)}
    >
      <View className="h-[6px] w-full overflow-hidden rounded-full bg-white-main">
        <View
          className="h-full rounded-full bg-orange-main"
          style={{ width: progressWidth }}
        />
      </View>
      <View
        className="absolute -ml-[7.5px] h-[15px] w-[15px] rounded-full bg-orange-main"
        style={{ left: progressWidth }}
      />
    </Pressable>
  );
}
