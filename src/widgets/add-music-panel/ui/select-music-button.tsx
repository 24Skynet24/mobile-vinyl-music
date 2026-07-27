import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { TextBebas, TextFutura } from "@/shared/ui/text";

const selectMusicIcon = require("@/shared/assets/icons/select-music.svg");

type SelectMusicButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

export function SelectMusicButton({
  disabled = false,
  onPress,
}: SelectMusicButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Select one or more audio files"
      accessibilityState={{ disabled }}
      className={`mb-4 flex-row items-center justify-center gap-4 border-2 border-dashed border-orange-main bg-black-main/50 px-5 py-5 active:opacity-70 ${
        disabled ? "opacity-40" : ""
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Image
        accessibilityLabel=""
        contentFit="contain"
        source={selectMusicIcon}
        style={{ height: 52, width: 52 }}
      />

      <View className="flex-1">
        <TextBebas className="text-[24px] text-orange-main">
          Select your music
        </TextBebas>
        <TextFutura className="text-[14px] text-gray-main">
          Choose one or several audio files
        </TextFutura>
      </View>
    </Pressable>
  );
}
