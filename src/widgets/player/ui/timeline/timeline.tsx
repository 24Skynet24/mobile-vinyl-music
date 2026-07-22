import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { TextBebas } from '@/shared/ui/text';

type TimelineProps = {
  currentTime: number;
  duration: number;
  disabled?: boolean;
  onSeek: (seconds: number) => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00';
  }

  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainder = roundedSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder
    .toString()
    .padStart(2, '0')}`;
}

export function Timeline({
  currentTime,
  duration,
  disabled = false,
  onSeek,
}: TimelineProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const displayedTime = dragValue ?? currentTime;
  const progress = duration > 0 ? Math.min(displayedTime / duration, 1) : 0;

  const timeFromOffset = (offset: number) => {
    if (disabled || duration <= 0 || trackWidth <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(offset / trackWidth, 1)) * duration;
  };

  return (
    <View className="w-full flex flex-col gap-2">
      <Pressable
        accessibilityLabel="Track timeline"
        className="w-full h-1 bg-black-main relative"
        disabled={disabled || duration <= 0}
        hitSlop={12}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onPress={(event) => onSeek(timeFromOffset(event.nativeEvent.locationX))}
        onTouchMove={(event) =>
          setDragValue(timeFromOffset(event.nativeEvent.locationX))
        }
        onTouchEnd={(event) => {
          onSeek(timeFromOffset(event.nativeEvent.locationX));
          setDragValue(null);
        }}
      >
        <View
          className="absolute left-0 top-0 h-1 bg-orange-main"
          style={{
            boxShadow: '0 0 10px #d7452c',
            width: `${progress * 100}%`,
          }}
        />
      </Pressable>

      <View className="flex flex-row items-center justify-between">
        <TextBebas className="text-orange-main">
          {formatTime(displayedTime)}
        </TextBebas>
        <TextBebas className="text-white-main">{formatTime(duration)}</TextBebas>
      </View>
    </View>
  );
}
