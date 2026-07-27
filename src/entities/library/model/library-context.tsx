import type { PropsWithChildren } from "react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import type { PlaylistInput } from "@/entities/playlist/@x/library";
import type { Track } from "@/entities/track/@x/library";

import { deleteStoredFile } from "../lib/file-storage";
import {
  createInitialLibraryState,
  DEFAULT_PLAYLIST_ID,
  libraryReducer,
  type LibraryAction,
} from "./library-state";
import { loadLibraryState, saveLibraryState } from "./library-storage";

type LibraryContextValue = ReturnType<typeof createInitialLibraryState> & {
  isHydrated: boolean;
  addTracks: (tracks: Track[]) => void;
  removeTrack: (trackId: string) => void;
  updateTrackDuration: (trackId: string, duration: number) => void;
  createPlaylist: (input: PlaylistInput) => string;
  updatePlaylist: (playlistId: string, input: PlaylistInput) => void;
  removePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function safelyDeleteStoredFile(uri?: string) {
  try {
    deleteStoredFile(uri);
  } catch {
    // A stale or externally moved file must not block the state update.
  }
}

export function LibraryProvider({ children }: PropsWithChildren) {
  const [library, dispatch] = useReducer(
    libraryReducer,
    undefined,
    createInitialLibraryState,
  );
  const libraryRef = useRef(library);
  const isHydratedRef = useRef(false);
  const pendingActionsRef = useRef<LibraryAction[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  libraryRef.current = library;

  const dispatchAction = useCallback((action: LibraryAction) => {
    if (!isHydratedRef.current) {
      pendingActionsRef.current.push(action);
    }
    dispatch(action);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void loadLibraryState()
      .then((savedLibrary) => {
        if (savedLibrary && isMounted) {
          dispatch({ state: savedLibrary, type: "hydrate" });
          pendingActionsRef.current.forEach(dispatch);
        }
      })
      .finally(() => {
        if (isMounted) {
          pendingActionsRef.current = [];
          isHydratedRef.current = true;
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void saveLibraryState(library);
    }
  }, [isHydrated, library]);

  const addTracks = useCallback(
    (tracks: Track[]) => {
      dispatchAction({ tracks, type: "tracks/add" });
    },
    [dispatchAction],
  );

  const removeTrack = useCallback(
    (trackId: string) => {
      const track = libraryRef.current.tracks.find(
        (item) => item.id === trackId,
      );
      dispatchAction({ trackId, type: "tracks/remove" });
      safelyDeleteStoredFile(track?.uri);
    },
    [dispatchAction],
  );

  const updateTrackDuration = useCallback(
    (trackId: string, duration: number) => {
      dispatchAction({ duration, trackId, type: "tracks/update-duration" });
    },
    [dispatchAction],
  );

  const createPlaylist = useCallback(
    (input: PlaylistInput) => {
      const id = createId();
      dispatchAction({
        playlist: {
          ...input,
          createdAt: Date.now(),
          id,
          trackIds: [],
        },
        type: "playlists/create",
      });
      return id;
    },
    [dispatchAction],
  );

  const updatePlaylist = useCallback(
    (playlistId: string, input: PlaylistInput) => {
      if (playlistId === DEFAULT_PLAYLIST_ID) {
        return;
      }

      const previousCoverUri = libraryRef.current.playlists.find(
        (playlist) => playlist.id === playlistId,
      )?.coverUri;
      dispatchAction({ input, playlistId, type: "playlists/update" });

      if (previousCoverUri !== input.coverUri) {
        safelyDeleteStoredFile(previousCoverUri);
      }
    },
    [dispatchAction],
  );

  const removePlaylist = useCallback(
    (playlistId: string) => {
      if (playlistId === DEFAULT_PLAYLIST_ID) {
        return;
      }

      const coverUri = libraryRef.current.playlists.find(
        (playlist) => playlist.id === playlistId,
      )?.coverUri;
      dispatchAction({ playlistId, type: "playlists/remove" });
      safelyDeleteStoredFile(coverUri);
    },
    [dispatchAction],
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      dispatchAction({ playlistId, trackId, type: "playlists/add-track" });
    },
    [dispatchAction],
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      dispatchAction({ playlistId, trackId, type: "playlists/remove-track" });
    },
    [dispatchAction],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      ...library,
      addTrackToPlaylist,
      addTracks,
      createPlaylist,
      isHydrated,
      removePlaylist,
      removeTrack,
      removeTrackFromPlaylist,
      updatePlaylist,
      updateTrackDuration,
    }),
    [
      addTrackToPlaylist,
      addTracks,
      createPlaylist,
      isHydrated,
      library,
      removePlaylist,
      removeTrack,
      removeTrackFromPlaylist,
      updatePlaylist,
      updateTrackDuration,
    ],
  );

  return <LibraryContext value={value}>{children}</LibraryContext>;
}

export function useLibrary() {
  const library = use(LibraryContext);
  if (!library) {
    throw new Error("useLibrary must be used inside LibraryProvider");
  }
  return library;
}
