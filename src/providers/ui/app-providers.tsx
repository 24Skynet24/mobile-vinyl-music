import type { PropsWithChildren } from "react";

import { EqualizerProvider } from "@/entities/equalizer";
import { LibraryProvider } from "@/entities/library";
import { PlaybackProvider } from "@/features/playback";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <LibraryProvider>
      <EqualizerProvider>
        <PlaybackProvider>{children}</PlaybackProvider>
      </EqualizerProvider>
    </LibraryProvider>
  );
}
