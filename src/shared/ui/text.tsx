import { StyleSheet, Text as NativeText, type TextProps } from 'react-native';

import { useThemeColor } from '@/shared/lib/use-theme-color';

type TextVariant = 'body' | 'title' | 'subtitle' | 'muted' | 'link';

type AppTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
};

export function Text({
  style,
  lightColor,
  darkColor,
  variant = 'body',
  ...props
}: AppTextProps) {
  const colorName = variant === 'muted' ? 'mutedText' : 'text';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return <NativeText style={[styles[variant], { color }, style]} {...props} />;
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  muted: {
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
});
