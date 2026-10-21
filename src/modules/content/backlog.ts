export type BacklogInputs = Readonly<{
  arrivalPerSecond: number;
  perWorkerPerSecond: number;
  workers: number;
  partitions: number;
  durationSeconds: number;
}>;

export function calculateBacklog(input: BacklogInputs) {
  const activeConsumers = Math.min(input.workers, input.partitions);
  const capacityPerSecond = activeConsumers * input.perWorkerPerSecond;
  const backlog = Math.max(
    0,
    (input.arrivalPerSecond - capacityPerSecond) * input.durationSeconds,
  );

  return { activeConsumers, capacityPerSecond, backlog };
}
