import type { Playlist } from "@/entities/playlist";

export function filterPlaylists(playlists: Playlist[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return [...playlists]
    .filter((playlist) =>
      normalizedQuery
        ? [playlist.title, playlist.description].some((value) =>
            value.toLocaleLowerCase().includes(normalizedQuery),
          )
        : true,
    )
    .sort((left, right) => {
      if (left.id === "favorites") {
        return -1;
      }
      if (right.id === "favorites") {
        return 1;
      }
      return left.title.localeCompare(right.title);
    });
}
