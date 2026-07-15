import { StyleSheet } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export function HomePage() {
  return (
    <Screen style={styles.screen}>
      <Text variant="title">Vinyl Music</Text>
      <Text variant="muted">Home page shell for the mobile listening experience.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
  },
});
