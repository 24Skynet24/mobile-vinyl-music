import { Tonearm } from "@/shared/ui/tonearm";
import { Disk } from "@/shared/ui/disk";
import { View, Text } from "react-native";
import { Controls } from "./controls";
import { Timeline } from "./timeline";

export function Player() {
    return (
        <View className="flex-1 flex items-center justify-between px-[16px] pt-[32px]">
            <View className="relative flex items-center justify-center w-[300px] h-[300px] mb-8 mt-[5vh]">
                <Disk className=""/>
                <Tonearm className="absolute -top-4 -right-4"/>
            </View>

            <View className="flex flex-col gap-2 w-full">
                <Text className="w-full text-orange-main text-[42px]">
                    Music name
                </Text>
                <View className="flex flex-row items-center gap-2 max-w-full">
                    <Text className="text-gray-main text-xl">Album</Text>
                    <View className="w-2 h-2 bg-gray-main rounded-full"/>
                    <Text className="text-gray-main text-xl">2024</Text>
                </View>
            </View>

            <View className="w-full">
                <Timeline/>
            </View>
            
            <Controls className="mb-8"
                isPlaying={false}
                randomEnabled={false}
                repeatMode={'none'}
                onNextPress={() => {}}
                onPlayPausePress={() => {}}
                onPreviousPress={() => {}}
                onRandomPress={() => {}}
                onRepeatPress={() => {}}
            />
        </View>
    );
}