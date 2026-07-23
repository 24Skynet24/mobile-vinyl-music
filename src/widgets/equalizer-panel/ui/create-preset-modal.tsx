import { Modal, Pressable, TextInput, View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

type CreatePresetModalProps = {
  name: string;
  onCancel: () => void;
  onChangeName: (name: string) => void;
  onSave: () => void;
  visible: boolean;
};

export function CreatePresetModal({
  name,
  onCancel,
  onChangeName,
  onSave,
  visible,
}: CreatePresetModalProps) {
  const canSave = Boolean(name.trim());

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/75 px-6"
        onPress={onCancel}
      >
        <Pressable
          className="w-full max-w-[420px] gap-5 rounded-[8px] border-2 border-orange-main bg-black-main p-5"
          onPress={(event) => event.stopPropagation()}
        >
          <TextBebas className="text-[28px] uppercase text-orange-main">
            Create preset
          </TextBebas>

          <TextInput
            autoFocus
            className="w-full rounded-[4px] border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
            maxLength={30}
            onChangeText={onChangeName}
            onSubmitEditing={canSave ? onSave : undefined}
            placeholder="Preset name"
            placeholderTextColor="#999999"
            returnKeyType="done"
            value={name}
          />

          <View className="flex-row justify-end gap-3">
            <Pressable
              accessibilityRole="button"
              className="rounded-[4px] border border-orange-main px-4 py-2 active:opacity-70"
              onPress={onCancel}
            >
              <TextBebas className="text-[18px] uppercase text-white-main">
                Cancel
              </TextBebas>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className={`rounded-[4px] bg-orange-main px-4 py-2 active:opacity-70 ${
                canSave ? '' : 'opacity-40'
              }`}
              disabled={!canSave}
              onPress={onSave}
            >
              <TextBebas className="text-[18px] uppercase text-black-main">
                Save
              </TextBebas>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
