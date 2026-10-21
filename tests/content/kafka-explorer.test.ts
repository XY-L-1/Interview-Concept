import assert from "node:assert/strict";
import test from "node:test";
import { consumeKafkaRecord, initialKafkaExample, publishKafkaRecord, replayKafkaGroup } from "../../src/modules/content/ui/kafka-explorer-model";

test("publishing appends one unique task to one partition without moving group offsets", () => {
  const before = initialKafkaExample();
  let after = before;
  for (let index = 0; index < 7; index++) after = publishKafkaRecord(after);
  const records = after.partitions.flat();
  assert.equal(records.length, before.partitions.flat().length + 7);
  assert.equal(new Set(records.map((record) => record.taskId)).size, records.length);
  after.partitions.forEach((partition) => assert.deepEqual(partition.map((record) => record.offset), partition.map((_, index) => index)));
  assert.deepEqual(after.groups, before.groups);
  assert.equal(before.partitions.flat().length, 4);
});

test("consuming advances only the selected group's position and retains the log", () => {
  const before = initialKafkaExample();
  const after = consumeKafkaRecord(before, "notifications");
  assert.deepEqual(after.groups[1].nextOffsets, [2, 0, 0]);
  assert.deepEqual(after.groups[0], before.groups[0]);
  assert.deepEqual(after.groups[2], before.groups[2]);
  assert.deepEqual(after.partitions, before.partitions);
  assert.deepEqual(before.groups[1].nextOffsets, [1, 0, 0]);
});

test("replay changes one group and permits rereading retained records", () => {
  const before = initialKafkaExample();
  const replayed = replayKafkaGroup(before, "analytics");
  assert.deepEqual(replayed.groups[2].nextOffsets, [0, 0, 0]);
  assert.deepEqual(replayed.groups[0], before.groups[0]);
  assert.deepEqual(replayed.groups[1], before.groups[1]);
  assert.deepEqual(replayed.partitions, before.partitions);
  assert.deepEqual(consumeKafkaRecord(replayed, "analytics").groups[2].nextOffsets, [1, 0, 0]);
});

test("a caught-up group cannot consume beyond any partition's end", () => {
  let example = initialKafkaExample();
  for (let index = 0; index < 10; index++) example = consumeKafkaRecord(example, "notifications");
  assert.deepEqual(example.groups[1].nextOffsets, [2, 1, 1]);
  assert.equal(consumeKafkaRecord(example, "notifications"), example);
  assert.equal(example.partitions.flat().length, 4);
});
