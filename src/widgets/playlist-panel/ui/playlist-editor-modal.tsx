import { Modal, Pressable, TextInput, View } from "react-native";

import { CoverImage } from "@/shared/ui/cover-image";
import { TextBebas } from "@/shared/ui/text";

import type { PlaylistEditorState } from "../model/types";

const defaultPlaylistCover = require("@/shared/assets/img/playlist-cover.jpg");

type PlaylistEditorModalProps = {
  editor: PlaylistEditorState | null;
  onChange: (changes: Partial<PlaylistEditorState>) => void;
  onClose: () => void;
  onSave: () => void;
  onSelectCover: () => void;
};

export function PlaylistEditorModal({
  editor,
  onChange,
  onClose,
  onSave,
  onSelectCover,
}: PlaylistEditorModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={Boolean(editor)}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full items-center gap-4 border-2 border-orange-main bg-black-main p-5"
          onPress={(event) => event.stopPropagation()}
        >
          <TextBebas className="text-[28px] text-orange-main">
            {editor?.playlistId ? "Edit playlist" : "New playlist"}
          </TextBebas>

          <TextInput
            className="w-full border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
            onChangeText={(title) => onChange({ title })}
            placeholder="Name"
            placeholderTextColor="#999999"
            value={editor?.title}
          />
          <TextInput
            className="min-h-24 w-full border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
            multiline
            onChangeText={(description) => onChange({ description })}
            placeholder="Description"
            placeholderTextColor="#999999"
            textAlignVertical="top"
            value={editor?.description}
          />

          <Pressable
            accessibilityLabel="Select playlist cover"
            className="h-[120px] w-[120px]"
            onPress={onSelectCover}
          >
            <CoverImage
              fallbackSource={defaultPlaylistCover}
              uri={editor?.coverUri}
            />
          </Pressable>

          <View className="flex-row justify-end gap-3 pt-2">
            <Pressable className="px-4 py-3" onPress={onClose}>
              <TextBebas className="text-[18px] text-gray-main">
                Cancel
              </TextBebas>
            </Pressable>
            <Pressable
              className={`bg-orange-main px-5 py-3 ${
                editor?.title.trim() ? "" : "opacity-40"
              }`}
              disabled={!editor?.title.trim()}
              onPress={onSave}
            >
              <TextBebas className="text-[18px] text-white-main">
                Save
              </TextBebas>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
