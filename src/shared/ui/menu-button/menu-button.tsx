import { Pressable, View } from "react-native";

export function MenuButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            className="absolute top-4 right-4 w-[36px] h-[36px] bg-black-main/30 rounded-[4px] flex flex-col items-center justify-center gap-1"
            disabled={false}
            hitSlop={8}
            onPress={onPress}
            >
                {Array.from({ length: 3 }).map((_, index) => (
                    <View key={index} className="flex-row items-center gap-1">
                        <View className="h-1 w-1 rounded-full bg-orange-main" />
                        <View className="h-1 w-6 rounded-full bg-orange-main" />
                    </View>
                ))}
        </Pressable>
    )
}