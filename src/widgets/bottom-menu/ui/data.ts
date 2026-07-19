export const bottomMenuItems = [
  { id: 'queue', label: 'QUEUE' },
  { id: 'favorites', label: 'FAVORITES' },
  { id: 'settings', label: 'SETTINGS' },
] as const;

export type BottomMenuAction = (typeof bottomMenuItems)[number]['id'];
