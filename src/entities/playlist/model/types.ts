export type Playlist = {
  id: string;
  title: string;
  description: string;
  coverUri?: string;
  trackIds: string[];
  createdAt: number;
};

export type PlaylistInput = Pick<Playlist, 'description' | 'title'> & {
  coverUri?: string;
};
