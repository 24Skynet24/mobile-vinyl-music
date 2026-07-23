import type { PropsWithChildren } from 'react';

import { LibraryProvider } from '@/entities/library';
import { PlaybackProvider } from '@/entities/playback';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <LibraryProvider>
      <PlaybackProvider>{children}</PlaybackProvider>
    </LibraryProvider>
  );
}
