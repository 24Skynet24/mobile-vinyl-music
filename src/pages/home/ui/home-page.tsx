import { GradientBg } from '@/shared/ui/gradient-bg';
import { MenuButton } from '@/shared/ui/menu-button/menu-button';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Player } from '@/widgets/player';

export function HomePage() {
  return (
    <GradientBg>
      <SafeAreaView className="flex-1">
        <View className="flex-1 relative">
          <View className="absolute right-2 top-2 z-10">
            <MenuButton onPress={() => {}} />
          </View>

          <Player/>
        </View> 
      </SafeAreaView>
    </GradientBg>
  );
}
