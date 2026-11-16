'use client'

import dynamic from 'next/dynamic'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { inputClass, SeverityBadge } from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { isOpen } from '@/lib/selectors'
import { SEVERITY, SUPPLY, SUPPLY_TYPES } from '@/lib/supply'
import { formatNumber } from '@/lib/format'
import type { Severity, SupplyType } from '@/lib/types'
import { cn } from '@/lib/utils'

const ReliefMap = dynamic(() => import('@/components/relief-map'), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
})

export function MapSection({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { data } = useRelief()
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<Severity | 'all'>('all')
  const [supply, setSupply] = useState<SupplyType | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.communities.filter((c) => {
      if (
        q &&
        !`${c.name} ${c.district} ${c.state}`.toLowerCase().includes(q)
      )
        return false
      if (severity !== 'all' && c.severity !== severity) return false
      if (
        supply !== 'all' &&
        !data.requests.some(
          (r) =>
            r.communityId === c.id && r.item === supply && isOpen(data, r),
        )
      )
        return false
      return true
    })
  }, [data, query, severity, supply])

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative">
          <label htmlFor="map-search" className="sr-only">
            Search by state or community
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="map-search"
            type="search"
            className={cn(inputClass, 'pl-9')}
            placeholder="Search state or community"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="map-severity" className="sr-only">
            Filter by severity
          </label>
          <select
            id="map-severity"
            className={inputClass}
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity | 'all')}
          >
            <option value="all">All severities</option>
            {(Object.keys(SEVERITY) as Severity[]).map((s) => (
              <option key={s} value={s}>
                {SEVERITY[s].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="map-supply" className="sr-only">
            Filter by supply type
          </label>
          <select
            id="map-supply"
            className={inputClass}
            value={supply}
            onChange={(e) => setSupply(e.target.value as SupplyType | 'all')}
          >
            <option value="all">All supply types</option>
            {SUPPLY_TYPES.map((t) => (
              <option key={t} value={t}>
                {SUPPLY[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative h-[340px] overflow-hidden rounded-xl border sm:h-[440px] lg:h-[520px]">
        <ReliefMap
          communities={filtered}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <ul
          aria-label="Map legend"
          className="absolute bottom-2 left-2 z-[500] flex flex-col gap-1 rounded-lg bg-card/95 px-2.5 py-2 text-xs shadow"
        >
          {(Object.keys(SEVERITY) as Severity[]).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-3 rounded-full border border-white shadow-[0_0_0_1px_rgb(0_0_0/0.25)]"
                style={{ backgroundColor: SEVERITY[s].color }}
              />
              {SEVERITY[s].label}
            </li>
          ))}
        </ul>
      </div>

      <section aria-labelledby="community-list-heading">
        <h2 id="community-list-heading" className="mb-2 font-semibold">
          Communities ({filtered.length})
        </h2>
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            No communities match these filters.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-pressed={c.id === selectedId}
                  className={cn(
                    'flex min-h-14 w-full flex-col gap-1 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-accent',
                    c.id === selectedId && 'border-brand ring-2 ring-brand/30',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{c.name}</span>
                    <SeverityBadge severity={c.severity} />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {c.state} &middot; {c.hazard} &middot;{' '}
                    {formatNumber(c.peopleAwaiting)} people
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
