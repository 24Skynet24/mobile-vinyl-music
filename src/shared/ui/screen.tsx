import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { useThemeColor } from '@/shared/lib/use-theme-color';

type ScreenProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function Screen({ style, lightColor, darkColor, ...props }: ScreenProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <SafeAreaView style={[styles.screen, { backgroundColor }, style]} {...props} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
