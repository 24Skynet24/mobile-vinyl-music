import { StyleSheet } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export function LibraryPage() {
  return (
    <Screen style={styles.screen}>
      <Text variant="title">Library</Text>
      <Text variant="muted">Saved albums, playlists, and tracks will live here.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
  },
});
