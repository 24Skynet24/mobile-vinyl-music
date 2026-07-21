import { View, Image, Pressable } from "react-native";
import { TextBebas } from "../text";
import { Svg, Path } from "react-native-svg";
import { TrackListItemProps } from "./types";

export function TrackListItem({onPress, onRemove, isRemove}: TrackListItemProps) {
  return (
    <Pressable className="bg-black-main flex flex-row items-center w-full" onPress={onPress}>
      <View className="w-16 h-16">
        <Image
          className="w-full h-full"
          source={require('@/shared/assets/img/cover.jpg')}
        />
      </View>

      <View className="flex flex-col gap-[4px] ml-2 py-2">
        <TextBebas className="text-orange-main text-[20px]">
          Music name
        </TextBebas>
        <TextBebas className="text-white-main text-[14px]">
          Artist or album
        </TextBebas>
      </View>

      <View className="flex flex-row items-center gap-[6px] ml-auto mr-2">
        <TextBebas className="text-white-main text-[16px]">
          00:00
        </TextBebas>

        {isRemove && 
          <Pressable className="w-5 h-5" onPress={onRemove}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path d="M10.0002 16.7992C6.2402 16.7992 3.2002 13.7592 3.2002 9.99922C3.2002 6.23922 6.2402 3.19922 10.0002 3.19922C13.7602 3.19922 16.8002 6.23922 16.8002 9.99922C16.8002 13.7592 13.7602 16.7992 10.0002 16.7992ZM10.0002 3.99922C6.6802 3.99922 4.0002 6.67922 4.0002 9.99922C4.0002 13.3192 6.6802 15.9992 10.0002 15.9992C13.3202 15.9992 16.0002 13.3192 16.0002 9.99922C16.0002 6.67922 13.3202 3.99922 10.0002 3.99922Z" fill="#FFFEE9"/>
              <Path d="M6.40039 9.59961H13.6004V10.3996H6.40039V9.59961Z" fill="#FFFEE9"/>
            </Svg>
          </Pressable>
        }

      </View>
    </Pressable>
  );
}
