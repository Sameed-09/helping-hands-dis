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
import {
  ErrorText,
  Field,
  inputClass,
  Notice,
  textareaClass,
} from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import { SUPPLY, SUPPLY_TYPES } from '@/lib/supply'
import type { ContributorType, SupplyType } from '@/lib/types'

export interface PledgeTarget {
  communityId: string
  requestId?: string
  item?: SupplyType
}

export function PledgeDialog({
  target,
  onClose,
}: {
  target: PledgeTarget | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {target ? (
          <PledgeForm
            key={`${target.communityId}-${target.requestId ?? 'none'}`}
            target={target}
            onDone={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function PledgeForm({
  target,
  onDone,
}: {
  target: PledgeTarget
  onDone: () => void
}) {
  const { data, user, submitPledge } = useRelief()
  const community = data.communities.find((c) => c.id === target.communityId)
  const [item, setItem] = useState<SupplyType>(target.item ?? 'food')
  const [quantity, setQuantity] = useState('')
  const [type, setType] = useState<ContributorType>('individual')
  const [name, setName] = useState(user?.name ?? '')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const locked = !!target.requestId

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const res = submitPledge({
      communityId: target.communityId,
      requestId: target.requestId,
      item,
      quantity: Number(quantity),
      contributorName: name,
      contributorType: type,
      note,
    })
    if (res.ok) onDone()
    else setError(res.error)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Pledge supplies</DialogTitle>
        <DialogDescription>
          For {community?.name}, {community?.state}
          {target.requestId ? ` (request ${target.requestId})` : ''}
        </DialogDescription>
      </DialogHeader>
      <Notice>
        Your pledge will be <strong>pending</strong> until a coordinator reviews
        it. It only counts as available stock after it is verified and
        received.
      </Notice>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Supply item" htmlFor="pl-item">
          <select
            id="pl-item"
            className={inputClass}
            value={item}
            disabled={locked}
            onChange={(e) => setItem(e.target.value as SupplyType)}
          >
            {SUPPLY_TYPES.map((t) => (
              <option key={t} value={t}>
                {SUPPLY[t].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Quantity (${SUPPLY[item].unit})`} htmlFor="pl-qty">
          <input
            id="pl-qty"
            className={inputClass}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pledging as" htmlFor="pl-type">
          <select
            id="pl-type"
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as ContributorType)}
          >
            <option value="individual">Individual</option>
            <option value="organisation">Organisation</option>
          </select>
        </Field>
        <Field
          label={type === 'organisation' ? 'Organisation name' : 'Your name'}
          htmlFor="pl-name"
        >
          <input
            id="pl-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Notes for the coordinator"
        htmlFor="pl-note"
        hint="Where the supplies are, when they can be moved, a contact or registration detail that can be checked."
      >
        <textarea
          id="pl-note"
          className={textareaClass}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      <ErrorText message={error} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="lg">
          Submit pledge
        </Button>
      </div>
    </form>
  )
}
