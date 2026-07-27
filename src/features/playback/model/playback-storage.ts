import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYBACK_STORAGE_KEY = "vinyl-music/playback-v1";

export type StoredPlaybackState = {
  position: number;
  trackId: string;
};

export async function loadPlaybackState(): Promise<StoredPlaybackState | null> {
  try {
    const savedState = await AsyncStorage.getItem(PLAYBACK_STORAGE_KEY);
    if (!savedState) {
      return null;
    }

    const parsed = JSON.parse(savedState) as Partial<StoredPlaybackState>;
    if (typeof parsed.trackId !== "string") {
      return null;
    }

    return {
      position:
        typeof parsed.position === "number" && Number.isFinite(parsed.position)
          ? Math.max(0, parsed.position)
          : 0,
      trackId: parsed.trackId,
    };
  } catch {
    return null;
  }
}

export function savePlaybackState(state: StoredPlaybackState) {
  return AsyncStorage.setItem(
    PLAYBACK_STORAGE_KEY,
    JSON.stringify(state),
  ).catch(() => undefined);
}

export function clearPlaybackState() {
  return AsyncStorage.removeItem(PLAYBACK_STORAGE_KEY).catch(() => undefined);
}
