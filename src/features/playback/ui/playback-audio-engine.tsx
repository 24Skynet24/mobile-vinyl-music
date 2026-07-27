import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import type {
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps,
} from "../model/audio-engine-types";
import { ExpoGoPlaybackAudioEngine } from "./playback-audio-engine.expo-go";

type PlaybackAudioEngineComponent = ForwardRefExoticComponent<
  PlaybackAudioEngineProps & RefAttributes<PlaybackAudioEngineHandle>
>;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/* eslint-disable @typescript-eslint/no-require-imports -- Expo Go must not evaluate the custom native module. */
const NativePlaybackAudioEngine = isExpoGo
  ? null
  : (
      require("./playback-audio-engine.native-api") as {
        PlaybackAudioEngine: PlaybackAudioEngineComponent;
      }
    ).PlaybackAudioEngine;
/* eslint-enable @typescript-eslint/no-require-imports */

export const PlaybackAudioEngine: PlaybackAudioEngineComponent =
  NativePlaybackAudioEngine ?? ExpoGoPlaybackAudioEngine;
