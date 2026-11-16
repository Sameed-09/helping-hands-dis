'use client'

import { useState } from 'react'
import { ActivityLog } from '@/components/activity-log'
import { AppHeader } from '@/components/app-header'
import { AssignDialog } from '@/components/assign-dialog'
import { CommunityPanel } from '@/components/community-panel'
import { MapSection } from '@/components/map-section'
import { MyPledges } from '@/components/my-pledges'
import { Operations } from '@/components/operations'
import { PledgeDialog, type PledgeTarget } from '@/components/pledge-dialog'
import { ReportDialog } from '@/components/report-dialog'
import { ReviewDialog, type ReviewTarget } from '@/components/review-dialog'
import { ReviewQueue } from '@/components/review-queue'
import { SummaryCards } from '@/components/summary-cards'
import { Notice } from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { cn } from '@/lib/utils'

type Tab = 'map' | 'review' | 'operations' | 'pledges' | 'activity'

export function Dashboard() {
  const { user, data } = useRelief()
  const [tab, setTab] = useState<Tab>('map')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reportFor, setReportFor] = useState<string | null>(null)
  const [pledgeTarget, setPledgeTarget] = useState<PledgeTarget | null>(null)
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)
  const [assignId, setAssignId] = useState<string | null>(null)

  if (!user) return null
  const isCoordinator = user.role !== 'volunteer'
  const pendingCount =
    data.requests.filter((r) => r.status === 'pending').length +
    data.pledges.filter((p) => p.status === 'pending').length

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'map', label: 'Relief map' },
    ...(isCoordinator
      ? [
          { id: 'review' as const, label: 'Review queue', badge: pendingCount },
          { id: 'operations' as const, label: 'Stock and deliveries' },
        ]
      : []),
    { id: 'pledges', label: 'My pledges' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4">
        <Notice tone="warn">
          <strong>Sample data.</strong> Live data is not configured. All
          communities, reports, pledges and figures below are invented for
          demonstration, and changes are not saved after you leave this page.
        </Notice>
        <SummaryCards />

        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors',
                tab === t.id
                  ? 'bg-card text-brand shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {t.badge ? (
                <span className="rounded-full bg-warm px-1.5 text-xs font-bold text-white">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === 'map' && (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_440px]">
            <MapSection selectedId={selectedId} onSelect={setSelectedId} />
            <div className="lg:sticky lg:top-4">
              {selectedId ? (
                <CommunityPanel
                  key={selectedId}
                  communityId={selectedId}
                  onClose={() => setSelectedId(null)}
                  onReport={setReportFor}
                  onPledgeCommunity={(id) => setPledgeTarget({ communityId: id })}
                  onPledgeRequest={(r) =>
                    setPledgeTarget({
                      communityId: r.communityId,
                      requestId: r.id,
                      item: r.item,
                    })
                  }
                  onAssign={(r) => setAssignId(r.id)}
                  onReview={(r) => setReviewTarget({ kind: 'request', id: r.id })}
                />
              ) : (
                <div className="rounded-xl border border-dashed bg-card px-4 py-8 text-center">
                  <p className="font-semibold">Select a community</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a marker on the map or a community in the list to see
                    its open supply requests.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {tab === 'review' && isCoordinator && (
          <ReviewQueue onReview={setReviewTarget} />
        )}
        {tab === 'operations' && isCoordinator && (
          <Operations onAssign={setAssignId} />
        )}
        {tab === 'pledges' && <MyPledges onBrowse={() => setTab('map')} />}
        {tab === 'activity' && <ActivityLog />}
      </main>

      <ReportDialog
        open={!!reportFor}
        onOpenChange={(o) => !o && setReportFor(null)}
        communityId={reportFor}
      />
      <PledgeDialog target={pledgeTarget} onClose={() => setPledgeTarget(null)} />
      <ReviewDialog target={reviewTarget} onClose={() => setReviewTarget(null)} />
      <AssignDialog requestId={assignId} onClose={() => setAssignId(null)} />
    </div>
  )
}
