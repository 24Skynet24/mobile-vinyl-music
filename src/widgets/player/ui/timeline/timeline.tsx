import { View, Text } from "react-native"

export function Timeline() {
    return (
        <View className="w-full flex flex-col gap-2">
            <View className="w-full h-1 bg-black-main relative">
                <View className="absolute left-0 top-0 w-[40%] h-1 bg-orange-main"/>
            </View>

            <View className="flex flex-row items-center justify-between">
                <Text className="text-orange-main">00:00</Text>
                <Text className="text-white-main">00:00</Text>
            </View>
        </View>
    )
}