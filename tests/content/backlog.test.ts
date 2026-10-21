import assert from "node:assert/strict";
import test from "node:test";
import { calculateBacklog } from "../../src/modules/content/backlog";

const example = {
  arrivalPerSecond: 10000,
  perWorkerPerSecond: 2000,
  workers: 1,
  partitions: 4,
  durationSeconds: 10,
};

test("an empty queue accumulates the excess of arrivals over processing capacity", () => {
  assert.deepEqual(calculateBacklog(example), {
    activeConsumers: 1,
    capacityPerSecond: 2000,
    backlog: 80000,
  });
});

test("adding consumers cannot exceed the partition count in one ordinary group", () => {
  const atLimit = calculateBacklog({ ...example, workers: 4 });
  const aboveLimit = calculateBacklog({ ...example, workers: 8 });

  assert.deepEqual(aboveLimit, atLimit);
  assert.equal(aboveLimit.capacityPerSecond, 8000);
  assert.equal(aboveLimit.backlog, 20000);
});

test("sufficient capacity does not create negative backlog", () => {
  assert.equal(calculateBacklog({ ...example, arrivalPerSecond: 2000 }).backlog, 0);
  assert.equal(calculateBacklog({ ...example, arrivalPerSecond: 1000 }).backlog, 0);
});

test("zero workers queues every arrival and zero elapsed time queues nothing", () => {
  assert.equal(calculateBacklog({ ...example, workers: 0 }).backlog, 100000);
  assert.equal(calculateBacklog({ ...example, durationSeconds: 0 }).backlog, 0);
  assert.equal(calculateBacklog({ ...example, arrivalPerSecond: 0 }).backlog, 0);
});
