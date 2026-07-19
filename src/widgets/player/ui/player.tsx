import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePlayerAnimation } from '../lib/use-player-animation';
import type { RepeatMode } from './control-button';
import { Controls } from './controls';
import { Timeline } from './timeline';
import { Tonearm } from './tonearm';
import { VinylRecord } from './vinyl-record';

const NEXT_REPEAT_MODE: Record<RepeatMode, RepeatMode> = {
  all: 'one',
  none: 'all',
  one: 'none',
};

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomEnabled, setRandomEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const { recordAnimatedStyle, tonearmAnimatedStyle } =
    usePlayerAnimation(isPlaying);

  return (
    <View className="flex-1 items-center justify-between px-4 pt-8">
      <View className="relative mb-8 mt-[5vh] h-[300px] w-[300px] items-center justify-center">
        <Animated.View style={recordAnimatedStyle}>
          <VinylRecord />
        </Animated.View>

        <Animated.View
          className="absolute -top-4 right-0"
          style={tonearmAnimatedStyle}
        >
          <Tonearm />
        </Animated.View>
      </View>

      <View className="w-full gap-2">
        <Text className="w-full text-[42px] text-orange-main">Music name</Text>
        <View className="max-w-full flex-row items-center gap-2">
          <Text className="text-xl text-gray-main">Album</Text>
          <View className="h-2 w-2 rounded-full bg-gray-main" />
          <Text className="text-xl text-gray-main">2024</Text>
        </View>
      </View>

      <View className="w-full">
        <Timeline />
      </View>

      <Controls
        className="mb-8"
        isPlaying={isPlaying}
        randomEnabled={randomEnabled}
        repeatMode={repeatMode}
        onNextPress={() => {}}
        onPlaybackTogglePress={() => setIsPlaying((current) => !current)}
        onPreviousPress={() => {}}
        onRandomPress={() => setRandomEnabled((current) => !current)}
        onRepeatPress={() =>
          setRepeatMode((current) => NEXT_REPEAT_MODE[current])
        }
      />
    </View>
  );
}
