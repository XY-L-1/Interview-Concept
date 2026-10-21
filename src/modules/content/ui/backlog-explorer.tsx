"use client";

import { useId, useState } from "react";
import { calculateBacklog, type BacklogInputs } from "../backlog";

const fields = [
  { key: "arrivalPerSecond", label: "每秒进入（条）", min: 0, initial: "10000" },
  {
    key: "perWorkerPerSecond",
    label: "每 worker 每秒处理（条）",
    min: 0,
    initial: "2000",
  },
  { key: "workers", label: "Consumer / worker 数", min: 0, initial: "1" },
  { key: "partitions", label: "Partition 数", min: 1, initial: "4" },
  { key: "durationSeconds", label: "持续时间（秒）", min: 0, initial: "10" },
] as const;

const numberFormat = new Intl.NumberFormat("en-US");

function isValidInput(value: string, minimum: number) {
  return (
    value.trim() !== "" &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) >= minimum
  );
}

export function BacklogExplorer() {
  const id = useId();
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.initial])) as Record<
      keyof BacklogInputs,
      string
    >,
  );
  const valid = fields.every((field) => isValidInput(values[field.key], field.min));
  const result = valid
    ? calculateBacklog({
        arrivalPerSecond: Number(values.arrivalPerSecond),
        perWorkerPerSecond: Number(values.perWorkerPerSecond),
        workers: Number(values.workers),
        partitions: Number(values.partitions),
        durationSeconds: Number(values.durationSeconds),
      })
    : null;

  return (
    <section
      lang="zh-Hans"
      aria-labelledby={`${id}-heading`}
      aria-describedby={`${id}-assumptions`}
      className="mt-9 max-w-5xl border border-line bg-surface p-5 sm:p-6"
    >
      <p className="font-mono text-xs tracking-wider text-teaching">
        TRY IT · 教学模型
      </p>
      <h2 id={`${id}-heading`} className="mt-2 text-xl font-semibold text-ink">
        多加 Consumer，积压就会减少吗？
      </h2>
      <p id={`${id}-assumptions`} className="mt-3 text-sm leading-6 text-body">
        假设队列初始为空、速率恒定、分区负载均匀，只有一个普通 consumer group，
        每个 consumer 对应一个 worker。以下是假设数据，不是真实平台性能。
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`${id}-${field.key}`}
              className="block text-sm font-medium text-ink"
            >
              {field.label}
            </label>
            <input
              id={`${id}-${field.key}`}
              type="number"
              min={field.min}
              step={1}
              value={values[field.key]}
              aria-invalid={!isValidInput(values[field.key], field.min)}
              aria-describedby={!valid ? `${id}-error` : undefined}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setValues((current) => ({ ...current, [field.key]: value }));
              }}
              className="mt-2 w-full border border-line bg-background px-3 py-2 font-mono text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
          </div>
        ))}
      </div>

      <div aria-live="polite" aria-atomic="true" className="mt-5">
        {result ? (
          <>
            <dl className="grid gap-4 border-y border-line py-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted">活跃 Consumer</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                  {numberFormat.format(result.activeConsumers)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">总处理容量（条/秒）</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                  {numberFormat.format(result.capacityPerSecond)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">结束时积压（条）</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-brand">
                  {numberFormat.format(result.backlog)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-body">
              活跃 Consumer = min({values.workers}, {values.partitions}) = {result.activeConsumers}；
              容量 = {result.activeConsumers} × {values.perWorkerPerSecond} = {numberFormat.format(result.capacityPerSecond)} 条/秒。
              积压 = max(0, ({values.arrivalPerSecond} − {result.capacityPerSecond}) × {values.durationSeconds})
              = {numberFormat.format(result.backlog)} 条。
            </p>
            <p className="mt-2 text-sm leading-6 text-body">
              {Number(values.perWorkerPerSecond) === 0
                ? "单个 worker 的处理能力为 0；增加 Consumer 也不会提高容量。"
                : Number(values.workers) >= Number(values.partitions)
                  ? "Consumer 数已达到分区数；继续增加 Consumer 不会提高这个模型中的容量。"
                  : "此时增加 Consumer 可以提高模型中的容量，直到 Consumer 数达到分区数。"}
              {result.backlog > 0
                ? "进入速率高于处理容量，队列会持续增长。"
                : "在所选时间内，这个模型没有新增积压；这不代表请求没有延迟。"}
            </p>
          </>
        ) : (
          <p id={`${id}-error`} className="text-sm leading-6 text-body">
            请为每项填写有效整数：Partition 数至少为 1，其他值至少为 0。
          </p>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        这个模型未包含数据库、ML 服务、网络、重试或分区热点等瓶颈。
        实际系统中，增加 Consumer 是否有效，需要测量和排查下游容量。
      </p>
    </section>
  );
}
