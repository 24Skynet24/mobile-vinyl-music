import { createAudioPlayer } from 'expo-audio';

const DURATION_TIMEOUT_MS = 12_000;

export function getAudioDuration(uri: string) {
  return new Promise<number>((resolve) => {
    const player = createAudioPlayer(
      { uri },
      {
        keepAudioSessionActive: false,
        updateInterval: 100,
      },
    );
    let isSettled = false;
    let subscription:
      | ReturnType<typeof player.addListener>
      | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const finish = (duration: number) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.remove();
      player.remove();
      resolve(Number.isFinite(duration) && duration > 0 ? duration : 0);
    };

    subscription = player.addListener(
      'playbackStatusUpdate',
      (status) => {
        if (status.isLoaded && status.duration > 0) {
          finish(status.duration);
        }
      },
    );
    timeoutId = setTimeout(
      () => finish(player.duration),
      DURATION_TIMEOUT_MS,
    );

    if (player.isLoaded && player.duration > 0) {
      finish(player.duration);
    }
  });
}
