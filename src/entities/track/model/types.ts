export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number | null;
  duration: number;
  uri: string;
  fileName: string;
  coverUri?: string;
  addedAt: number;
};

export type TrackDraft = Omit<Track, 'addedAt' | 'duration' | 'id'> & {
  id: string;
  duration?: number;
};
