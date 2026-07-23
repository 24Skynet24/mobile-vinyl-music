import { usePanelNavigation } from '@/features/panel-navigation';
import type { SortType } from '@/shared/ui/search-toolbar';
import { GradientBackground } from '@/shared/ui/gradient-background';
import { MenuTrigger } from '@/shared/ui/menu-trigger';
import { AddMusicPanel } from '@/widgets/add-music-panel';
import { BottomMenu } from '@/widgets/bottom-menu';
import { MusicPanel } from '@/widgets/music-panel';
import { Player } from '@/widgets/player';
import { PlaylistPanel } from '@/widgets/playlist-panel';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomePage() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );
  const [musicSort, setMusicSort] = useState<SortType>('date-added');
  const {
    activePanel,
    closeAllPanels,
    closeCurrentPanel,
    openPanel,
  } = usePanelNavigation();

  return (
    <GradientBackground>
      <View className="relative flex-1">
        <SafeAreaView className="flex-1">
          <View className="relative flex-1">
            <View className="absolute right-2 top-2 z-10">
              <MenuTrigger onPress={() => openPanel('menu')} />
            </View>

            <Player />
          </View>
        </SafeAreaView>

        {activePanel === 'menu' && (
          <BottomMenu
            onActionPress={(action) => {
              if (action === 'all-music') {
                setSelectedPlaylistId(null);
                openPanel('music');
                return;
              }
              if (action === 'playlist') {
                openPanel('playlist');
                return;
              }
              if (action === 'add-music') {
                openPanel('add-music');
                return;
              }

              closeAllPanels();
            }}
            onClose={closeCurrentPanel}
          />
        )}

        {activePanel === 'music' && (
          <MusicPanel
            onClose={closeCurrentPanel}
            onSortChange={setMusicSort}
            playlistId={selectedPlaylistId}
            sort={musicSort}
          />
        )}
        {activePanel === 'playlist' && (
          <PlaylistPanel
            onClose={closeCurrentPanel}
            onOpenPlaylist={(playlistId) => {
              setSelectedPlaylistId(playlistId);
              openPanel('music');
            }}
          />
        )}
        {activePanel === 'add-music' && (
          <AddMusicPanel
            onClose={closeCurrentPanel}
            onImportComplete={closeAllPanels}
          />
        )}
      </View>
    </GradientBackground>
  );
}
