import { FlatList, View } from "react-native";

import type { Track } from "@/entities/track";
import { TextBebas, TextFutura } from "@/shared/ui/text";
import { TrackListItem } from "@/shared/ui/track-list-item";

type MusicTrackListProps = {
  activeTrackId?: string;
  isPlaylist: boolean;
  query: string;
  tracks: Track[];
  onAdd: (track: Track) => void;
  onPlay: (trackId: string, queueIds: string[]) => void;
  onRemove: (track: Track, queueIds: string[]) => void;
};

export function MusicTrackList({
  activeTrackId,
  isPlaylist,
  query,
  tracks,
  onAdd,
  onPlay,
  onRemove,
}: MusicTrackListProps) {
  const queueIds = tracks.map((track) => track.id);

  return (
    <FlatList
      contentContainerStyle={{ gap: 8, paddingBottom: 24, paddingTop: 16 }}
      contentInsetAdjustmentBehavior="automatic"
      data={tracks}
      keyboardShouldPersistTaps="handled"
      keyExtractor={(track) => track.id}
      ListEmptyComponent={
        <View className="items-center px-6 py-12">
          <TextBebas className="text-center text-[24px] text-white-main">
            {query ? "Nothing found" : "No music here yet"}
          </TextBebas>
          <TextFutura className="pt-2 text-center text-[15px] text-gray-main">
            {query
              ? "Try another title, album or artist."
              : isPlaylist
                ? "Add tracks from the all music panel."
                : "Use add music to import audio files."}
          </TextFutura>
        </View>
      }
      renderItem={({ item }) => (
        <TrackListItem
          coverUri={item.coverUri}
          duration={item.duration}
          isActive={activeTrackId === item.id}
          isAdd={!isPlaylist}
          isRemove
          onAdd={() => onAdd(item)}
          onPress={() => onPlay(item.id, queueIds)}
          onRemove={() => onRemove(item, queueIds)}
          subtitle={[item.artist, item.album].filter(Boolean).join(" · ")}
          title={item.title}
        />
      )}
    />
  );
}
