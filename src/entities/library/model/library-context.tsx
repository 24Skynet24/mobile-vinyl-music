import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Playlist, PlaylistInput } from '@/entities/playlist';
import type { Track } from '@/entities/track';

import { deleteStoredFile } from '../lib/file-storage';

const STORAGE_KEY = 'vinyl-music/library-v1';

type LibraryState = {
  tracks: Track[];
  playlists: Playlist[];
};

type LibraryContextValue = LibraryState & {
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

const DEFAULT_PLAYLIST: Playlist = {
  id: 'favorites',
  title: 'Favorites',
  description: 'Your favorite records',
  trackIds: [],
  createdAt: Date.now(),
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeStoredTrack(track: Track): Track {
  const rawFileTitle = track.fileName.replace(/\.[^/.]+$/, '').trim();
  const [expectedTitle, ...artistParts] = rawFileTitle.split(' - ');
  const expectedArtist = artistParts.join(' - ').trim();
  const hasLegacyReversedMetadata =
    expectedArtist &&
    track.artist === expectedTitle.trim() &&
    track.title === expectedArtist;

  return {
    ...track,
    title: hasLegacyReversedMetadata ? expectedTitle.trim() : track.title,
    artist:
      track.artist === 'Unknown artist'
        ? ''
        : hasLegacyReversedMetadata
          ? expectedArtist
          : track.artist,
    album: track.album === 'Unknown album' ? '' : track.album,
  };
}

function normalizeStoredPlaylists(playlists: Playlist[]) {
  const storedFavorites = playlists.find(
    (playlist) => playlist.id === DEFAULT_PLAYLIST.id,
  );
  const favorites = storedFavorites
    ? {
        ...storedFavorites,
        coverUri: undefined,
        title: DEFAULT_PLAYLIST.title,
      }
    : DEFAULT_PLAYLIST;

  return [
    favorites,
    ...playlists.filter((playlist) => playlist.id !== DEFAULT_PLAYLIST.id),
  ];
}

export function LibraryProvider({ children }: PropsWithChildren) {
  const [library, setLibrary] = useState<LibraryState>({
    tracks: [],
    playlists: [DEFAULT_PLAYLIST],
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void AsyncStorage.getItem(STORAGE_KEY)
      .then((savedLibrary) => {
        if (!savedLibrary || !isMounted) {
          return;
        }

        const parsed = JSON.parse(savedLibrary) as Partial<LibraryState>;
        setLibrary({
          tracks: Array.isArray(parsed.tracks)
            ? parsed.tracks.map(normalizeStoredTrack)
            : [],
          playlists: Array.isArray(parsed.playlists)
            ? normalizeStoredPlaylists(parsed.playlists)
            : [DEFAULT_PLAYLIST],
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }, [isHydrated, library]);

  const addTracks = useCallback((tracks: Track[]) => {
    setLibrary((current) => ({
      ...current,
      tracks: [...current.tracks, ...tracks],
    }));
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setLibrary((current) => {
      const track = current.tracks.find((item) => item.id === trackId);
      try {
        deleteStoredFile(track?.uri);
      } catch {
        // The library entry still needs to be removed if the file was moved externally.
      }

      return {
        tracks: current.tracks.filter((item) => item.id !== trackId),
        playlists: current.playlists.map((playlist) => ({
          ...playlist,
          trackIds: playlist.trackIds.filter((id) => id !== trackId),
        })),
      };
    });
  }, []);

  const updateTrackDuration = useCallback(
    (trackId: string, duration: number) => {
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      setLibrary((current) => ({
        ...current,
        tracks: current.tracks.map((track) =>
          track.id === trackId && track.duration <= 0
            ? { ...track, duration }
            : track,
        ),
      }));
    },
    [],
  );

  const createPlaylist = useCallback((input: PlaylistInput) => {
    const id = createId();
    setLibrary((current) => ({
      ...current,
      playlists: [
        ...current.playlists,
        { ...input, id, trackIds: [], createdAt: Date.now() },
      ],
    }));
    return id;
  }, []);

  const updatePlaylist = useCallback(
    (playlistId: string, input: PlaylistInput) => {
      if (playlistId === DEFAULT_PLAYLIST.id) {
        return;
      }

      setLibrary((current) => ({
        ...current,
        playlists: current.playlists.map((playlist) => {
          if (playlist.id !== playlistId) {
            return playlist;
          }

          if (playlist.coverUri !== input.coverUri) {
            try {
              deleteStoredFile(playlist.coverUri);
            } catch {
              // Keep the edit even when an obsolete cached cover cannot be removed.
            }
          }

          return { ...playlist, ...input };
        }),
      }));
    },
    [],
  );

  const removePlaylist = useCallback((playlistId: string) => {
    if (playlistId === DEFAULT_PLAYLIST.id) {
      return;
    }

    setLibrary((current) => {
      const playlist = current.playlists.find((item) => item.id === playlistId);
      try {
        deleteStoredFile(playlist?.coverUri);
      } catch {
        // Removing the playlist should not depend on its cover file.
      }

      return {
        ...current,
        playlists: current.playlists.filter((item) => item.id !== playlistId),
      };
    });
  }, []);

  const addTrackToPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setLibrary((current) => ({
        ...current,
        playlists: current.playlists.map((playlist) =>
          playlist.id === playlistId && !playlist.trackIds.includes(trackId)
            ? { ...playlist, trackIds: [...playlist.trackIds, trackId] }
            : playlist,
        ),
      }));
    },
    [],
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setLibrary((current) => ({
        ...current,
        playlists: current.playlists.map((playlist) =>
          playlist.id === playlistId
            ? {
                ...playlist,
                trackIds: playlist.trackIds.filter((id) => id !== trackId),
              }
            : playlist,
        ),
      }));
    },
    [],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      ...library,
      isHydrated,
      addTracks,
      removeTrack,
      updateTrackDuration,
      createPlaylist,
      updatePlaylist,
      removePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
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
    throw new Error('useLibrary must be used inside LibraryProvider');
  }
  return library;
}
