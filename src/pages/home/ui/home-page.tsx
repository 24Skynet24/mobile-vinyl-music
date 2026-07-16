import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export function HomePage() {
  return (
    <SafeAreaView className="flex-1 gap-3 bg-white p-6">
      <Text className="text-3xl font-bold text-neutral-900">Vinyl Music</Text>
      <Text className="text-base text-neutral-500">
        Home page shell for the mobile listening experience.
      </Text>
    </SafeAreaView>
  );
}
