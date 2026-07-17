import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';

export function GradientBg({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={['#251f1f', '#251f1f', '#44403d']}
      locations={[0, 0.3, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[{ flex: 1 }]}
    >
      {children}
    </LinearGradient>
  );
}