'use client'

import { PackageCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  ErrorText,
  Notice,
  PledgeStatusBadge,
} from '@/components/ui-bits'
import { RequestCard } from '@/components/request-card'
import type { ReviewTarget } from '@/components/review-dialog'
import { useRelief } from '@/lib/store'
import { SUPPLY } from '@/lib/supply'
import { formatNumber, formatTime } from '@/lib/format'
import type { Pledge } from '@/lib/types'

export function ReviewQueue({
  onReview,
}: {
  onReview: (target: ReviewTarget) => void
}) {
  const { data, receivePledge } = useRelief()
  const [error, setError] = useState<string | null>(null)
  const pendingReports = data.requests.filter((r) => r.status === 'pending')
  const pendingPledges = data.pledges.filter((p) => p.status === 'pending')
  const awaitingReceipt = data.pledges.filter((p) => p.status === 'verified')
  const communityName = (id: string) => {
    const c = data.communities.find((x) => x.id === id)
    return c ? `${c.name}, ${c.state}` : id
  }

  function receive(id: string) {
    const res = receivePledge(id)
    setError(res.ok ? null : res.error)
  }

  const pledgeRow = (p: Pledge, action: 'review' | 'receive') => (
    <li
      key={p.id}
      className="flex flex-col gap-2 rounded-xl border bg-card p-3.5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {SUPPLY[p.item].label}: {formatNumber(p.quantity)} {SUPPLY[p.item].unit}
          </p>
          <p className="text-sm text-muted-foreground">
            {p.contributorName} ({p.contributorType}) for {communityName(p.communityId)}
          </p>
        </div>
        <PledgeStatusBadge status={p.status} />
      </div>
      <p className="text-sm">
        Pledged {formatTime(p.createdAt)}. {p.note || 'No notes.'}
      </p>
      {p.review ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Verified by {p.review.by}. Evidence recorded: {p.review.evidence}
        </p>
      ) : null}
      <div>
        {action === 'review' ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => onReview({ kind: 'pledge', id: p.id })}
          >
            Review pledge
          </Button>
        ) : (
          <Button size="lg" onClick={() => receive(p.id)}>
            <PackageCheck aria-hidden />
            Record as received into stock
          </Button>
        )}
      </div>
    </li>
  )

  return (
    <div className="flex flex-col gap-6">
      <Notice>
        Verify or reject each item only after an independent check, and record
        the evidence. Pledges are not stock until verified and received.
      </Notice>
      <ErrorText message={error} />

      <section aria-labelledby="q-reports" className="flex flex-col gap-3">
        <h2 id="q-reports" className="font-semibold">
          Reports pending verification ({pendingReports.length})
        </h2>
        {pendingReports.length === 0 ? (
          <EmptyState title="No reports waiting" />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {pendingReports.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                communityName={communityName(r.communityId)}
                onReview={(req) => onReview({ kind: 'request', id: req.id })}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="q-pledges" className="flex flex-col gap-3">
        <h2 id="q-pledges" className="font-semibold">
          Pledges pending review ({pendingPledges.length})
        </h2>
        {pendingPledges.length === 0 ? (
          <EmptyState title="No pledges waiting" />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {pendingPledges.map((p) => pledgeRow(p, 'review'))}
          </ul>
        )}
      </section>

      <section aria-labelledby="q-receipt" className="flex flex-col gap-3">
        <h2 id="q-receipt" className="font-semibold">
          Verified pledges awaiting receipt ({awaitingReceipt.length})
        </h2>
        {awaitingReceipt.length === 0 ? (
          <EmptyState title="Nothing awaiting receipt" />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {awaitingReceipt.map((p) => pledgeRow(p, 'receive'))}
          </ul>
        )}
      </section>
    </div>
  )
}
