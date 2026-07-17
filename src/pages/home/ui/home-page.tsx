import { GradientBg } from '@/shared/ui/gradient-bg';
import { Controls, type RepeatMode } from '@/widgets/player';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomEnabled, setRandomEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');

  function cycleRepeatMode() {
    setRepeatMode((currentMode) => {
      if (currentMode === 'none') return 'all';
      if (currentMode === 'all') return 'one';
      return 'none';
    });
  }

  return (
    <GradientBg>
      <SafeAreaView className="flex-1">
        <Controls
          className="mt-auto"
          isPlaying={isPlaying}
          randomEnabled={randomEnabled}
          repeatMode={repeatMode}
          onNextPress={() => {}}
          onPlayPausePress={() => setIsPlaying((playing) => !playing)}
          onPreviousPress={() => {}}
          onRandomPress={() => setRandomEnabled((enabled) => !enabled)}
          onRepeatPress={cycleRepeatMode}
        />
      </SafeAreaView>
    </GradientBg>
  );
}
