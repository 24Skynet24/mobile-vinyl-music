import { FlatList, View } from "react-native";

import { TextBebas } from "@/shared/ui/text";
import { TrackListItem } from "@/shared/ui/track-list-item";

import { formatFileSize } from "../lib/track-metadata";
import type { PendingTrack } from "../model/types";

type PendingTrackListProps = {
  tracks: PendingTrack[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

export function PendingTrackList({
  tracks,
  onEdit,
  onRemove,
}: PendingTrackListProps) {
  return (
    <FlatList
      contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
      contentInsetAdjustmentBehavior="automatic"
      data={tracks}
      keyExtractor={({ asset }, index) => `${asset.uri}:${index}`}
      ListEmptyComponent={
        <View className="items-center px-6 py-10">
          <TextBebas className="text-center text-[22px] text-white-main">
            Selected files will appear here
          </TextBebas>
        </View>
      }
      renderItem={({ item, index }) => (
        <TrackListItem
          duration={item.duration}
          isRemove
          onPress={() => onEdit(index)}
          onRemove={() => onRemove(index)}
          subtitle={[item.metadata.artist, formatFileSize(item.asset.size)]
            .filter(Boolean)
            .join(" · ")}
          title={item.metadata.title}
        />
      )}
    />
  );
}
