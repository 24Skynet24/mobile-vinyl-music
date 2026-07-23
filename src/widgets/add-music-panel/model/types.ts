import type * as DocumentPicker from "expo-document-picker";

import type { ImportedTrackMetadata } from "@/entities/library";

export interface AddMusicPanelProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export type PendingTrack = {
  asset: DocumentPicker.DocumentPickerAsset;
  duration: number;
  metadata: ImportedTrackMetadata;
};

export type MetadataEditor = ImportedTrackMetadata & {
  index: number;
  yearText: string;
};
