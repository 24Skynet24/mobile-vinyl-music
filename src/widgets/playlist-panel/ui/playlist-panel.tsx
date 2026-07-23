import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { persistCoverAsset, useLibrary } from '@/entities/library';
import type { Playlist } from '@/entities/playlist';
import { CoverImage } from '@/shared/ui/cover-image';
import { SearchToolbar } from '@/shared/ui/search-toolbar';
import { SlidingPanel } from '@/shared/ui/sliding-panel';
import { TextBebas, TextFutura } from '@/shared/ui/text';

import type { PlaylistPanelProps } from '../types';
import { PlaylistItem } from './playlist-item';

const PLAYLIST_PANEL_HEIGHT_RATIO = 0.72;
const defaultPlaylistCover = require('@/shared/assets/img/playlist-cover.jpg');

type EditorState = {
  playlistId?: string;
  title: string;
  description: string;
  coverUri?: string;
  coverAsset?: DocumentPicker.DocumentPickerAsset;
};

export function PlaylistPanel({
  onClose,
  onOpenPlaylist,
}: PlaylistPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const {
    createPlaylist,
    playlists,
    removePlaylist,
    updatePlaylist,
  } = useLibrary();
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const contentHeight = windowHeight * PLAYLIST_PANEL_HEIGHT_RATIO;

  const visiblePlaylists = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return [...playlists]
      .filter((playlist) =>
        normalizedQuery
          ? [playlist.title, playlist.description].some((value) =>
              value.toLocaleLowerCase().includes(normalizedQuery),
            )
          : true,
      )
      .sort((left, right) => {
        if (left.id === 'favorites') {
          return -1;
        }
        if (right.id === 'favorites') {
          return 1;
        }
        return left.title.localeCompare(right.title);
      });
  }, [playlists, query]);

  const openEditor = (playlist?: Playlist) => {
    setEditor({
      playlistId: playlist?.id,
      title: playlist?.title ?? '',
      description: playlist?.description ?? '',
      coverUri: playlist?.coverUri,
    });
  };

  const saveEditor = () => {
    if (!editor || !editor.title.trim()) {
      return;
    }

    let coverUri = editor.coverUri;
    if (editor.coverAsset) {
      try {
        coverUri = persistCoverAsset(editor.coverAsset);
      } catch {
        Alert.alert('Cover error', 'The selected image could not be saved.');
        return;
      }
    }

    const input = {
      title: editor.title.trim(),
      description: editor.description.trim(),
      coverUri,
    };

    if (editor.playlistId) {
      updatePlaylist(editor.playlistId, input);
    } else {
      createPlaylist(input);
    }
    setEditor(null);
  };

  const selectCover = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setEditor((current) =>
        current
          ? {
              ...current,
              coverAsset: result.assets[0],
              coverUri: result.assets[0].uri,
            }
          : current,
      );
    }
  };

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        <View className="flex-1 px-4 pt-4">
          <View className="flex-row items-center justify-between pb-3">
            <TextBebas className="text-[28px] text-orange-main">Playlists</TextBebas>
            <Pressable
              accessibilityLabel="Create playlist"
              className="border border-orange-main bg-black-main px-4 py-2 active:bg-orange-main"
              onPress={() => openEditor()}
            >
              <TextBebas className="text-[17px] text-white-main">+ New</TextBebas>
            </Pressable>
          </View>

          <SearchToolbar
            onQueryChange={setQuery}
            placeholder="Search title or description"
            query={query}
            showSort={false}
          />

          <FlatList
            contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: 16 }}
            contentInsetAdjustmentBehavior="automatic"
            data={visiblePlaylists}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(playlist) => playlist.id}
            ListEmptyComponent={
              <View className="items-center px-6 py-12">
                <TextBebas className="text-center text-[24px] text-white-main">
                  {query ? 'Nothing found' : 'No playlists yet'}
                </TextBebas>
              </View>
            }
            renderItem={({ item }) => (
              <PlaylistItem
                image={item.id === 'favorites' ? undefined : item.coverUri}
                isProtected={item.id === 'favorites'}
                onDelete={() =>
                  Alert.alert(
                    'Delete playlist?',
                    `Tracks in ${item.title} will remain in your library.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => removePlaylist(item.id),
                      },
                    ],
                  )
                }
                onEdit={() => openEditor(item)}
                onPress={() => onOpenPlaylist(item.id)}
                playlistDescription={item.description}
                playlistTitle={item.title}
                trackCount={item.trackIds.length}
              />
            )}
          />
        </View>
      </SlidingPanel>

      <Modal
        animationType="fade"
        onRequestClose={() => setEditor(null)}
        transparent
        visible={Boolean(editor)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/70 px-6"
          onPress={() => setEditor(null)}
        >
          <Pressable
            className="flex flex-col items-center w-full gap-4 border-2 border-orange-main bg-black-main p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <TextBebas className="text-[28px] text-orange-main">
              {editor?.playlistId ? 'Edit playlist' : 'New playlist'}
            </TextBebas>

            <TextInput
              className="border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main w-full"
              onChangeText={(title) =>
                setEditor((current) => (current ? { ...current, title } : current))
              }
              placeholder="Name"
              placeholderTextColor="#999999"
              value={editor?.title}
            />
            <TextInput
              className="min-h-24 border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main w-full"
              multiline
              onChangeText={(description) =>
                setEditor((current) =>
                  current ? { ...current, description } : current,
                )
              }
              placeholder="Description"
              placeholderTextColor="#999999"
              textAlignVertical="top"
              value={editor?.description}
            />

            <Pressable className='w-[120px] h-[120px]' onPress={() => selectCover()}>
              <CoverImage
                fallbackSource={defaultPlaylistCover}
                uri={editor?.coverUri}
              />
            </Pressable>


            <View className="flex-row justify-end gap-3 pt-2">
              <Pressable className="px-4 py-3" onPress={() => setEditor(null)}>
                <TextBebas className="text-[18px] text-gray-main">Cancel</TextBebas>
              </Pressable>
              <Pressable
                className={`bg-orange-main px-5 py-3 ${
                  editor?.title.trim() ? '' : 'opacity-40'
                }`}
                disabled={!editor?.title.trim()}
                onPress={saveEditor}
              >
                <TextBebas className="text-[18px] text-white-main">Save</TextBebas>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
