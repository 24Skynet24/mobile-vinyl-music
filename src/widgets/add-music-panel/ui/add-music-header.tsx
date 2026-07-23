import { Pressable, View } from "react-native";

import { TextBebas } from "@/shared/ui/text";

type AddMusicHeaderProps = {
  isReadingDurations: boolean;
  isSaving: boolean;
  pendingTrackCount: number;
  onConfirm: () => void;
};

export function AddMusicHeader({
  isReadingDurations,
  isSaving,
  pendingTrackCount,
  onConfirm,
}: AddMusicHeaderProps) {
  const isDisabled = isSaving || isReadingDurations;

  return (
    <View className="flex-row items-center justify-between pb-3">
      <TextBebas className="text-[28px] text-orange-main">Add music</TextBebas>
      {pendingTrackCount > 0 ? (
        <Pressable
          className={`bg-orange-main px-4 py-2 active:opacity-70 ${
            isDisabled ? "opacity-40" : ""
          }`}
          disabled={isDisabled}
          onPress={onConfirm}
        >
          <TextBebas className="text-[17px] text-white-main">
            {isReadingDurations
              ? "Reading duration…"
              : `Confirm ${pendingTrackCount}`}
          </TextBebas>
        </Pressable>
      ) : null}
    </View>
  );
}
