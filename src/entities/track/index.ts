export type Track = {
  id: string;
  title: string;
  artistId: string;
  albumId?: string;
  durationSeconds?: number;
  audioUrl?: string;
};
