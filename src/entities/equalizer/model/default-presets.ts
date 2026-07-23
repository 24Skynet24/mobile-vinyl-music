import { createBands } from '../lib/bands';
import type { EqualizerPreset } from './types';

export const defaultPresets: EqualizerPreset[] = [
  {
    id: 'default-flat',
    name: 'Flat',
    kind: 'default',
    bands: createBands([0, 0, 0, 0, 0, 0, 0, 0]),
  },
  {
    id: 'default-bass-boost',
    name: 'Bass Boost',
    kind: 'default',
    bands: createBands([8, 6, 3, 0, -1, -2, 0, 2]),
  },
  {
    id: 'default-rock',
    name: 'Rock',
    kind: 'default',
    bands: createBands([5, 4, -2, -3, 1, 4, 5, 3]),
  },
  {
    id: 'default-pop',
    name: 'Pop',
    kind: 'default',
    bands: createBands([3, 2, 0, 1, 3, 4, 3, 2]),
  },
  {
    id: 'default-vocal',
    name: 'Vocal',
    kind: 'default',
    bands: createBands([-3, -2, 0, 3, 5, 4, 2, 0]),
  },
  {
    id: 'default-electronic',
    name: 'Electronic',
    kind: 'default',
    bands: createBands([6, 4, 0, -2, 1, 3, 5, 6]),
  },
];
