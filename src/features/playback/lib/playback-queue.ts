import type { Track } from "@/entities/track";

export type ShuffleHistory = {
  ids: string[];
  index: number;
};

type QueueAfterRemoval = {
  nextQueueIds: string[];
  nextTrackId: string | null;
};

type ShuffleCandidatesParams = {
  currentTrackId: string;
  cyclePlayedIds: string[];
  queueIds: string[];
  restartCycle: boolean;
  tracks: Track[];
};

export function getDefaultQueueIds(tracks: Track[]) {
  return [...tracks]
    .sort((left, right) => right.addedAt - left.addedAt)
    .map((track) => track.id);
}

function getNextId(queueIds: string[], removedTrackId: string) {
  if (queueIds.length === 0) {
    return null;
  }

  const removedIndex = queueIds.indexOf(removedTrackId);
  if (removedIndex < 0) {
    return queueIds[0];
  }

  return queueIds[(removedIndex + 1) % queueIds.length];
}

export function getQueueAfterRemoval(
  removedTrackId: string,
  sourceQueueIds: string[],
  defaultQueueIds: string[],
): QueueAfterRemoval {
  const sourceNextTrackId = getNextId(sourceQueueIds, removedTrackId);
  const sourceQueueWithoutRemoved = sourceQueueIds.filter(
    (id) => id !== removedTrackId,
  );

  if (sourceNextTrackId && sourceNextTrackId !== removedTrackId) {
    return {
      nextQueueIds: sourceQueueWithoutRemoved,
      nextTrackId: sourceNextTrackId,
    };
  }

  const defaultNextTrackId = getNextId(defaultQueueIds, removedTrackId);
  const defaultQueueWithoutRemoved = defaultQueueIds.filter(
    (id) => id !== removedTrackId,
  );

  return {
    nextQueueIds: defaultQueueWithoutRemoved,
    nextTrackId:
      defaultNextTrackId === removedTrackId ? null : defaultNextTrackId,
  };
}

export function reconcileQueueIds(
  currentQueue: string[],
  previousLibraryIds: string[],
  tracks: Track[],
) {
  const nextLibraryIds = tracks.map((track) => track.id);
  const nextLibraryIdSet = new Set(nextLibraryIds);
  const validQueue = currentQueue.filter((id) => nextLibraryIdSet.has(id));
  const previousLibraryIdSet = new Set(previousLibraryIds);
  const wasFullLibraryQueue =
    previousLibraryIds.length > 0 &&
    currentQueue.length === previousLibraryIds.length &&
    currentQueue.every((id) => previousLibraryIdSet.has(id));

  if (!wasFullLibraryQueue) {
    return validQueue.length === currentQueue.length
      ? currentQueue
      : validQueue;
  }

  const previousDefaultQueue = getDefaultQueueIds(
    tracks.filter((track) => previousLibraryIdSet.has(track.id)),
  );
  const wasDefaultQueueOrder = currentQueue.every(
    (id, index) => id === previousDefaultQueue[index],
  );

  if (wasDefaultQueueOrder) {
    const nextDefaultQueue = getDefaultQueueIds(tracks);
    const queueDidNotChange =
      nextDefaultQueue.length === currentQueue.length &&
      nextDefaultQueue.every((id, index) => id === currentQueue[index]);

    return queueDidNotChange ? currentQueue : nextDefaultQueue;
  }

  const queuedIds = new Set(validQueue);
  const nextQueue = [
    ...validQueue,
    ...nextLibraryIds.filter((id) => !queuedIds.has(id)),
  ];
  const queueDidNotChange =
    nextQueue.length === currentQueue.length &&
    nextQueue.every((id, index) => id === currentQueue[index]);

  return queueDidNotChange ? currentQueue : nextQueue;
}

export function reconcileShuffleHistory(
  history: ShuffleHistory,
  validTrackIds: Set<string>,
) {
  const selectedId = history.ids[history.index];
  const ids = history.ids.filter((id) => validTrackIds.has(id));

  if (ids.length === history.ids.length) {
    return history;
  }
  if (ids.length === 0) {
    return { ids: [], index: -1 };
  }

  const selectedIndex = selectedId ? ids.indexOf(selectedId) : -1;
  return {
    ids,
    index:
      selectedIndex >= 0
        ? selectedIndex
        : Math.max(0, Math.min(history.index, ids.length - 1)),
  };
}

export function getShuffleKey(track?: Track) {
  return track?.fileName.trim().toLocaleLowerCase() ?? "";
}

export function getShuffleCandidates({
  currentTrackId,
  cyclePlayedIds,
  queueIds,
  restartCycle,
  tracks,
}: ShuffleCandidatesParams) {
  const tracksById = new Map(tracks.map((track) => [track.id, track]));
  const currentShuffleKey = getShuffleKey(tracksById.get(currentTrackId));
  const playedShuffleKeys = new Set(
    cyclePlayedIds.map((id) => getShuffleKey(tracksById.get(id))),
  );
  let candidates = queueIds.filter(
    (id) =>
      id !== currentTrackId &&
      !playedShuffleKeys.has(getShuffleKey(tracksById.get(id))),
  );
  let nextCyclePlayedIds = cyclePlayedIds;

  if (candidates.length === 0 && restartCycle) {
    candidates = queueIds.filter(
      (id) =>
        id !== currentTrackId &&
        getShuffleKey(tracksById.get(id)) !== currentShuffleKey,
    );
    nextCyclePlayedIds = [currentTrackId];
  }

  return { candidates, nextCyclePlayedIds };
}

export function hasSingleUniqueTrack(queueIds: string[], tracks: Track[]) {
  const tracksById = new Map(tracks.map((track) => [track.id, track]));
  return (
    new Set(queueIds.map((id) => getShuffleKey(tracksById.get(id)))).size === 1
  );
}
