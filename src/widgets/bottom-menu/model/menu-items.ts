export const bottomMenuItems = [
  {
    accessibilityLabel: 'Open equalizer',
    iconName: 'equalizer',
    id: 'equalizer',
  },
  {
    accessibilityLabel: 'Add music',
    iconName: 'add-music',
    id: 'add-music',
  },
  {
    accessibilityLabel: 'Open all music',
    iconName: 'all-music',
    id: 'all-music',
  },
  {
    accessibilityLabel: 'Open playlist',
    iconName: 'playlist',
    id: 'playlist',
  },
] as const;

export type BottomMenuAction = (typeof bottomMenuItems)[number]['id'];
export type BottomMenuIconName = (typeof bottomMenuItems)[number]['iconName'];
