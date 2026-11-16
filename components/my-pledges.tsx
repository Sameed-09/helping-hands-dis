'use client'

import { Button } from '@/components/ui/button'
import { EmptyState, Notice, PledgeStatusBadge } from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { SUPPLY } from '@/lib/supply'
import { formatNumber, formatTime } from '@/lib/format'

export function MyPledges({ onBrowse }: { onBrowse: () => void }) {
  const { data, user } = useRelief()
  const mine = data.pledges.filter((p) => p.pledgedById === user?.id)

  return (
    <div className="flex flex-col gap-4">
      <Notice>
        A pledge stays pending until a coordinator reviews it. It is not
        counted as available stock until it is verified and received.
      </Notice>
      {mine.length === 0 ? (
        <EmptyState title="You have not made any pledges yet">
          <p>Select a community on the map and choose Pledge supplies.</p>
          <Button className="mt-3" size="lg" onClick={onBrowse}>
            Go to map
          </Button>
        </EmptyState>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {mine.map((p) => {
            const c = data.communities.find((x) => x.id === p.communityId)
            return (
              <li key={p.id} className="flex flex-col gap-2 rounded-xl border bg-card p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {SUPPLY[p.item].label}: {formatNumber(p.quantity)}{' '}
                      {SUPPLY[p.item].unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      For {c?.name}, {c?.state}
                    </p>
                  </div>
                  <PledgeStatusBadge status={p.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pledged {formatTime(p.createdAt)} as {p.contributorName}
                </p>
                {p.review ? (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {p.review.decision === 'verified' ? 'Verified' : 'Rejected'} by{' '}
                    {p.review.by}, {formatTime(p.review.at)}. Evidence recorded:{' '}
                    {p.review.evidence}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
