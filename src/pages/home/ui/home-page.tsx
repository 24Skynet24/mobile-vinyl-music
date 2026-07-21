import { usePanelNavigation } from '@/features/panel-navigation';
import { GradientBackground } from '@/shared/ui/gradient-background';
import { MenuTrigger } from '@/shared/ui/menu-trigger';
import { BottomMenu } from '@/widgets/bottom-menu';
import { MusicPanel } from '@/widgets/music-panel';
import { Player } from '@/widgets/player';
import { PlaylistPanel } from '@/widgets/playlist-panel';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomePage() {
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
                openPanel('music');
                return;
              }
              else if (action === 'playlist') {
                openPanel("playlist")
                return;
              }

              closeAllPanels();
            }}
            onClose={closeCurrentPanel}
          />
        )}

        {activePanel === 'music' && (
          <MusicPanel onClose={closeCurrentPanel} />
        )}
        {activePanel === 'playlist' && (
          <PlaylistPanel onClose={closeCurrentPanel} />
        )}
      </View>
    </GradientBackground>
  );
}
