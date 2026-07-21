import { GradientBackground } from '@/shared/ui/gradient-background';
import { MenuTrigger } from '@/shared/ui/menu-trigger';
import { BottomMenu } from '@/widgets/bottom-menu';
import { MusicPanel } from '@/widgets/music-panel';
import { Player } from '@/widgets/player';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomePage() {
  const [activePanel, setActivePanel] = useState<'menu' | 'music' | null>(null);

  return (
    <GradientBackground>
      <View className="relative flex-1">
        <SafeAreaView className="flex-1">
          <View className="relative flex-1">
            <View className="absolute right-2 top-2 z-10">
              <MenuTrigger onPress={() => setActivePanel('menu')} />
            </View>

            <Player />
          </View>
        </SafeAreaView>

        {activePanel === 'menu' && (
          <BottomMenu
            onActionPress={(action) =>
              setActivePanel(action === 'all-music' ? 'music' : null)
            }
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'music' && (
          <MusicPanel onClose={() => setActivePanel(null)} />
        )}
      </View>
    </GradientBackground>
  );
}
