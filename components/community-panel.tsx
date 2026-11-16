'use client'

import { CloudRain, FilePlus2, HandHeart, X } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState, Notice, SeverityBadge } from '@/components/ui-bits'
import { RequestCard } from '@/components/request-card'
import { useRelief } from '@/lib/store'
import { isOpen } from '@/lib/selectors'
import { URGENCY } from '@/lib/supply'
import { formatNumber } from '@/lib/format'
import type { NeedRequest } from '@/lib/types'

export function CommunityPanel({
  communityId,
  onClose,
  onReport,
  onPledgeCommunity,
  onPledgeRequest,
  onAssign,
  onReview,
}: {
  communityId: string
  onClose: () => void
  onReport: (communityId: string) => void
  onPledgeCommunity: (communityId: string) => void
  onPledgeRequest: (request: NeedRequest) => void
  onAssign: (request: NeedRequest) => void
  onReview: (request: NeedRequest) => void
}) {
  const { data } = useRelief()
  const community = data.communities.find((c) => c.id === communityId)
  const requests = useMemo(
    () =>
      data.requests
        .filter((r) => r.communityId === communityId && isOpen(data, r))
        .sort(
          (a, b) =>
            URGENCY[a.urgency].rank - URGENCY[b.urgency].rank ||
            b.reportedAt.localeCompare(a.reportedAt),
        ),
    [data, communityId],
  )
  if (!community) return null

  return (
    <section
      aria-labelledby="community-heading"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 id="community-heading" className="text-xl font-bold leading-tight">
            {community.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {community.district} district, {community.state}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={community.severity} />
            <span className="text-sm text-muted-foreground">
              {community.hazard}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={onClose}
          aria-label="Close community details"
        >
          <X aria-hidden />
        </Button>
      </div>

      <p className="text-sm">
        <span className="font-semibold">
          {formatNumber(community.peopleAwaiting)}
        </span>{' '}
        people estimated to be awaiting support (sample figure).
      </p>

      {community.alert ? (
        <div className="rounded-lg border border-brand/20 bg-brand-soft p-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-brand">
            <CloudRain aria-hidden className="size-4" />
            Hazard alert: {community.alert.title}
          </p>
          <p className="mt-1 text-foreground">{community.alert.detail}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {community.alert.source}. Hazard information only. It does not
            show what supplies are needed; that comes from verified reports.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={() => onPledgeCommunity(community.id)}>
          <HandHeart aria-hidden />
          Pledge supplies
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onReport(community.id)}
        >
          <FilePlus2 aria-hidden />
          Report a need
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">Open supply requests ({requests.length})</h3>
        {requests.length === 0 ? (
          <EmptyState title="No open requests">
            No supply needs have been reported for this community yet. Shortages
            are only shown when someone reports them.
          </EmptyState>
        ) : (
          <>
            {requests.some((r) => r.status === 'pending') && (
              <Notice tone="warn">
                Requests marked Pending verification have not been checked.
              </Notice>
            )}
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                onPledge={onPledgeRequest}
                onAssign={onAssign}
                onReview={onReview}
              />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
