import { SlidingPanel } from '@/shared/ui/sliding-panel';
import { useWindowDimensions, View } from 'react-native';
import { SearchToolbar } from '@/shared/ui/search-toolbar';
import { PlaylistPanelProps } from '../types';
import { PlaylistItem } from './playlist-item';

const MUSIC_PANEL_HEIGHT_RATIO = 0.6;

export function PlaylistPanel({onClose}: PlaylistPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const contentHeight = windowHeight * MUSIC_PANEL_HEIGHT_RATIO;

  return (
    <SlidingPanel
      contentHeight={contentHeight}
      onClose={onClose}
    >
      <View className='w-full mt-4 mb-6 px-4'>
        <SearchToolbar placeholder='Search playlist'/>
      </View>
      <View className='w-full px-4 flex flex-col gap-4 overflow-auto'>
        <PlaylistItem
            playlistTitle={'Test playlist'}
            playlistDescription={'Test description'}
            trackCount={10}
        />
      </View>
    </SlidingPanel>
  );
}
