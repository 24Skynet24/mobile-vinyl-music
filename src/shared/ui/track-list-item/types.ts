export interface TrackListItemProps {
    isRemove: boolean
    isAdd: boolean
    onPress: () => void
    onRemove?: () => void
    onAdd?: () => void
}