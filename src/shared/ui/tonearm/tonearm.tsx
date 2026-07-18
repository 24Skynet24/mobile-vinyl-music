import { View } from "react-native";
import {Svg, Rect} from "react-native-svg"

export function Tonearm() {
    return (
        <View className="w-[130px] h-[151px]">
            <Svg width="130" height="151" viewBox="0 0 130 151" fill="none">
                <Rect width="14.133" height="32.5514" rx="2" transform="matrix(0.778687 0.627412 -0.627417 0.778683 117.672 15.1011)" fill="#FFFEE9"/>
                <Rect width="14.1329" height="37.0092" rx="2" transform="matrix(0.561225 0.827663 -0.827667 0.561219 32.2231 102.406)" fill="#FFFEE9"/>
                <Rect width="15.3107" height="3.53323" transform="matrix(0.575584 0.817742 -0.817746 0.575578 32.2924 118.605)" fill="#FFFEE9"/>
                <Rect width="6.76558" height="51.9801" transform="matrix(0.778687 0.627412 -0.627417 0.778683 100.997 41.1089)" fill="#FFFEE9"/>
                <Rect width="6.76219" height="43.801" transform="matrix(0.575584 0.817742 -0.817747 0.575578 70.0088 80.0078)" fill="#FFFEE9"/>
            </Svg>
        </View>
    )
}