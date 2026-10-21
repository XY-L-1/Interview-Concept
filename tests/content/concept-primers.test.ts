import assert from "node:assert/strict";
import test from "node:test";
import { conceptPrimers } from "../../src/modules/content/concept-primers";
import { jdRoadmap } from "../../src/modules/content/jd-roadmap";

test("every JD lesson has a short bilingual opening and a complete, connected diagram", () => {
  const slugs = jdRoadmap.flatMap((area) => area.lessons.map((lesson) => lesson.slug));
  assert.deepEqual(Object.keys(conceptPrimers).sort(), [...slugs].sort());
  for (const slug of slugs) {
    const primer = conceptPrimers[slug];
    assert.ok(primer.zh && primer.en && primer.caption && primer.boundary, slug);
    assert.ok(primer.en.split(/\s+/).length <= 25, `${slug}: keep the opening speakable`);
    assert.equal(primer.connections.length, primer.columns.length - 1, slug);
    const nodes = primer.columns.flatMap((column) => column.nodes);
    assert.equal(new Set(nodes.map((node) => node.title)).size, nodes.length, `${slug}: selection needs unique node titles`);
    assert.ok(primer.columns.every((column) => column.label && column.nodes.length));
    assert.ok(nodes.every((node) => node.title && node.en && node.detail && node.explanationEn));
    assert.ok(primer.connections.every(Boolean), `${slug}: arrows must explain their relationship`);
  }
});

test("Kafka diagram keeps local offsets, pull consumption and ordinary group assignments explicit", () => {
  const primer = conceptPrimers["kafka-topics-partitions-groups-offsets"];
  assert.equal(primer.en, "Producers send messages to a topic, and consumers read messages from that topic.");
  const nodes = primer.columns.flatMap((column) => column.nodes);
  for (const name of ["Producer", "Topic", "Partition 0", "Partition 1", "Broker", "Consumer group", "Consumer C1", "Consumer C2"]) assert.ok(nodes.some((node) => node.title === name));
  const p0 = nodes.find((node) => node.title === "Partition 0")!;
  const p1 = nodes.find((node) => node.title === "Partition 1")!;
  assert.ok(p0.chips?.includes("offset 0") && p1.chips?.includes("offset 0"));
  assert.match(primer.boundary, /不表示 Kafka 主动推送/);
  assert.match(primer.boundary, /没有整体顺序保证/);
});
