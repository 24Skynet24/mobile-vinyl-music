import { View } from "react-native"

import { TextBebas } from '@/shared/ui/text';

export function Timeline() {
    return (
        <View className="w-full flex flex-col gap-2">
            <View className="w-full h-1 bg-black-main relative">
                <View className="absolute left-0 top-0 w-[40%] h-1 bg-orange-main" style={{ boxShadow: "0 0 10px #d7452c" }}/>
            </View>

            <View className="flex flex-row items-center justify-between">
                <TextBebas className="text-orange-main">00:00</TextBebas>
                <TextBebas className="text-white-main">00:00</TextBebas>
            </View>
        </View>
    )
}
