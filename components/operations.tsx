'use client'

import { Truck, PackageCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DeliveryStatusBadge,
  EmptyState,
  ErrorText,
  UrgencyBadge,
} from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { SUPPLY, SUPPLY_TYPES, URGENCY } from '@/lib/supply'
import { availableStock, isOpen, unmetQty } from '@/lib/selectors'
import { formatNumber, formatTime } from '@/lib/format'

export function Operations({ onAssign }: { onAssign: (id: string) => void }) {
  const { data, updateDelivery } = useRelief()
  const [error, setError] = useState<string | null>(null)

  const communityName = (id: string) => {
    const c = data.communities.find((x) => x.id === id)
    return c ? `${c.name}, ${c.state}` : id
  }

  const needing = data.requests
    .filter(
      (r) => r.status === 'verified' && isOpen(data, r) && unmetQty(data, r) > 0,
    )
    .sort((a, b) => URGENCY[a.urgency].rank - URGENCY[b.urgency].rank)

  const deliveries = [...data.deliveries].sort((a, b) => {
    const order = { dispatched: 0, assigned: 1, delivered: 2 } as const
    return order[a.status] - order[b.status]
  })

  function move(id: string, status: 'dispatched' | 'delivered') {
    const res = updateDelivery(id, status)
    setError(res.ok ? null : res.error)
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="ops-stock" className="flex flex-col gap-3">
        <h2 id="ops-stock" className="font-semibold">
          Recorded stock on hand
        </h2>
        <p className="text-sm text-muted-foreground">
          Only pledges that were verified and marked received appear here.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {SUPPLY_TYPES.map((t) => {
            const Icon = SUPPLY[t].icon
            return (
              <li key={t} className="rounded-xl border bg-card p-3">
                <Icon aria-hidden className="size-5 text-brand" />
                <p className="mt-1 text-xl font-bold">
                  {formatNumber(availableStock(data, t))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SUPPLY[t].label} ({SUPPLY[t].unit})
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="ops-needs" className="flex flex-col gap-3">
        <h2 id="ops-needs" className="font-semibold">
          Verified requests needing stock ({needing.length})
        </h2>
        {needing.length === 0 ? (
          <EmptyState title="All verified requests are covered" />
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {needing.map((r) => {
              const stock = availableStock(data, r.item)
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {SUPPLY[r.item].label}: {formatNumber(unmetQty(data, r))}{' '}
                        {SUPPLY[r.item].unit} still needed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {communityName(r.communityId)} &middot; request {r.id}
                      </p>
                    </div>
                    <UrgencyBadge urgency={r.urgency} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={stock === 0}
                      onClick={() => onAssign(r.id)}
                    >
                      Assign stock
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(stock)} {SUPPLY[r.item].unit} in recorded stock
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="ops-deliveries" className="flex flex-col gap-3">
        <h2 id="ops-deliveries" className="font-semibold">
          Deliveries ({deliveries.length})
        </h2>
        <ErrorText message={error} />
        {deliveries.length === 0 ? (
          <EmptyState title="No deliveries yet">
            Assign recorded stock to a verified request to create one.
          </EmptyState>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {deliveries.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border bg-card p-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {SUPPLY[d.item].label}: {formatNumber(d.quantity)}{' '}
                      {SUPPLY[d.item].unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To {communityName(d.communityId)} &middot; request{' '}
                      {d.requestId}
                    </p>
                  </div>
                  <DeliveryStatusBadge status={d.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Assigned {formatTime(d.assignedAt)} by {d.assignedBy}
                  {d.dispatchedAt ? `. Dispatched ${formatTime(d.dispatchedAt)}` : ''}
                  {d.deliveredAt ? `. Delivered ${formatTime(d.deliveredAt)}` : ''}
                </p>
                {d.status === 'assigned' && (
                  <div>
                    <Button size="lg" onClick={() => move(d.id, 'dispatched')}>
                      <Truck aria-hidden />
                      Mark dispatched
                    </Button>
                  </div>
                )}
                {d.status === 'dispatched' && (
                  <div>
                    <Button size="lg" onClick={() => move(d.id, 'delivered')}>
                      <PackageCheck aria-hidden />
                      Mark delivered
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
