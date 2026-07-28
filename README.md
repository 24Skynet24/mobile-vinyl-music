# Vinyl Music

Vinyl Music is a local music player for Android and iOS built with Expo and
React Native. It combines a vinyl-inspired interface with playlists, an
eight-band equalizer, background playback, and native media controls.

## Features

- Import audio files from the device
- Edit track title, artist, album, and year before importing
- Search and sort the local music library
- Create playlists with custom names, descriptions, and cover images
- Built-in Favorites playlist
- Play, pause, seek, skip, shuffle, and repeat controls
- Eight-band equalizer with built-in and custom presets
- Persistent library, playlists, equalizer settings, and playback position
- Background audio playback on Android
- Android notification media controls
- iOS background playback and lock-screen controls are configured but untested
- Track metadata and artwork in the system media panel

## Tech stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- `react-native-audio-api` for native playback and equalization
- `expo-audio` as the Expo Go playback fallback
- NativeWind and Tailwind CSS
- AsyncStorage and Expo FileSystem for local persistence

## Requirements

- Node.js and npm
- Android Studio, Android SDK, and a compatible JDK for local Android builds
- Xcode for local iOS builds
- An Expo account for EAS Build
- Git Bash on Windows for the `react-native-audio-api` installation script

## Installation

```bash
git clone <repository-url>
cd mobile-vinyl-music
npm install
```

## Development

Start the Expo development server:

```bash
npm start
```

Run the native Android development build:

```bash
npm run android
```

Run the native iOS development build:

```bash
npm run ios
```

Run the web version:

```bash
npm run web
```

The app can start in Expo Go using its `expo-audio` fallback. However, the
native equalizer and the full background media integration require a native
development or release build.

## Building an Android APK

### Local release build

```bash
npx expo run:android --variant release
```

The generated APK is located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

### EAS preview build

The `preview` profile in `eas.json` is configured to produce an installable
APK:

```bash
npx eas-cli@latest build --platform android --profile preview
```

You do not need to delete the `android` directory before a normal rebuild. If
the native project becomes stale after changing config plugins or native
dependencies, regenerate it with:

```bash
npx expo prebuild --clean --platform android
```

This command recreates the native project, so do not use it if the `android`
directory contains manual native changes that have not been preserved
elsewhere.

## Quality checks

Run ESLint:

```bash
npm run lint
```

Run the TypeScript compiler:

```bash
npx tsc --noEmit
```

## Project structure

```text
src/
|-- app/        Expo Router entry points
|-- pages/      Application pages
|-- widgets/    Player and sliding application panels
|-- features/   Playback, importing, playlists, and navigation logic
|-- entities/   Library, track, playlist, and equalizer state
|-- providers/  Root application providers
\-- shared/     Reusable UI, assets, and utilities
```

The project follows a feature-oriented architecture. Playback state and queue
management live in `src/features/playback`, while the native and Expo Go audio
engines are selected at runtime.

## Background playback

Android uses a foreground media service and a media notification. Its
background playback and notification controls are the currently supported and
tested implementation.

iOS background audio mode and the system Now Playing integration are
configured in the project, but they have not been tested on a physical iOS
device. The expected experience is similar in functionality, with playback
controls, seeking, metadata, and artwork available from the Lock Screen and
Control Center. It will not look or behave exactly like the Android
notification because each platform provides its own media interface and
lifecycle rules. iOS support should therefore be considered experimental
until it is verified on a standalone iOS build.

On supported platforms, background playback is intended to work while the app
is minimized or the device is locked. The operating system may stop playback
after the user force-quits the app.

## Local data

Imported audio and playlist covers are copied into the app's document
directory. Library data, playlists, presets, and playback state are stored
locally on the device. Uninstalling the app may remove this data.
