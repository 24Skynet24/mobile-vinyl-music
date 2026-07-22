import { Image } from 'expo-image';
import { useEffect, useState } from 'react';

type CoverImageProps = {
  fallbackSource: number;
  uri?: string;
};

export function CoverImage({ fallbackSource, uri }: CoverImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    setHasLoadError(false);
  }, [uri]);

  const resolvedUri = uri && !hasLoadError ? uri : undefined;

  return (
    <Image
      cachePolicy={resolvedUri ? 'none' : 'memory-disk'}
      contentFit="cover"
      onError={() => setHasLoadError(true)}
      recyclingKey={resolvedUri ?? 'fallback-cover'}
      source={resolvedUri ? { uri: resolvedUri } : fallbackSource}
      style={{ height: '100%', width: '100%' }}
      transition={0}
    />
  );
}
