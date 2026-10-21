export type KafkaGroupId = "index" | "notifications" | "analytics";
export type KafkaRecord = Readonly<{ offset: number; taskId: string }>;
export type KafkaGroup = Readonly<{
  id: KafkaGroupId;
  name: string;
  nextOffsets: readonly number[];
}>;
export type KafkaExample = Readonly<{
  partitions: readonly (readonly KafkaRecord[])[];
  groups: readonly KafkaGroup[];
  nextTask: number;
  nextPartition: number;
}>;

export function initialKafkaExample(): KafkaExample {
  return {
    partitions: [
      [{ offset: 0, taskId: "T42" }, { offset: 1, taskId: "T43" }],
      [{ offset: 0, taskId: "T44" }],
      [{ offset: 0, taskId: "T45" }],
    ],
    groups: [
      { id: "index", name: "Index group", nextOffsets: [2, 1, 1] },
      { id: "notifications", name: "Notification group", nextOffsets: [1, 0, 0] },
      { id: "analytics", name: "Analytics group", nextOffsets: [2, 1, 1] },
    ],
    nextTask: 46,
    nextPartition: 0,
  };
}

export function publishKafkaRecord(state: KafkaExample): KafkaExample {
  return {
    ...state,
    partitions: state.partitions.map((records, index) =>
      index === state.nextPartition
        ? [...records, { offset: records.length, taskId: `T${state.nextTask}` }]
        : records,
    ),
    nextTask: state.nextTask + 1,
    nextPartition: (state.nextPartition + 1) % state.partitions.length,
  };
}

export function consumeKafkaRecord(state: KafkaExample, groupId: KafkaGroupId): KafkaExample {
  const group = state.groups.find((candidate) => candidate.id === groupId)!;
  const partition = state.partitions.findIndex(
    (records, index) => group.nextOffsets[index] < records.length,
  );
  if (partition === -1) return state;
  return {
    ...state,
    groups: state.groups.map((candidate) => candidate.id === groupId
      ? { ...candidate, nextOffsets: candidate.nextOffsets.map((offset, index) => index === partition ? offset + 1 : offset) }
      : candidate),
  };
}

export function replayKafkaGroup(state: KafkaExample, groupId: KafkaGroupId): KafkaExample {
  return {
    ...state,
    groups: state.groups.map((group) => group.id === groupId
      ? { ...group, nextOffsets: state.partitions.map(() => 0) }
      : group),
  };
}
