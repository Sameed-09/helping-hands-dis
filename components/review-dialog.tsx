'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorText, Field, Notice, textareaClass } from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { SUPPLY } from '@/lib/supply'
import { formatNumber } from '@/lib/format'

export interface ReviewTarget {
  kind: 'request' | 'pledge'
  id: string
}

export function ReviewDialog({
  target,
  onClose,
}: {
  target: ReviewTarget | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {target ? (
          <ReviewForm key={target.id} target={target} onDone={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ReviewForm({
  target,
  onDone,
}: {
  target: ReviewTarget
  onDone: () => void
}) {
  const { data, reviewRequest, reviewPledge } = useRelief()
  const [evidence, setEvidence] = useState('')
  const [error, setError] = useState<string | null>(null)

  const request =
    target.kind === 'request'
      ? data.requests.find((r) => r.id === target.id)
      : undefined
  const pledge =
    target.kind === 'pledge'
      ? data.pledges.find((p) => p.id === target.id)
      : undefined
  const item = request?.item ?? pledge?.item
  const quantity = request?.quantity ?? pledge?.quantity ?? 0
  const communityId = request?.communityId ?? pledge?.communityId
  const community = data.communities.find((c) => c.id === communityId)

  function decide(decision: 'verified' | 'rejected') {
    const res =
      target.kind === 'request'
        ? reviewRequest(target.id, decision, evidence)
        : reviewPledge(target.id, decision, evidence)
    if (res.ok) onDone()
    else setError(res.error)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>
          Review {target.kind === 'request' ? 'report' : 'pledge'} {target.id}
        </DialogTitle>
        <DialogDescription>
          {item ? `${SUPPLY[item].label}: ${formatNumber(quantity)} ${SUPPLY[item].unit}` : ''}
          {community ? ` for ${community.name}, ${community.state}` : ''}
        </DialogDescription>
      </DialogHeader>
      {request ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm">
          Reported by {request.reportedBy}. Source: {request.source}.
        </p>
      ) : null}
      {pledge ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm">
          Pledged by {pledge.contributorName} ({pledge.contributorType}).
          {pledge.note ? ` Note: ${pledge.note}` : ''}
        </p>
      ) : null}
      <Notice>
        Only verify after an independent check, such as a call-back, a site
        visit, or a second source. Record what you checked below.
      </Notice>
      <Field label="Evidence or source you checked" htmlFor="rv-evidence">
        <textarea
          id="rv-evidence"
          className={textareaClass}
          placeholder="For example: phoned the block office on the listed number and they confirmed the road is cut off."
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </Field>
      <ErrorText message={error} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={() => decide('rejected')}
        >
          Reject
        </Button>
        <Button type="button" size="lg" onClick={() => decide('verified')}>
          Verify
        </Button>
      </div>
    </form>
  )
}
