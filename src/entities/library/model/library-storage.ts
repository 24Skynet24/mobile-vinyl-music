import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeLibraryState, type LibraryState } from "./library-state";

const STORAGE_KEY = "vinyl-music/library-v1";

let pendingWrite: Promise<void> = Promise.resolve();

export async function loadLibraryState(): Promise<LibraryState | null> {
  try {
    const savedLibrary = await AsyncStorage.getItem(STORAGE_KEY);
    return savedLibrary
      ? normalizeLibraryState(JSON.parse(savedLibrary))
      : null;
  } catch {
    return null;
  }
}

export function saveLibraryState(state: LibraryState) {
  pendingWrite = pendingWrite
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)))
    .catch(() => undefined);

  return pendingWrite;
}
