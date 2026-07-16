import { SafeAreaView, StyleSheet, Text } from 'react-native';

export function HomePage() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Vinyl Music</Text>
      <Text style={styles.description}>Home page shell for the mobile listening experience.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
  },
  description: {
    fontSize: 16,
    color: '#666666',
  },
});
