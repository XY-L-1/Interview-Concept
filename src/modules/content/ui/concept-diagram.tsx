"use client";

import { Fragment, useId, useState } from "react";
import type { ConceptPrimer } from "../concept-primers";
import styles from "./concept-diagram.module.css";

export function ConceptDiagram({ primer }: { primer: ConceptPrimer }) {
  const id = useId();
  const [selected, setSelected] = useState(primer.columns[0].nodes[0].title);
  const active = primer.columns.flatMap((column) => column.nodes).find((node) => node.title === selected)!;
  return <section className="rounded-2xl border border-line bg-white p-5 sm:p-7" aria-labelledby={`${id}-heading`}>
    <p className="text-xs font-semibold tracking-wider text-brand">START SIMPLE · 先说人话</p>
    <h2 id={`${id}-heading`} className="mt-3 text-xl font-semibold leading-9 text-ink">{primer.zh}</h2>
    <p lang="en" className="mt-2 text-base leading-7 text-brand">{primer.en}</p>
    <figure className={`${styles.diagram} mt-6 border-t border-line pt-5`}>
      <figcaption className="text-sm leading-7 text-body">{primer.caption}</figcaption>
      <p className="mt-1 text-xs leading-6 text-muted">点一个框，查看它的中文解释与英文说法。箭头表示图中标注的关系。</p>
      <div className={`${styles.flow} mt-4`}>
        {primer.columns.map((column, columnIndex) => <Fragment key={column.label}>
          {columnIndex > 0 ? <div className={styles.connection}><span aria-hidden="true" className={styles.arrow}>→</span><span>{primer.connections[columnIndex - 1]}</span></div> : null}
          <div className={styles.column}>
            <p className="mb-2 text-xs font-semibold text-muted">{column.label}</p>
            <div className="space-y-2">{column.nodes.map((node) => <div key={node.title}><button type="button" aria-pressed={selected === node.title} onClick={() => setSelected(node.title)} className={`${styles.node} ${selected === node.title ? styles.selected : ""}`}>
              <strong className="block text-sm leading-6">{node.title}</strong><span lang="en" className="mt-1 block text-xs leading-5 text-muted">{node.en}</span>
              {node.chips?.length ? <span className="mt-3 flex flex-wrap gap-1">{node.chips.map((chip) => <span key={chip} className={styles.chip}>{chip}</span>)}</span> : null}
            </button>{selected === node.title ? <div className={styles.inlineDetail} role="status"><p className="text-sm leading-7 text-body">{node.detail}</p><p lang="en" className="mt-2 text-sm leading-7 text-brand">{node.explanationEn}</p></div> : null}</div>)}</div>
          </div>
        </Fragment>)}
      </div>
      <div id={`${id}-detail`} className={`${styles.desktopDetail} mt-5 rounded-xl bg-brand/5 p-4 sm:p-5`} role="status" aria-live="polite" aria-atomic="true">
        <h3 className="font-semibold text-ink">{active.title} · {active.en}</h3><p className="mt-2 text-sm leading-7 text-body">{active.detail}</p><p lang="en" className="mt-2 text-sm leading-7 text-brand">{active.explanationEn}</p>
      </div>
      <p className="mt-4 border-l-2 border-teaching pl-3 text-sm leading-7 text-muted"><strong className="text-teaching">再记住一个边界：</strong>{primer.boundary}</p>
    </figure>
  </section>;
}
