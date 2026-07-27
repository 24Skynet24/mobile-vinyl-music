import { FlatList, Modal, Pressable, View } from "react-native";

import type { Playlist } from "@/entities/playlist";
import type { Track } from "@/entities/track";
import { TextBebas, TextFutura } from "@/shared/ui/text";

type PlaylistPickerModalProps = {
  playlists: Playlist[];
  track: Track | null;
  onClose: () => void;
  onSelect: (playlistId: string) => void;
};

export function PlaylistPickerModal({
  playlists,
  track,
  onClose,
  onSelect,
}: PlaylistPickerModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={Boolean(track)}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-6"
        onPress={onClose}
      >
        <Pressable
          className="max-h-[80%] w-full max-w-[420px] gap-3 border-2 border-orange-main bg-black-main p-5"
          onPress={(event) => event.stopPropagation()}
        >
          <TextBebas className="text-[28px] text-orange-main">
            Add to playlist
          </TextBebas>
          <TextFutura className="text-[15px] text-white-main">
            {track?.title}
          </TextFutura>

          <FlatList
            className="shrink"
            contentContainerStyle={{ gap: 12 }}
            data={playlists}
            keyExtractor={(playlist) => playlist.id}
            ListEmptyComponent={
              <View className="py-4">
                <TextFutura className="text-center text-[15px] text-gray-main">
                  Create a playlist first.
                </TextFutura>
              </View>
            }
            renderItem={({ item: playlist }) => {
              const alreadyAdded = track
                ? playlist.trackIds.includes(track.id)
                : false;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: alreadyAdded }}
                  className={`border border-white-main px-4 py-3 ${
                    alreadyAdded ? "opacity-40" : "active:bg-orange-main"
                  }`}
                  disabled={alreadyAdded}
                  onPress={() => onSelect(playlist.id)}
                >
                  <TextBebas className="text-[18px] text-white-main">
                    {playlist.title} {alreadyAdded ? "· Added" : ""}
                  </TextBebas>
                </Pressable>
              );
            }}
          />

          <Pressable
            accessibilityRole="button"
            className="mt-2 self-end px-3 py-2"
            onPress={onClose}
          >
            <TextBebas className="text-[18px] text-gray-main">Cancel</TextBebas>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
