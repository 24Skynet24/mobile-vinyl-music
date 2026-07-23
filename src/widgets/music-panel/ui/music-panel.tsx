import { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";

import { SearchToolbar } from "@/shared/ui/search-toolbar";
import { SlidingPanel } from "@/shared/ui/sliding-panel";
import { TextBebas } from "@/shared/ui/text";

import { filterTracks } from "../lib/filter-tracks";
import type { MusicPanelProps } from "../model/types";
import { useMusicPanel } from "../model/use-music-panel";
import { MusicTrackList } from "./music-track-list";
import { PlaylistPickerModal } from "./playlist-picker-modal";

const MUSIC_PANEL_HEIGHT_RATIO = 0.72;

export function MusicPanel({
  onClose,
  onSortChange,
  playlistId,
  sort,
}: MusicPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const {
    addSelectedTrackToPlaylist,
    closePlaylistPicker,
    currentTrack,
    openPlaylistPicker,
    playlist,
    playlists,
    playTrack,
    removeMusicTrack,
    tracks,
    trackToAdd,
  } = useMusicPanel(playlistId);
  const [query, setQuery] = useState("");
  const contentHeight = windowHeight * MUSIC_PANEL_HEIGHT_RATIO;
  const visibleTracks = useMemo(
    () => filterTracks({ playlist, query, sort, tracks }),
    [playlist, query, sort, tracks],
  );

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        <View className="flex-1 px-4 pt-4">
          <TextBebas className="pb-3 text-[28px] text-orange-main">
            {playlist?.title ?? "All music"}
          </TextBebas>
          <SearchToolbar
            onQueryChange={setQuery}
            onSortChange={onSortChange}
            placeholder="Search title, album or artist"
            query={query}
            selectedSort={sort}
          />
          <MusicTrackList
            activeTrackId={currentTrack?.id}
            isPlaylist={Boolean(playlist)}
            onAdd={openPlaylistPicker}
            onPlay={playTrack}
            onRemove={removeMusicTrack}
            query={query}
            tracks={visibleTracks}
          />
        </View>
      </SlidingPanel>

      <PlaylistPickerModal
        onClose={closePlaylistPicker}
        onSelect={addSelectedTrackToPlaylist}
        playlists={playlists}
        track={trackToAdd}
      />
    </>
  );
}
