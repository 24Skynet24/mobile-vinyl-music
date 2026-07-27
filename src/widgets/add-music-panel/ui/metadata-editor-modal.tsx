import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import type { MetadataEditor } from "@/features/import-music";
import { TextBebas } from "@/shared/ui/text";

type MetadataEditorModalProps = {
  editor: MetadataEditor | null;
  onChange: (changes: Partial<MetadataEditor>) => void;
  onClose: () => void;
  onSave: () => void;
};

const metadataFields = ["title", "artist", "album"] as const;

export function MetadataEditorModal({
  editor,
  onChange,
  onClose,
  onSave,
}: MetadataEditorModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={Boolean(editor)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/70 px-6"
          onPress={onClose}
        >
          <Pressable
            className="w-full max-w-[420px] gap-3 border-2 border-orange-main bg-black-main p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <TextBebas className="text-[28px] text-orange-main">
              Track details
            </TextBebas>
            {metadataFields.map((field) => (
              <TextInput
                className="border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
                key={field}
                onChangeText={(value) => onChange({ [field]: value })}
                placeholder={field[0].toUpperCase() + field.slice(1)}
                placeholderTextColor="#999999"
                value={editor?.[field]}
              />
            ))}
            <TextInput
              className="border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(yearText) =>
                onChange({ yearText: yearText.replace(/\D/g, "") })
              }
              placeholder="Year"
              placeholderTextColor="#999999"
              value={editor?.yearText}
            />
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
      </KeyboardAvoidingView>
    </Modal>
  );
}
