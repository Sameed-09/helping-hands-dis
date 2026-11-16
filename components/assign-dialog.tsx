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
import { ErrorText, Field, inputClass, Notice } from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { SUPPLY } from '@/lib/supply'
import { unmetQty } from '@/lib/selectors'
import { formatNumber, formatTime } from '@/lib/format'

export function AssignDialog({
  requestId,
  onClose,
}: {
  requestId: string | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!requestId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {requestId ? (
          <AssignForm key={requestId} requestId={requestId} onDone={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function AssignForm({
  requestId,
  onDone,
}: {
  requestId: string
  onDone: () => void
}) {
  const { data, assignStock } = useRelief()
  const request = data.requests.find((r) => r.id === requestId)
  const community = data.communities.find((c) => c.id === request?.communityId)
  const lots = data.stock.filter(
    (l) => l.item === request?.item && l.remaining > 0,
  )
  const unmet = request ? unmetQty(data, request) : 0
  const [lotId, setLotId] = useState(lots[0]?.id ?? '')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!request) return null
  const supply = SUPPLY[request.item]

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const res = assignStock({
      requestId,
      lotId,
      quantity: Number(quantity),
    })
    if (res.ok) onDone()
    else setError(res.error)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Assign stock to request {request.id}</DialogTitle>
        <DialogDescription>
          {supply.label} for {community?.name}, {community?.state}.{' '}
          {formatNumber(unmet)} {supply.unit} still needed.
        </DialogDescription>
      </DialogHeader>
      {lots.length === 0 ? (
        <Notice tone="warn">
          No recorded stock of {supply.label.toLowerCase()} is available.
          Pledges only become stock once they are verified and marked received.
        </Notice>
      ) : (
        <>
          <Field label="Stock lot" htmlFor="as-lot">
            <select
              id="as-lot"
              className={inputClass}
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.origin}: {formatNumber(l.remaining)} {supply.unit} left
                  (recorded {formatTime(l.recordedAt)})
                </option>
              ))}
            </select>
          </Field>
          <Field label={`Quantity (${supply.unit})`} htmlFor="as-qty">
            <input
              id="as-qty"
              className={inputClass}
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        </>
      )}
      <ErrorText message={error} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={lots.length === 0}>
          Assign stock
        </Button>
      </div>
    </form>
  )
}
