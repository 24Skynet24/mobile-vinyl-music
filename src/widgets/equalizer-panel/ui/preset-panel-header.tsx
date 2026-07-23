import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

const settingsIcon = require('@/shared/assets/icons/settings.svg');

type PresetPanelHeaderProps = {
  isEditing: boolean;
  onBack: () => void;
  onToggleSettings: () => void;
};

export function PresetPanelHeader({
  isEditing,
  onBack,
  onToggleSettings,
}: PresetPanelHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityLabel="Back to equalizer"
        accessibilityRole="button"
        className="flex-row items-center gap-2 rounded-[4px] border border-orange-main bg-black-main px-2 py-1 active:opacity-70"
        onPress={onBack}
      >
        <MaterialIcons color="#fffee9" name="arrow-back" size={22} />
        <TextBebas className="text-[20px] uppercase text-white-main">
          Equalizer
        </TextBebas>
      </Pressable>

      <Pressable
        accessibilityLabel={
          isEditing ? 'Close preset settings' : 'Open preset settings'
        }
        accessibilityRole="button"
        className="rounded-[4px] p-1 active:opacity-70"
        onPress={onToggleSettings}
      >
        <Image
          accessibilityLabel=""
          contentFit="contain"
          source={settingsIcon}
          style={{ height: 32, width: 32 }}
        />
      </Pressable>
    </View>
  );
}
