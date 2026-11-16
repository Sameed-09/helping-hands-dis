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
import {
  REPORT_SOURCES,
  SUPPLY,
  SUPPLY_TYPES,
  URGENCY,
} from '@/lib/supply'
import type { SupplyType, Urgency } from '@/lib/types'

export function ReportDialog({
  open,
  onOpenChange,
  communityId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  communityId: string | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {open && communityId ? (
          <ReportForm
            key={communityId}
            communityId={communityId}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ReportForm({
  communityId,
  onDone,
}: {
  communityId: string
  onDone: () => void
}) {
  const { data, submitReport } = useRelief()
  const community = data.communities.find((c) => c.id === communityId)
  const [item, setItem] = useState<SupplyType>('food')
  const [quantity, setQuantity] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('high')
  const [source, setSource] = useState(REPORT_SOURCES[0])
  const [accessNotes, setAccessNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const res = submitReport({
      communityId,
      item,
      quantity: Number(quantity),
      urgency,
      source,
      accessNotes,
    })
    if (res.ok) onDone()
    else setError(res.error)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Report a need</DialogTitle>
        <DialogDescription>
          {community?.name}, {community?.state}
        </DialogDescription>
      </DialogHeader>
      <Notice>
        New reports are marked <strong>Pending verification</strong> until a
        coordinator checks them.
      </Notice>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Supply item" htmlFor="rep-item">
          <select
            id="rep-item"
            className={inputClass}
            value={item}
            onChange={(e) => setItem(e.target.value as SupplyType)}
          >
            {SUPPLY_TYPES.map((t) => (
              <option key={t} value={t}>
                {SUPPLY[t].label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={`Quantity (${SUPPLY[item].unit})`}
          htmlFor="rep-qty"
        >
          <input
            id="rep-qty"
            className={inputClass}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
          />
        </Field>
      </div>
      <Field label="Urgency" htmlFor="rep-urgency">
        <select
          id="rep-urgency"
          className={inputClass}
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as Urgency)}
        >
          {(Object.keys(URGENCY) as Urgency[]).map((u) => (
            <option key={u} value={u}>
              {URGENCY[u].label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Source of this information"
        htmlFor="rep-source"
        hint="Say how you know this, so a coordinator can check it."
      >
        <select
          id="rep-source"
          className={inputClass}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {REPORT_SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Access or route notes" htmlFor="rep-access">
        <textarea
          id="rep-access"
          className={textareaClass}
          placeholder="Road status, nearest drop point, boat access, contact at site"
          value={accessNotes}
          onChange={(e) => setAccessNotes(e.target.value)}
        />
      </Field>
      <ErrorText message={error} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="lg">
          Submit report
        </Button>
      </div>
    </form>
  )
}
