import { Platform } from 'react-native';

const tintColorLight = '#6f5a3d';
const tintColorDark = '#f3d7a2';

export const Colors = {
  light: {
    text: '#171412',
    mutedText: '#76695f',
    background: '#fbfaf8',
    surface: '#f0ebe4',
    tint: tintColorLight,
    icon: '#7d7167',
    tabIconDefault: '#7d7167',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f5f0ea',
    mutedText: '#c8bbae',
    background: '#141210',
    surface: '#24201c',
    tint: tintColorDark,
    icon: '#b9aa9a',
    tabIconDefault: '#b9aa9a',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
