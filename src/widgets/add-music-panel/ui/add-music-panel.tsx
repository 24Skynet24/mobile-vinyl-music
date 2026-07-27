import { useWindowDimensions, View } from "react-native";

import { useImportMusic } from "@/features/import-music";
import { SlidingPanel } from "@/shared/ui/sliding-panel";

import type { AddMusicPanelProps } from "../model/types";
import { AddMusicHeader } from "./add-music-header";
import { MetadataEditorModal } from "./metadata-editor-modal";
import { PendingTrackList } from "./pending-track-list";
import { SelectMusicButton } from "./select-music-button";

const ADD_MUSIC_PANEL_HEIGHT_RATIO = 0.72;

export function AddMusicPanel({
  onClose,
  onImportComplete,
}: AddMusicPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const {
    closeMetadataEditor,
    confirmImport,
    isReadingDurations,
    isSaving,
    metadataEditor,
    openMetadataEditor,
    pendingTracks,
    removePendingTrack,
    saveMetadata,
    selectMusic,
    updateMetadataEditor,
  } = useImportMusic(onImportComplete);
  const contentHeight = windowHeight * ADD_MUSIC_PANEL_HEIGHT_RATIO;

  return (
    <>
      <SlidingPanel contentHeight={contentHeight} onClose={onClose}>
        <View className="flex-1 px-4 pt-4">
          <AddMusicHeader
            isReadingDurations={isReadingDurations}
            isSaving={isSaving}
            onConfirm={confirmImport}
            pendingTrackCount={pendingTracks.length}
          />
          <SelectMusicButton
            disabled={isReadingDurations || isSaving}
            onPress={() => void selectMusic()}
          />
          <PendingTrackList
            onEdit={openMetadataEditor}
            onRemove={removePendingTrack}
            tracks={pendingTracks}
          />
        </View>
      </SlidingPanel>

      <MetadataEditorModal
        editor={metadataEditor}
        onChange={updateMetadataEditor}
        onClose={closeMetadataEditor}
        onSave={saveMetadata}
      />
    </>
  );
}
