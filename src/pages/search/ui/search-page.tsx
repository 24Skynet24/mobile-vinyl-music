import { StyleSheet } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export function SearchPage() {
  return (
    <Screen style={styles.screen}>
      <Text variant="title">Search</Text>
      <Text variant="muted">Music discovery and catalog search will start here.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
  },
});
