import { View } from "react-native";
import Animated from "react-native-reanimated";

import { usePlayback } from "@/features/playback";
import { TextBebas } from "@/shared/ui/text";

import { usePlayerAnimation } from "../lib/use-player-animation";
import { Controls } from "./controls";
import { Timeline } from "./timeline";
import { Tonearm } from "./tonearm";
import { VinylRecord } from "./vinyl-record";

export function Player() {
  const {
    currentTrack,
    currentTime,
    cycleRepeatMode,
    duration,
    isHydrated,
    isPlaying,
    nextTrack,
    previousTrack,
    randomEnabled,
    repeatMode,
    seekTo,
    togglePlayback,
    toggleRandom,
  } = usePlayback();
  const { recordAnimatedStyle, tonearmAnimatedStyle } =
    usePlayerAnimation(isPlaying);
  const metadata = currentTrack
    ? [
        currentTrack.artist,
        currentTrack.album,
        currentTrack.year?.toString(),
      ].filter((value): value is string => Boolean(value))
    : [];

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
        <TextBebas className="w-full text-[42px] text-orange-main">
          {currentTrack?.title || (isHydrated ? "Music name" : "")}
        </TextBebas>
        {metadata.length > 0 ? (
          <View className="max-w-full flex-row flex-wrap items-center gap-2">
            {metadata.map((value, index) => (
              <View
                className="flex-row items-center gap-2"
                key={`${value}-${index}`}
              >
                {index > 0 ? (
                  <View className="h-2 w-2 rounded-full bg-gray-main" />
                ) : null}
                <TextBebas className="text-xl text-gray-main">
                  {value}
                </TextBebas>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View className="w-full">
        <Timeline
          currentTime={currentTime}
          disabled={!currentTrack}
          duration={duration}
          onSeek={seekTo}
        />
      </View>

      <Controls
        className="mb-8"
        isPlaying={isPlaying}
        randomEnabled={randomEnabled}
        repeatMode={repeatMode}
        onNextPress={nextTrack}
        onPlaybackTogglePress={togglePlayback}
        onPreviousPress={previousTrack}
        onRandomPress={toggleRandom}
        onRepeatPress={cycleRepeatMode}
      />
    </View>
  );
}
