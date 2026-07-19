export interface MenuButtonIconType {
    iconName: 'playlists' | 'add-music' | 'equalizer' | 'all-music'
}

export interface MenuButtonProps extends MenuButtonIconType {
    onPress: () => void
}