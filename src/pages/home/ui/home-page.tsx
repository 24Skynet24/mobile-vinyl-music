import { GradientBackground } from '@/shared/ui/gradient-background';
import { MenuTrigger } from '@/shared/ui/menu-trigger';
import { Overlay } from '@/shared/ui/overlay';
import { BottomMenu } from '@/widgets/bottom-menu';
import { Player } from '@/widgets/player';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GradientBackground>
      <View className="relative flex-1">
        <SafeAreaView className="flex-1">
          <View className="relative flex-1">
            <View className="absolute right-2 top-2 z-10">
              <MenuTrigger onPress={() => setIsMenuOpen(true)} />
            </View>

            <Player />
          </View>
        </SafeAreaView>

        {isMenuOpen && (
          <>
            <Overlay onPress={() => setIsMenuOpen(false)} />
            <BottomMenu onActionPress={() => setIsMenuOpen(false)} />
          </>
        )}
      </View>
    </GradientBackground>
  );
}
