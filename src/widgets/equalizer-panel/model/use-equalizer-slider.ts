import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';

import {
  clampGain,
  gainFromOffset,
  gainToProgressWidth,
} from '../lib/gain';

type PointerCoordinates = {
  locationX?: number;
  offsetX?: number;
  pageX?: number;
};

type UseEqualizerSliderOptions = {
  gain: number;
  onGainChange: (gain: number) => void;
};

export function useEqualizerSlider({
  gain,
  onGainChange,
}: UseEqualizerSliderOptions) {
  const trackRef = useRef<View>(null);
  const trackPageX = useRef(0);
  const frameRequestRef = useRef<number | null>(null);
  const pendingGainRef = useRef<number | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const progressWidth = gainToProgressWidth(gain);

  useEffect(() => {
    return () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, []);

  const scheduleGainChange = (nextGain: number) => {
    pendingGainRef.current = nextGain;
    if (frameRequestRef.current !== null) {
      return;
    }

    frameRequestRef.current = requestAnimationFrame(() => {
      frameRequestRef.current = null;
      const pendingGain = pendingGainRef.current;
      pendingGainRef.current = null;

      if (pendingGain !== null) {
        onGainChange(pendingGain);
      }
    });
  };

  const getPointerOffset = ({
    locationX,
    offsetX,
    pageX,
  }: PointerCoordinates) => {
    if (typeof pageX === 'number' && Number.isFinite(pageX)) {
      return pageX - trackPageX.current;
    }

    return locationX ?? offsetX ?? Number.NaN;
  };

  const updateGainFromPointer = (coordinates: PointerCoordinates) => {
    const nextGain = gainFromOffset(
      getPointerOffset(coordinates),
      trackWidth,
    );

    if (nextGain !== null) {
      scheduleGainChange(nextGain);
    }
  };

  const changeGainBy = (delta: number) => {
    onGainChange(clampGain(Math.round(gain) + delta));
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    trackRef.current?.measureInWindow((x) => {
      trackPageX.current = x;
    });
  };

  return {
    changeGainBy,
    handleTrackLayout,
    progressWidth,
    trackRef,
    updateGainFromPointer,
  };
}
