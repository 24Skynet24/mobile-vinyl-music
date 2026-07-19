import { GradientBg } from '@/shared/ui/gradient-bg';
import { BurgerMenu } from '@/shared/ui/burger-menu';
import { Overlay } from '@/shared/ui/overlay';
import { BottomMenu } from '@/widgets/bottom-menu';
import { Player } from '@/widgets/player';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GradientBg>
      <View className="relative flex-1">
        <SafeAreaView className="flex-1">
          <View className="relative flex-1">
            <View className="absolute right-2 top-2 z-10">
              <BurgerMenu onPress={() => setIsMenuOpen(true)} />
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
    </GradientBg>
  );
}
