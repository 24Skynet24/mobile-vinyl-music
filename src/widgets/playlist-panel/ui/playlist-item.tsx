import { Pressable, View } from "react-native";

import { CoverImage } from "@/shared/ui/cover-image";
import { TextBebas, TextFutura } from "@/shared/ui/text";

import type { PlaylistItemProps } from "../model/types";
import { PlaylistItemActions } from "./playlist-item-actions";

const cover = require("@/shared/assets/img/playlist-cover.jpg");

export function PlaylistItem({
  trackCount,
  playlistTitle,
  playlistDescription,
  onEdit,
  onDelete,
  onPress,
  image,
  isProtected = false,
}: PlaylistItemProps) {
  return (
    <Pressable
      accessibilityLabel={`Open ${playlistTitle}`}
      className="h-[120px] w-full flex-row gap-4 bg-black-main/40 active:opacity-70"
      onPress={onPress}
    >
      <View className="w-[120px] h-[120px]">
        <CoverImage fallbackSource={cover} uri={image} />
      </View>

      <View className="flex flex-col py-2 justify-between">
        <View className="flex flex-col gap-2">
          <TextBebas className="text-white-main text-[20px]">
            {playlistTitle}
          </TextBebas>
          <TextFutura className="text-white-main text-[16px]">
            {playlistDescription}
          </TextFutura>
        </View>

        <TextFutura className="text-white-main text-[14px] mt-auto">
          {trackCount || 0} tracks
        </TextFutura>
      </View>

      {!isProtected ? (
        <PlaylistItemActions
          onDelete={onDelete}
          onEdit={onEdit}
          playlistTitle={playlistTitle}
        />
      ) : null}
    </Pressable>
  );
}
