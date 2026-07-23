import type { Playlist } from "@/entities/playlist";
import type { Track } from "@/entities/track";
import type { SortType } from "@/shared/ui/search-toolbar";

function sortTracks(tracks: Track[], sort: SortType) {
  return [...tracks].sort((left, right) => {
    if (sort === "alphabet") {
      return left.title.localeCompare(right.title);
    }
    if (sort === "duration") {
      return right.duration - left.duration;
    }
    return right.addedAt - left.addedAt;
  });
}

type FilterTracksParams = {
  playlist?: Playlist;
  query: string;
  sort: SortType;
  tracks: Track[];
};

export function filterTracks({
  playlist,
  query,
  sort,
  tracks,
}: FilterTracksParams) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sourceTracks = playlist
    ? tracks.filter((track) => playlist.trackIds.includes(track.id))
    : tracks;
  const filteredTracks = normalizedQuery
    ? sourceTracks.filter((track) =>
        [track.title, track.album, track.artist].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : sourceTracks;

  return sortTracks(filteredTracks, sort);
}
