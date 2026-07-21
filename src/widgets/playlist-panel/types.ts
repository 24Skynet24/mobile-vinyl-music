export interface PlaylistPanelProps {
    onClose: () => void
}

export interface PlayListItemProps {
    image?: string
    trackCount: number
    playlistTitle: string
    playlistDescription: string
    
    onEdit: () => void
    onDelete: () => void
}