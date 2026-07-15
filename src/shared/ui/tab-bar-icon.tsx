import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { type OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type TabBarIconName = ComponentProps<typeof MaterialIcons>['name'];

type TabBarIconProps = {
  name: TabBarIconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
};

export function TabBarIcon({ name, size = 24, color, style }: TabBarIconProps) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
