import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";

import { useLibrary } from "@/entities/library";
import { SearchToolbar } from "@/shared/ui/search-toolbar";
import { SlidingPanel } from "@/shared/ui/sliding-panel";
import { TextBebas } from "@/shared/ui/text";

import { filterPlaylists } from "../lib/filter-playlists";
import type { PlaylistPanelProps } from "../model/types";
import { usePlaylistEditor } from "../model/use-playlist-editor";
import { PlaylistEditorModal } from "./playlist-editor-modal";
import { PlaylistItem } from "./playlist-item";

const PLAYLIST_PANEL_HEIGHT_RATIO = 0.72;

export function PlaylistPanel({ onClose, onOpenPlaylist }: PlaylistPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const { playlists, removePlaylist } = useLibrary();
  const {
    closeEditor,
    editor,
    openEditor,
    saveEditor,
    selectCover,
    updateEditor,
  } = usePlaylistEditor();
  const [query, setQuery] = useState("");
  const contentHeight = windowHeight * PLAYLIST_PANEL_HEIGHT_RATIO;

  const visiblePlaylists = useMemo(
    () => filterPlaylists(playlists, query),
    [playlists, query],
  );

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        <View className="flex-1 px-4 pt-4">
          <View className="flex-row items-center justify-between pb-3">
            <TextBebas className="text-[28px] text-orange-main">
              Playlists
            </TextBebas>
            <Pressable
              accessibilityLabel="Create playlist"
              className="border border-orange-main bg-black-main px-4 py-2 active:bg-orange-main"
              onPress={() => openEditor()}
            >
              <TextBebas className="text-[17px] text-white-main">
                + New
              </TextBebas>
            </Pressable>
          </View>

          <SearchToolbar
            onQueryChange={setQuery}
            placeholder="Search title or description"
            query={query}
            showSort={false}
          />

          <FlatList
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 24,
              paddingTop: 16,
            }}
            contentInsetAdjustmentBehavior="automatic"
            data={visiblePlaylists}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(playlist) => playlist.id}
            ListEmptyComponent={
              <View className="items-center px-6 py-12">
                <TextBebas className="text-center text-[24px] text-white-main">
                  {query ? "Nothing found" : "No playlists yet"}
                </TextBebas>
              </View>
            }
            renderItem={({ item }) => (
              <PlaylistItem
                image={item.id === "favorites" ? undefined : item.coverUri}
                isProtected={item.id === "favorites"}
                onDelete={() =>
                  Alert.alert(
                    "Delete playlist?",
                    `Tracks in ${item.title} will remain in your library.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => removePlaylist(item.id),
                      },
                    ],
                  )
                }
                onEdit={() => openEditor(item)}
                onPress={() => onOpenPlaylist(item.id)}
                playlistDescription={item.description}
                playlistTitle={item.title}
                trackCount={item.trackIds.length}
              />
            )}
          />
        </View>
      </SlidingPanel>

      <PlaylistEditorModal
        editor={editor}
        onChange={updateEditor}
        onClose={closeEditor}
        onSave={saveEditor}
        onSelectCover={() => void selectCover()}
      />
    </>
  );
}
