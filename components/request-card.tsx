'use client'

import { HandHeart, Route, ShieldCheck, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  RequestStatusBadge,
  UrgencyBadge,
} from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { SUPPLY } from '@/lib/supply'
import { deliveredQty, inTransitQty, unmetQty } from '@/lib/selectors'
import { formatNumber, formatTime } from '@/lib/format'
import type { NeedRequest } from '@/lib/types'

export function RequestCard({
  request,
  communityName,
  onPledge,
  onAssign,
  onReview,
  footer,
}: {
  request: NeedRequest
  communityName?: string
  onPledge?: (request: NeedRequest) => void
  onAssign?: (request: NeedRequest) => void
  onReview?: (request: NeedRequest) => void
  footer?: ReactNode
}) {
  const { data, user } = useRelief()
  const supply = SUPPLY[request.item]
  const Icon = supply.icon
  const delivered = deliveredQty(data, request.id)
  const transit = inTransitQty(data, request.id)
  const unmet = unmetQty(data, request)
  const isCoordinator = user?.role === 'coordinator' || user?.role === 'admin'
  const verified = request.status === 'verified'

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-snug">
            {supply.label}: {formatNumber(request.quantity)} {supply.unit}
          </h4>
          {communityName ? (
            <p className="text-sm text-muted-foreground">{communityName}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <UrgencyBadge urgency={request.urgency} />
            <RequestStatusBadge status={request.status} />
          </div>
        </div>
      </div>

      <dl className="grid gap-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted-foreground">Reported</dt>
          <dd>
            {formatTime(request.reportedAt)} by {request.reportedBy}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted-foreground">Source</dt>
          <dd>{request.source}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="flex w-24 shrink-0 items-start gap-1 text-muted-foreground">
            <Route aria-hidden className="mt-0.5 size-3.5" /> Access
          </dt>
          <dd>{request.accessNotes || 'No access notes given.'}</dd>
        </div>
        {verified && (
          <div className="flex gap-2">
            <dt className="flex w-24 shrink-0 items-start gap-1 text-muted-foreground">
              <Truck aria-hidden className="mt-0.5 size-3.5" /> Progress
            </dt>
            <dd>
              {formatNumber(delivered)} delivered, {formatNumber(transit)} assigned
              or in transit, {formatNumber(unmet)} still needed
            </dd>
          </div>
        )}
      </dl>

      {request.review ? (
        <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          <p>
            <span className="font-semibold text-foreground">
              {request.review.decision === 'verified' ? 'Verified' : 'Rejected'} by{' '}
              {request.review.by}, {formatTime(request.review.at)}.
            </span>{' '}
            Evidence recorded: {request.review.evidence}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Not yet checked. Treat this as an unconfirmed report.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {verified && unmet > 0 && onPledge && (
          <Button variant="default" size="lg" onClick={() => onPledge(request)}>
            <HandHeart aria-hidden />
            Pledge for this request
          </Button>
        )}
        {verified && unmet > 0 && isCoordinator && onAssign && (
          <Button variant="outline" size="lg" onClick={() => onAssign(request)}>
            Assign stock
          </Button>
        )}
        {request.status === 'pending' && isCoordinator && onReview && (
          <Button variant="outline" size="lg" onClick={() => onReview(request)}>
            Review report
          </Button>
        )}
      </div>
      {footer}
    </article>
  )
}
