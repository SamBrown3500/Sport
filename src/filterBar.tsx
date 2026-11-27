import type { Story } from './data/types';
import { NOTION_VERDICTS, type NotionVerdict } from './data/notions';
import { outletsIn, verdictOf, type SourceFilter, type VerdictFilter } from './lib/filters';
import { getSource } from './lib/db';

const VERDICTS: NotionVerdict[] = ['busted', 'held', 'mixed', 'open'];

/** Short labels for the toggle: "Busted (40)". */
const SHORT: Record<NotionVerdict, string> = { busted: 'Busted', held: 'Held', mixed: 'Partly right', open: 'Still open' };

/** Busted / held / partly right / open buttons, with counts from the list they filter. */
export function VerdictToggle({ list, value, onChange, withNone = false }: {
  list: Story[]; value: VerdictFilter; onChange: (v: VerdictFilter) => void; withNone?: boolean;
}) {
  const counts: Record<string, number> = { busted: 0, held: 0, mixed: 0, open: 0, none: 0 };
  for (const s of list) counts[verdictOf(s) ?? 'none']++;
  return (
    <div className="toggle" role="group" aria-label="Prediction">
      <button type="button" aria-pressed={value === 'all'} onClick={() => onChange('all')}>All</button>
      {VERDICTS.filter((v) => counts[v] || value === v).map((v) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          title={NOTION_VERDICTS[v]}>{SHORT[v]} ({counts[v]})</button>
      ))}
      {withNone && counts.none > 0 && (
        <button type="button" aria-pressed={value === 'none'} onClick={() => onChange('none')}>No prediction ({counts.none})</button>
      )}
    </div>
  );
}

/** A source picker built from the outlets and sources the list actually cites. */
export function SourcePicker({ list, value, onChange }: { list: Story[]; value: SourceFilter; onChange: (v: SourceFilter) => void }) {
  const found = outletsIn(list);
  const unsourced = list.filter((s) => !s.sources?.length).length;
  // A single source chosen from a source page stays selectable even if it isn't in the list.
  const single = value.startsWith('source:') ? getSource(value.slice(7)) : undefined;
  return (
    <label className="teampick">
      Source
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">Every source</option>
        {single && <option value={value}>{single.title}</option>}
        {found.map(({ outlet, count }) => (
          <optgroup key={outlet.id} label={outlet.name}>
            <option value={`outlet:${outlet.id}`}>All of {outlet.name} ({count})</option>
            {outlet.sources.length > 1 && outlet.sources.length <= 40 && outlet.sources
              .map((src) => ({ src, n: list.filter((s) => s.sources?.some((c) => c.source === src.id)).length }))
              .filter((x) => x.n)
              .map(({ src, n }) => <option key={src.id} value={`source:${src.id}`}>{src.title} ({n})</option>)}
          </optgroup>
        ))}
        {unsourced > 0 && <option value="unsourced">Not yet sourced ({unsourced})</option>}
      </select>
    </label>
  );
}

/** Free-text filter box used above long lists. */
export function FilterBox({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <label className="filterbox">
      <span className="visually-hidden">{label}</span>
      <input type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
