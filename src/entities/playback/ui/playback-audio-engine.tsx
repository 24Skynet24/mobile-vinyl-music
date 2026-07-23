import Constants, { ExecutionEnvironment } from 'expo-constants';
import type {
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';

import type {
  PlaybackAudioEngineHandle,
  PlaybackAudioEngineProps,
} from '../model/audio-engine-types';
import { ExpoGoPlaybackAudioEngine } from './playback-audio-engine.expo-go';

type PlaybackAudioEngineComponent = ForwardRefExoticComponent<
  PlaybackAudioEngineProps &
    RefAttributes<PlaybackAudioEngineHandle>
>;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const NativePlaybackAudioEngine = isExpoGo
  ? null
  : (
      // Expo Go cannot evaluate a module that imports custom native code.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./playback-audio-engine.native-api') as {
        PlaybackAudioEngine: PlaybackAudioEngineComponent;
      }
    ).PlaybackAudioEngine;

export const PlaybackAudioEngine: PlaybackAudioEngineComponent =
  NativePlaybackAudioEngine ?? ExpoGoPlaybackAudioEngine;
