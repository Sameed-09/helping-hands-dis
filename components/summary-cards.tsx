'use client'

import { CircleCheck, MapPinned, Truck, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useRelief } from '@/lib/store'
import { getSummary } from '@/lib/selectors'
import { formatNumber } from '@/lib/format'

export function SummaryCards() {
  const { data } = useRelief()
  const s = useMemo(() => getSummary(data), [data])

  const cards = [
    {
      label: 'Affected communities',
      value: formatNumber(s.affectedCount),
      note: `${s.severe} severely affected, ${s.monitoring} monitoring`,
      icon: MapPinned,
    },
    {
      label: 'People awaiting support',
      value: formatNumber(s.peopleAwaiting),
      note: 'In communities with open verified requests',
      icon: Users,
    },
    {
      label: 'Deliveries in transit',
      value: formatNumber(s.inTransit),
      note: `${s.awaitingDispatch} assigned, not yet dispatched`,
      icon: Truck,
    },
    {
      label: 'Requests filled',
      value: `${s.filled} of ${s.verifiedTotal}`,
      note: `${s.pendingReports} reports pending verification`,
      icon: CircleCheck,
    },
  ]

  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex flex-col gap-1 rounded-xl border bg-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <c.icon aria-hidden className="size-4 shrink-0 text-brand" />
            {c.label}
          </div>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">
            {c.value}
          </p>
          <p className="text-xs text-muted-foreground">{c.note}</p>
        </div>
      ))}
    </section>
  )
}
