import { Pressable } from "react-native";
import { MenuButtonProps } from "./type";
import MenuButtonIcon from "./icon"

export function MenuButton({ iconName, onPress }: MenuButtonProps) {
  return (
    <Pressable
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={"Open " + iconName}
        onPress={onPress}
        className="w-20 h-20 bg-black-main rounded-[8px] flex items-center justify-center transition-transform duration-150 ease-out active:scale-95"
    >
      <MenuButtonIcon iconName={iconName} />
    </Pressable>
  );
}
