import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

import {
  persistAudioAsset,
  type ImportedTrackMetadata,
  useLibrary,
} from '@/entities/library';
import { getAudioDuration } from '@/entities/track';
import { SlidingPanel } from '@/shared/ui/sliding-panel';
import { TextBebas, TextFutura } from '@/shared/ui/text';
import { TrackListItem } from '@/shared/ui/track-list-item';

import type { AddMusicPanelProps } from '../types';

const ADD_MUSIC_PANEL_HEIGHT_RATIO = 0.72;

type PendingTrack = {
  asset: DocumentPicker.DocumentPickerAsset;
  duration: number;
  metadata: ImportedTrackMetadata;
};

type MetadataEditor = ImportedTrackMetadata & {
  index: number;
  yearText: string;
};

function metadataFromAsset(
  asset: DocumentPicker.DocumentPickerAsset,
): ImportedTrackMetadata {
  const rawTitle = asset.name.replace(/\.[^/.]+$/, '') || 'Untitled';
  const [title, ...artistParts] = rawTitle.split(' - ');
  return {
    artist: artistParts.join(' - ').trim(),
    title: title.trim() || rawTitle,
    album: '',
    year: null,
  };
}

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return 'Audio file';
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AddMusicPanel({
  onClose,
  onImportComplete,
}: AddMusicPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const { addTracks } = useLibrary();
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [metadataEditor, setMetadataEditor] = useState<MetadataEditor | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingDurations, setIsReadingDurations] = useState(false);
  const contentHeight = windowHeight * ADD_MUSIC_PANEL_HEIGHT_RATIO;

  const selectMusic = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: 'audio/*',
    });

    if (!result.canceled) {
      const selectedTracks = result.assets.map((asset) => ({
        asset,
        duration: 0,
        metadata: metadataFromAsset(asset),
      }));

      setPendingTracks((current) => {
        const existing = new Set(
          current.map(({ asset }) => `${asset.name}:${asset.size}`),
        );
        return [
          ...current,
          ...selectedTracks.filter(
            ({ asset }) => !existing.has(`${asset.name}:${asset.size}`),
          ),
        ];
      });

      setIsReadingDurations(true);
      try {
        for (const selectedTrack of selectedTracks) {
          const duration = await getAudioDuration(selectedTrack.asset.uri);
          if (duration > 0) {
            setPendingTracks((current) =>
              current.map((track) =>
                track.asset.uri === selectedTrack.asset.uri
                  ? { ...track, duration }
                  : track,
              ),
            );
          }
        }
      } finally {
        setIsReadingDurations(false);
      }
    }
  };

  const confirmImport = () => {
    if (pendingTracks.length === 0 || isSaving || isReadingDurations) {
      return;
    }

    setIsSaving(true);
    const importedTracks = [];
    const failedTracks: PendingTrack[] = [];

    for (const pendingTrack of pendingTracks) {
      try {
        importedTracks.push(
          persistAudioAsset(
            pendingTrack.asset,
            pendingTrack.metadata,
            pendingTrack.duration,
          ),
        );
      } catch {
        failedTracks.push(pendingTrack);
      }
    }

    if (importedTracks.length > 0) {
      addTracks(importedTracks);
    }
    setPendingTracks(failedTracks);
    setIsSaving(false);

    if (failedTracks.length > 0) {
      Alert.alert(
        'Some files were not added',
        `${importedTracks.length} imported, ${failedTracks.length} failed.`,
      );
    } else {
      Alert.alert(
        'Music added',
        `${importedTracks.length} track(s) are now in your library.`,
      );
    }

    if (importedTracks.length > 0) {
      onImportComplete();
    }
  };

  const saveMetadata = () => {
    if (!metadataEditor || !metadataEditor.title.trim()) {
      return;
    }

    const { index, yearText, ...metadata } = metadataEditor;
    setPendingTracks((current) =>
      current.map((track, trackIndex) =>
        trackIndex === index
          ? {
              ...track,
              metadata: {
                ...metadata,
                title: metadata.title.trim(),
                artist: metadata.artist.trim(),
                album: metadata.album.trim(),
                year: yearText.trim() ? Number(yearText) : null,
              },
            }
          : track,
      ),
    );
    setMetadataEditor(null);
  };

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        <View className="flex-1 px-4 pt-4">
          <View className="flex-row items-center justify-between pb-3">
            <TextBebas className="text-[28px] text-orange-main">Add music</TextBebas>
            {pendingTracks.length > 0 ? (
              <Pressable
                className={`bg-orange-main px-4 py-2 active:opacity-70 ${
                  isSaving || isReadingDurations ? 'opacity-40' : ''
                }`}
                disabled={isSaving || isReadingDurations}
                onPress={confirmImport}
              >
                <TextBebas className="text-[17px] text-white-main">
                  {isReadingDurations
                    ? 'Reading duration…'
                    : `Confirm ${pendingTracks.length}`}
                </TextBebas>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel="Select one or more audio files"
            className="mb-4 flex-row items-center justify-center gap-4 border-2 border-dashed border-orange-main bg-black-main/50 px-5 py-5 active:opacity-70"
            onPress={() => void selectMusic()}
          >
            <Svg height="52" viewBox="0 0 64 64" width="52">
              <Circle cx="32" cy="32" fill="#181818" r="29" stroke="#D7452C" strokeWidth="3" />
              <Circle cx="32" cy="32" fill="#D7452C" r="9" />
              <Path d="M32 23v18M23 32h18" stroke="#FFFEE9" strokeWidth="2.5" />
            </Svg>
            <View className="flex-1">
              <TextBebas className="text-[24px] text-orange-main">
                Select your music
              </TextBebas>
              <TextFutura className="text-[14px] text-gray-main">
                Choose one or several audio files
              </TextFutura>
            </View>
          </Pressable>

          <FlatList
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            contentInsetAdjustmentBehavior="automatic"
            data={pendingTracks}
            keyExtractor={({ asset }, index) => `${asset.uri}:${index}`}
            ListEmptyComponent={
              <View className="items-center px-6 py-10">
                <TextBebas className="text-center text-[22px] text-white-main">
                  Selected files will appear here
                </TextBebas>
              </View>
            }
            renderItem={({ item, index }) => (
              <TrackListItem
                duration={item.duration}
                isRemove
                onPress={() =>
                  setMetadataEditor({
                    ...item.metadata,
                    index,
                    yearText: item.metadata.year?.toString() ?? '',
                  })
                }
                onRemove={() =>
                  setPendingTracks((current) =>
                    current.filter((_, trackIndex) => trackIndex !== index),
                  )
                }
                subtitle={[item.metadata.artist, formatFileSize(item.asset.size)]
                  .filter(Boolean)
                  .join(' · ')}
                title={item.metadata.title}
              />
            )}
          />
        </View>
      </SlidingPanel>

      <Modal
        animationType="fade"
        onRequestClose={() => setMetadataEditor(null)}
        transparent
        visible={Boolean(metadataEditor)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/70 px-6"
          onPress={() => setMetadataEditor(null)}
        >
          <Pressable
            className="w-full max-w-[420px] gap-3 border-2 border-orange-main bg-black-main p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <TextBebas className="text-[28px] text-orange-main">
              Track details
            </TextBebas>
            {(['title', 'artist', 'album'] as const).map((field) => (
              <TextInput
                className="border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
                key={field}
                onChangeText={(value) =>
                  setMetadataEditor((current) =>
                    current ? { ...current, [field]: value } : current,
                  )
                }
                placeholder={field[0].toUpperCase() + field.slice(1)}
                placeholderTextColor="#999999"
                value={metadataEditor?.[field]}
              />
            ))}
            <TextInput
              className="border border-gray-main px-3 py-3 font-futura text-[16px] text-white-main"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(yearText) =>
                setMetadataEditor((current) =>
                  current
                    ? { ...current, yearText: yearText.replace(/\D/g, '') }
                    : current,
                )
              }
              placeholder="Year"
              placeholderTextColor="#999999"
              value={metadataEditor?.yearText}
            />
            <View className="flex-row justify-end gap-3 pt-2">
              <Pressable
                className="px-4 py-3"
                onPress={() => setMetadataEditor(null)}
              >
                <TextBebas className="text-[18px] text-gray-main">Cancel</TextBebas>
              </Pressable>
              <Pressable
                className={`bg-orange-main px-5 py-3 ${
                  metadataEditor?.title.trim() ? '' : 'opacity-40'
                }`}
                disabled={!metadataEditor?.title.trim()}
                onPress={saveMetadata}
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
