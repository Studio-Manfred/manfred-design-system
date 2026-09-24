/**
 * Resolve a series colour by zero-based index. Cycles through the six
 * `--chart-1` … `--chart-6` token slots so multi-series charts stay
 * on-palette and theme-aware.
 *
 * @example
 * ```tsx
 * series.map((s, i) => <Bar key={s.key} fill={chartSeriesColor(i)} />)
 * ```
 */
export function chartSeriesColor(index: number): string {
  const slot = (index % 6) + 1;
  return `var(--chart-${slot})`;
}
