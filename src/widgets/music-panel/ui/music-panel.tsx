import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';

import { useLibrary } from '@/entities/library';
import { usePlayback } from '@/entities/playback';
import { getAudioDuration, type Track } from '@/entities/track';
import { SearchToolbar, type SortType } from '@/shared/ui/search-toolbar';
import { SlidingPanel } from '@/shared/ui/sliding-panel';
import { TextBebas, TextFutura } from '@/shared/ui/text';
import { TrackListItem } from '@/shared/ui/track-list-item';

import type { MusicPanelProps } from '../types';

const MUSIC_PANEL_HEIGHT_RATIO = 0.72;

function sortTracks(tracks: Track[], sort: SortType) {
  return [...tracks].sort((left, right) => {
    if (sort === 'alphabet') {
      return left.title.localeCompare(right.title);
    }
    if (sort === 'duration') {
      return right.duration - left.duration;
    }
    return right.addedAt - left.addedAt;
  });
}

export function MusicPanel({
  onClose,
  onSortChange,
  playlistId,
  sort,
}: MusicPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const {
    addTrackToPlaylist,
    playlists,
    removeTrack,
    removeTrackFromPlaylist,
    tracks,
    updateTrackDuration,
  } = useLibrary();
  const { currentTrack, playTrack } = usePlayback();
  const [query, setQuery] = useState('');
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const playlist = playlists.find((item) => item.id === playlistId);
  const contentHeight = windowHeight * MUSIC_PANEL_HEIGHT_RATIO;

  useEffect(() => {
    let isCancelled = false;
    const tracksWithoutDuration = tracks.filter((track) => track.duration <= 0);

    void (async () => {
      for (const track of tracksWithoutDuration) {
        const trackDuration = await getAudioDuration(track.uri);
        if (isCancelled) {
          return;
        }
        if (trackDuration > 0) {
          updateTrackDuration(track.id, trackDuration);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [tracks, updateTrackDuration]);

  const visibleTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const sourceTracks = playlist
      ? tracks.filter((track) => playlist.trackIds.includes(track.id))
      : tracks;
    const filteredTracks = normalizedQuery
      ? sourceTracks.filter((track) =>
          [track.title, track.album, track.artist].some((value) =>
            value.toLocaleLowerCase().includes(normalizedQuery),
          ),
        )
      : sourceTracks;

    return sortTracks(filteredTracks, sort);
  }, [playlist, query, sort, tracks]);

  const queueIds = visibleTracks.map((track) => track.id);

  const handleRemove = (track: Track) => {
    if (playlist) {
      removeTrackFromPlaylist(playlist.id, track.id);
      return;
    }

    Alert.alert(
      'Remove track?',
      `${track.title} will be deleted from the app and every playlist.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeTrack(track.id),
        },
      ],
    );
  };

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        <View className="flex-1 px-4 pt-4">
          <TextBebas className="pb-3 text-[28px] text-orange-main">
            {playlist?.title ?? 'All music'}
          </TextBebas>
          <SearchToolbar
            onQueryChange={setQuery}
            onSortChange={onSortChange}
            placeholder="Search title, album or artist"
            query={query}
            selectedSort={sort}
          />

          <FlatList
            contentContainerStyle={{ gap: 8, paddingBottom: 24, paddingTop: 16 }}
            contentInsetAdjustmentBehavior="automatic"
            data={visibleTracks}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(track) => track.id}
            ListEmptyComponent={
              <View className="items-center px-6 py-12">
                <TextBebas className="text-center text-[24px] text-white-main">
                  {query ? 'Nothing found' : 'No music here yet'}
                </TextBebas>
                <TextFutura className="pt-2 text-center text-[15px] text-gray-main">
                  {query
                    ? 'Try another title, album or artist.'
                    : playlist
                      ? 'Add tracks from the all music panel.'
                      : 'Use add music to import audio files.'}
                </TextFutura>
              </View>
            }
            renderItem={({ item }) => (
              <TrackListItem
                coverUri={item.coverUri}
                duration={item.duration}
                isActive={currentTrack?.id === item.id}
                isAdd={!playlist}
                isRemove
                onAdd={() => setTrackToAdd(item)}
                onPress={() => playTrack(item.id, queueIds)}
                onRemove={() => handleRemove(item)}
                subtitle={[item.artist, item.album].filter(Boolean).join(' · ')}
                title={item.title}
              />
            )}
          />
        </View>
      </SlidingPanel>

      <Modal
        animationType="fade"
        onRequestClose={() => setTrackToAdd(null)}
        transparent
        visible={Boolean(trackToAdd)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/70 px-6"
          onPress={() => setTrackToAdd(null)}
        >
          <Pressable
            className="w-full max-w-[420px] gap-3 border-2 border-orange-main bg-black-main p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <TextBebas className="text-[28px] text-orange-main">
              Add to playlist
            </TextBebas>
            <TextFutura className="text-[15px] text-white-main">
              {trackToAdd?.title}
            </TextFutura>

            {playlists.map((item) => {
              const alreadyAdded = trackToAdd
                ? item.trackIds.includes(trackToAdd.id)
                : false;
              return (
                <Pressable
                  accessibilityState={{ disabled: alreadyAdded }}
                  className={`border border-white-main px-4 py-3 ${
                    alreadyAdded ? 'opacity-40' : 'active:bg-orange-main'
                  }`}
                  disabled={alreadyAdded}
                  key={item.id}
                  onPress={() => {
                    if (trackToAdd) {
                      addTrackToPlaylist(item.id, trackToAdd.id);
                    }
                    setTrackToAdd(null);
                  }}
                >
                  <TextBebas className="text-[18px] text-white-main">
                    {item.title} {alreadyAdded ? '· Added' : ''}
                  </TextBebas>
                </Pressable>
              );
            })}

            <Pressable
              className="mt-2 self-end px-3 py-2"
              onPress={() => setTrackToAdd(null)}
            >
              <TextBebas className="text-[18px] text-gray-main">Cancel</TextBebas>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
