import type { Playlist, PlaylistInput } from "@/entities/playlist/@x/library";
import type { Track } from "@/entities/track/@x/library";

export const DEFAULT_PLAYLIST_ID = "favorites";

export type LibraryState = {
  playlists: Playlist[];
  tracks: Track[];
};

export type LibraryAction =
  | { type: "hydrate"; state: LibraryState }
  | { type: "tracks/add"; tracks: Track[] }
  | { type: "tracks/remove"; trackId: string }
  | {
      type: "tracks/update-duration";
      duration: number;
      trackId: string;
    }
  | { type: "playlists/create"; playlist: Playlist }
  | {
      type: "playlists/update";
      input: PlaylistInput;
      playlistId: string;
    }
  | { type: "playlists/remove"; playlistId: string }
  | {
      type: "playlists/add-track";
      playlistId: string;
      trackId: string;
    }
  | {
      type: "playlists/remove-track";
      playlistId: string;
      trackId: string;
    };

function createDefaultPlaylist(): Playlist {
  return {
    createdAt: Date.now(),
    description: "Your favorite records",
    id: DEFAULT_PLAYLIST_ID,
    title: "Favorites",
    trackIds: [],
  };
}

export function createInitialLibraryState(): LibraryState {
  return {
    playlists: [createDefaultPlaylist()],
    tracks: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStoredTrack(value: unknown): Track | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.title !== "string" ||
    typeof value.uri !== "string"
  ) {
    return null;
  }

  const rawFileTitle = value.fileName.replace(/\.[^/.]+$/, "").trim();
  const [expectedTitle, ...artistParts] = rawFileTitle.split(" - ");
  const expectedArtist = artistParts.join(" - ").trim();
  const storedArtist = typeof value.artist === "string" ? value.artist : "";
  const hasLegacyReversedMetadata =
    Boolean(expectedArtist) &&
    storedArtist === expectedTitle.trim() &&
    value.title === expectedArtist;

  return {
    addedAt:
      typeof value.addedAt === "number" && Number.isFinite(value.addedAt)
        ? value.addedAt
        : 0,
    album:
      typeof value.album === "string" && value.album !== "Unknown album"
        ? value.album
        : "",
    artist:
      storedArtist === "Unknown artist"
        ? ""
        : hasLegacyReversedMetadata
          ? expectedArtist
          : storedArtist,
    coverUri: typeof value.coverUri === "string" ? value.coverUri : undefined,
    duration:
      typeof value.duration === "number" && Number.isFinite(value.duration)
        ? Math.max(0, value.duration)
        : 0,
    fileName: value.fileName,
    id: value.id,
    title: hasLegacyReversedMetadata ? expectedTitle.trim() : value.title,
    uri: value.uri,
    year:
      typeof value.year === "number" && Number.isFinite(value.year)
        ? value.year
        : null,
  };
}

function normalizeStoredPlaylist(
  value: unknown,
  trackIds: Set<string>,
): Playlist | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string"
  ) {
    return null;
  }

  return {
    coverUri: typeof value.coverUri === "string" ? value.coverUri : undefined,
    createdAt:
      typeof value.createdAt === "number" && Number.isFinite(value.createdAt)
        ? value.createdAt
        : 0,
    description: typeof value.description === "string" ? value.description : "",
    id: value.id,
    title: value.title,
    trackIds: Array.isArray(value.trackIds)
      ? [
          ...new Set(
            value.trackIds.filter(
              (trackId): trackId is string =>
                typeof trackId === "string" && trackIds.has(trackId),
            ),
          ),
        ]
      : [],
  };
}

export function normalizeLibraryState(value: unknown): LibraryState {
  if (!isRecord(value)) {
    return createInitialLibraryState();
  }

  const tracks = Array.isArray(value.tracks)
    ? value.tracks.flatMap((track) => {
        const normalizedTrack = normalizeStoredTrack(track);
        return normalizedTrack ? [normalizedTrack] : [];
      })
    : [];
  const validTrackIds = new Set(tracks.map((track) => track.id));
  const storedPlaylists = Array.isArray(value.playlists)
    ? value.playlists.flatMap((playlist) => {
        const normalizedPlaylist = normalizeStoredPlaylist(
          playlist,
          validTrackIds,
        );
        return normalizedPlaylist ? [normalizedPlaylist] : [];
      })
    : [];
  const storedFavorites = storedPlaylists.find(
    (playlist) => playlist.id === DEFAULT_PLAYLIST_ID,
  );
  const favorites: Playlist = storedFavorites
    ? {
        ...storedFavorites,
        coverUri: undefined,
        title: "Favorites",
      }
    : createDefaultPlaylist();

  return {
    playlists: [
      favorites,
      ...storedPlaylists.filter(
        (playlist) => playlist.id !== DEFAULT_PLAYLIST_ID,
      ),
    ],
    tracks,
  };
}

export function libraryReducer(
  state: LibraryState,
  action: LibraryAction,
): LibraryState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "tracks/add": {
      const knownIds = new Set(state.tracks.map((track) => track.id));
      const tracks = action.tracks.filter((track) => {
        if (knownIds.has(track.id)) {
          return false;
        }
        knownIds.add(track.id);
        return true;
      });

      return tracks.length > 0
        ? { ...state, tracks: [...state.tracks, ...tracks] }
        : state;
    }
    case "tracks/remove":
      return {
        playlists: state.playlists.map((playlist) => ({
          ...playlist,
          trackIds: playlist.trackIds.filter(
            (trackId) => trackId !== action.trackId,
          ),
        })),
        tracks: state.tracks.filter((track) => track.id !== action.trackId),
      };
    case "tracks/update-duration":
      if (!Number.isFinite(action.duration) || action.duration <= 0) {
        return state;
      }

      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === action.trackId && track.duration <= 0
            ? { ...track, duration: action.duration }
            : track,
        ),
      };
    case "playlists/create":
      return {
        ...state,
        playlists: [...state.playlists, action.playlist],
      };
    case "playlists/update":
      if (action.playlistId === DEFAULT_PLAYLIST_ID) {
        return state;
      }

      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.playlistId
            ? { ...playlist, ...action.input }
            : playlist,
        ),
      };
    case "playlists/remove":
      if (action.playlistId === DEFAULT_PLAYLIST_ID) {
        return state;
      }

      return {
        ...state,
        playlists: state.playlists.filter(
          (playlist) => playlist.id !== action.playlistId,
        ),
      };
    case "playlists/add-track": {
      if (!state.tracks.some((track) => track.id === action.trackId)) {
        return state;
      }

      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.playlistId &&
          !playlist.trackIds.includes(action.trackId)
            ? {
                ...playlist,
                trackIds: [...playlist.trackIds, action.trackId],
              }
            : playlist,
        ),
      };
    }
    case "playlists/remove-track":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.playlistId
            ? {
                ...playlist,
                trackIds: playlist.trackIds.filter(
                  (trackId) => trackId !== action.trackId,
                ),
              }
            : playlist,
        ),
      };
  }
}
