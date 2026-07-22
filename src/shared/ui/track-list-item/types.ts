export interface TrackListItemProps {
  title: string;
  subtitle: string;
  duration: number;
  coverUri?: string;
  isActive?: boolean;
  isRemove?: boolean;
  isAdd?: boolean;
  onPress: () => void;
  onRemove?: () => void;
  onAdd?: () => void;
}
