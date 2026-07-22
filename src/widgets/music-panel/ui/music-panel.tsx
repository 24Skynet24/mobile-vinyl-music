import { SlidingPanel } from '@/shared/ui/sliding-panel';
import { TrackListItem } from '@/shared/ui/track-list-item';
import { MusicPanelProps } from '../types';
import { useWindowDimensions, View } from 'react-native';
import { SearchToolbar } from '@/shared/ui/search-toolbar';

const MUSIC_PANEL_HEIGHT_RATIO = 0.6;

export function MusicPanel({onClose}: MusicPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const contentHeight = windowHeight * MUSIC_PANEL_HEIGHT_RATIO;

  return (
    <SlidingPanel
      contentHeight={contentHeight}
      onClose={onClose}
    >
      <View className='w-full mt-4 mb-6 px-4'>
        <SearchToolbar placeholder='Search (title or album)...'/>
      </View>
      <View className="w-full px-4">
        <TrackListItem isAdd={true} isRemove={true}/>
      </View>
    </SlidingPanel>
  );
}
