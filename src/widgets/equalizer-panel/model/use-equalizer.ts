import { useState } from 'react';

import { equalizerBands } from './equalizer-bands';

export function useEqualizer() {
  const [bands, setBands] = useState(equalizerBands);

  const updateBandGain = (frequency: string, gain: number) => {
    setBands((currentBands) =>
      currentBands.map((band) =>
        band.frequency === frequency ? { ...band, gain } : band,
      ),
    );
  };

  return {
    bands,
    updateBandGain,
  };
}
