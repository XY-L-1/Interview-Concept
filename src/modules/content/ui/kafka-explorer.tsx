"use client";

import { useId, useState } from "react";
import { Icon } from "@/shared/ui/icons";
import {
  consumeKafkaRecord,
  initialKafkaExample,
  publishKafkaRecord,
  replayKafkaGroup,
  type KafkaGroupId,
} from "./kafka-explorer-model";

export function KafkaExplorer() {
  const id = useId();
  const [example, setExample] = useState(initialKafkaExample);
  const [selectedGroup, setSelectedGroup] = useState<KafkaGroupId>("notifications");
  const [notice, setNotice] = useState("选择一组，再读取消息，观察各分区的下一位置。");
  const group = example.groups.find((candidate) => candidate.id === selectedGroup)!;
  const unread = example.partitions.some((records, index) => group.nextOffsets[index] < records.length);

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_10px_#17223b03] sm:p-6">
      <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-ink">One event. Independent consumers.</h2>
      <p className="mt-1 text-sm leading-6 text-muted">假设的翻译示例 · 点击操作，观察保留日志与独立消费进度。</p>

      <div role="region" aria-label="Interactive Kafka event flow" tabIndex={0} className="mt-6 overflow-x-auto rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand">
        <div className="grid grid-cols-1 items-center gap-3 py-2 sm:min-w-[660px] sm:grid-cols-[140px_28px_minmax(210px,1fr)_28px_210px] sm:gap-2">
          <div className="rounded-xl border border-line bg-white p-4">
            <Icon name="file" size={28} className="text-brand" />
            <h3 className="mt-3 text-sm font-semibold text-ink">Translation service</h3>
            <p className="mt-2 text-xs leading-5 text-muted">Publishes a completion event.</p>
          </div>
          <Icon name="arrow-right" size={25} className="mx-auto rotate-90 text-muted sm:rotate-0" />
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center gap-2"><Icon name="branch" size={26} className="text-ink" /><div><h3 className="text-sm font-semibold text-ink">Kafka topic</h3><p className="text-xs text-body">translation.completed</p></div></div>
            <div className="mt-4 space-y-2">
              {example.partitions.map((records, partition) => (
                <div key={partition} className="rounded-lg border border-line bg-white p-2">
                  <p className="mb-2 text-xs font-medium text-muted">Partition {partition}</p>
                  <div className="flex max-w-[260px] gap-1.5 overflow-x-auto pb-1">
                    {records.map((record) => <span key={record.offset} className="shrink-0 rounded-md bg-teaching-soft px-2 py-1 font-mono text-xs text-teaching">{record.offset}: {record.taskId}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Icon name="arrow-right" size={25} className="mx-auto rotate-90 text-muted sm:hidden" />
          <svg aria-hidden="true" viewBox="0 0 28 270" className="hidden h-[270px] w-7 sm:block" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M0 135H8V40H25M0 135H25M8 135V230H25" /><path d="m20 35 5 5-5 5m0 85 5 5-5 5m0 85 5 5-5 5" /></svg>
          <div className="grid gap-3 sm:block sm:space-y-3">
            {example.groups.map((candidate) => (
              <div key={candidate.id} className={`rounded-xl border bg-white p-3 ${candidate.id === selectedGroup ? "border-brand ring-1 ring-brand/10" : "border-line"}`}>
                <div className="flex items-center gap-2"><Icon name={candidate.id === "index" ? "file" : candidate.id === "analytics" ? "layers" : "message"} size={22} className="text-ink" /><h3 className="text-sm font-semibold text-ink">{candidate.name}</h3></div>
                <p className="mt-3 border-t border-line pt-2 font-mono text-[11px] leading-5 text-body">Next: {candidate.nextOffsets.map((offset, index) => `P${index}=${offset}`).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs leading-5 text-muted">Each group reads independently. Offsets are next positions per partition.</p>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={() => { setExample(publishKafkaRecord); setNotice("一条新事件追加到一个分区；消费组的进度尚未改变。"); }}><Icon name="plus" size={16} />Publish event</button>
        <div><label htmlFor={`${id}-group`} className="mb-1 block text-xs font-medium text-muted">Consumer group</label><select id={`${id}-group`} value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value as KafkaGroupId)} className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand">{example.groups.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></div>
        <button type="button" disabled={!unread} onClick={() => { setExample((current) => consumeKafkaRecord(current, selectedGroup)); setNotice("仅选中组的一个分区位置前进。日志和其他组的位置均保留。"); }} className="min-h-11 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-brand hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand">Consume next</button>
        <button type="button" onClick={() => { setExample((current) => replayKafkaGroup(current, selectedGroup)); setNotice("选中组从各分区位置 0 重读。其他组不变；记录仍在日志中。"); }} className="min-h-11 rounded-lg border border-line px-4 py-2 text-sm font-medium text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand">Replay group</button>
        <button type="button" onClick={() => { setExample(initialKafkaExample()); setNotice("教学示例已重置。"); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"><Icon name="refresh" size={15} />Reset</button>
      </div>
      <p role="status" className="mt-4 rounded-lg bg-teaching-soft px-3 py-2 text-sm leading-6 text-teaching">{notice}</p>
      <p className="mt-3 text-xs leading-6 text-muted">数字为教学状态；此处依次读取选中组尚未完成的分区，不提供跨分区顺序保证。点击消费仅推进演示位置，不模拟真实事务、故障或外部业务成功。重放真实系统前还需要评估重复副作用。</p>
    </section>
  );
}
