'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createSampleData } from './sample-data'
import { SUPPLY } from './supply'
import { inTransitQty, unmetQty } from './selectors'
import type {
  Activity,
  ActivityKind,
  ContributorType,
  Delivery,
  NeedRequest,
  Pledge,
  ReliefData,
  Role,
  StockLot,
  SupplyType,
  Urgency,
  User,
} from './types'

export type ActionResult = { ok: true } | { ok: false; error: string }

const fail = (error: string): ActionResult => ({ ok: false, error })
const ok: ActionResult = { ok: true }

export interface ReportInput {
  communityId: string
  item: SupplyType
  quantity: number
  urgency: Urgency
  source: string
  accessNotes: string
}

export interface PledgeInput {
  communityId: string
  requestId?: string
  item: SupplyType
  quantity: number
  contributorName: string
  contributorType: ContributorType
  note: string
}

export interface AssignInput {
  requestId: string
  lotId: string
  quantity: number
}

interface ReliefContextValue {
  /** Sample mode: nothing is persisted, and data is invented for the demo. */
  dataMode: 'sample'
  user: User | null
  data: ReliefData
  signIn: (input: {
    identifier: string
    name?: string
    role: Role
  }) => ActionResult
  signOut: () => void
  submitReport: (input: ReportInput) => ActionResult
  reviewRequest: (
    id: string,
    decision: 'verified' | 'rejected',
    evidence: string,
  ) => ActionResult
  submitPledge: (input: PledgeInput) => ActionResult
  reviewPledge: (
    id: string,
    decision: 'verified' | 'rejected',
    evidence: string,
  ) => ActionResult
  receivePledge: (id: string) => ActionResult
  assignStock: (input: AssignInput) => ActionResult
  updateDelivery: (
    id: string,
    status: 'dispatched' | 'delivered',
  ) => ActionResult
}

const ReliefContext = createContext<ReliefContextValue | null>(null)

let counter = 1000
const nextId = (prefix: string) => `${prefix}-${++counter}`

export function ReliefProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<ReliefData>(() => createSampleData())

  const log = useCallback(
    (
      draft: ReliefData,
      actor: string,
      kind: ActivityKind,
      text: string,
    ): ReliefData => {
      const entry: Activity = {
        id: nextId('A'),
        at: new Date().toISOString(),
        actor,
        kind,
        text,
      }
      return { ...draft, activity: [entry, ...draft.activity] }
    },
    [],
  )

  const communityName = (d: ReliefData, id: string) =>
    d.communities.find((c) => c.id === id)?.name ?? 'Unknown community'

  const signIn: ReliefContextValue['signIn'] = useCallback(
    ({ identifier, name, role }) => {
      const clean = identifier.trim()
      setUser({
        id: `user-${clean.toLowerCase()}`,
        name: name?.trim() || clean.split('@')[0] || clean,
        identifier: clean,
        role,
      })
      return ok
    },
    [],
  )

  const signOut = useCallback(() => setUser(null), [])

  const submitReport: ReliefContextValue['submitReport'] = useCallback(
    (input) => {
      if (!user) return fail('Sign in to submit a report.')
      if (!Number.isInteger(input.quantity) || input.quantity <= 0)
        return fail('Enter a whole-number quantity above zero.')
      if (!input.source.trim()) return fail('Say where this information came from.')
      const request: NeedRequest = {
        id: nextId('R'),
        communityId: input.communityId,
        item: input.item,
        quantity: input.quantity,
        urgency: input.urgency,
        reportedAt: new Date().toISOString(),
        reportedBy: user.name,
        reportedById: user.id,
        source: input.source.trim(),
        accessNotes: input.accessNotes.trim(),
        status: 'pending',
      }
      setData((d) =>
        log(
          { ...d, requests: [request, ...d.requests] },
          user.name,
          'report',
          `Reported need: ${input.quantity} ${SUPPLY[input.item].unit} of ${SUPPLY[input.item].label.toLowerCase()} for ${communityName(d, input.communityId)}. Pending verification.`,
        ),
      )
      return ok
    },
    [user, log],
  )

  const reviewRequest: ReliefContextValue['reviewRequest'] = useCallback(
    (id, decision, evidence) => {
      if (!user || user.role === 'volunteer')
        return fail('Only coordinators and admins can review reports.')
      if (!evidence.trim())
        return fail('Record the evidence or source you checked.')
      setData((d) => {
        const req = d.requests.find((r) => r.id === id)
        if (!req) return d
        const next = {
          ...d,
          requests: d.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: decision,
                  review: {
                    by: user.name,
                    at: new Date().toISOString(),
                    evidence: evidence.trim(),
                    decision,
                  },
                }
              : r,
          ),
        }
        return log(
          next,
          user.name,
          'review',
          `${decision === 'verified' ? 'Verified' : 'Rejected'} report ${id} (${SUPPLY[req.item].label}, ${communityName(d, req.communityId)}). Evidence recorded.`,
        )
      })
      return ok
    },
    [user, log],
  )

  const submitPledge: ReliefContextValue['submitPledge'] = useCallback(
    (input) => {
      if (!user) return fail('Sign in to pledge supplies.')
      if (!Number.isInteger(input.quantity) || input.quantity <= 0)
        return fail('Enter a whole-number quantity above zero.')
      if (!input.contributorName.trim())
        return fail('Enter the name of the person or organisation pledging.')
      const pledge: Pledge = {
        id: nextId('P'),
        communityId: input.communityId,
        requestId: input.requestId,
        item: input.item,
        quantity: input.quantity,
        contributorName: input.contributorName.trim(),
        contributorType: input.contributorType,
        pledgedById: user.id,
        note: input.note.trim(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      }
      setData((d) =>
        log(
          { ...d, pledges: [pledge, ...d.pledges] },
          user.name,
          'pledge',
          `${pledge.contributorName} pledged ${pledge.quantity} ${SUPPLY[pledge.item].unit} of ${SUPPLY[pledge.item].label.toLowerCase()} for ${communityName(d, pledge.communityId)}. Pending review; not counted as stock.`,
        ),
      )
      return ok
    },
    [user, log],
  )

  const reviewPledge: ReliefContextValue['reviewPledge'] = useCallback(
    (id, decision, evidence) => {
      if (!user || user.role === 'volunteer')
        return fail('Only coordinators and admins can review pledges.')
      if (!evidence.trim())
        return fail('Record the evidence or source you checked.')
      setData((d) => {
        const p = d.pledges.find((x) => x.id === id)
        if (!p) return d
        const next = {
          ...d,
          pledges: d.pledges.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: decision,
                  review: {
                    by: user.name,
                    at: new Date().toISOString(),
                    evidence: evidence.trim(),
                    decision,
                  },
                }
              : x,
          ),
        }
        return log(
          next,
          user.name,
          'review',
          `${decision === 'verified' ? 'Verified' : 'Rejected'} pledge ${id} from ${p.contributorName}. Evidence recorded.${decision === 'verified' ? ' Not yet stock until received.' : ''}`,
        )
      })
      return ok
    },
    [user, log],
  )

  const receivePledge: ReliefContextValue['receivePledge'] = useCallback(
    (id) => {
      if (!user || user.role === 'volunteer')
        return fail('Only coordinators and admins can record stock.')
      setData((d) => {
        const p = d.pledges.find((x) => x.id === id)
        if (!p || p.status !== 'verified') return d
        const now = new Date().toISOString()
        const lot: StockLot = {
          id: nextId('S'),
          item: p.item,
          received: p.quantity,
          remaining: p.quantity,
          origin: p.contributorName,
          pledgeId: p.id,
          recordedAt: now,
        }
        const next: ReliefData = {
          ...d,
          pledges: d.pledges.map((x) =>
            x.id === id
              ? { ...x, status: 'received', receivedAt: now, receivedBy: user.name }
              : x,
          ),
          stock: [lot, ...d.stock],
        }
        return log(
          next,
          user.name,
          'stock',
          `Recorded receipt of ${p.quantity} ${SUPPLY[p.item].unit} of ${SUPPLY[p.item].label.toLowerCase()} from ${p.contributorName}. Now available stock.`,
        )
      })
      return ok
    },
    [user, log],
  )

  const assignStock: ReliefContextValue['assignStock'] = useCallback(
    ({ requestId, lotId, quantity }) => {
      if (!user || user.role === 'volunteer')
        return fail('Only coordinators and admins can assign stock.')
      const req = data.requests.find((r) => r.id === requestId)
      const lot = data.stock.find((l) => l.id === lotId)
      if (!req || !lot) return fail('Request or stock lot not found.')
      if (req.status !== 'verified')
        return fail('Stock can only be assigned to verified requests.')
      if (lot.item !== req.item)
        return fail('Stock item does not match the request.')
      if (!Number.isInteger(quantity) || quantity <= 0)
        return fail('Enter a whole-number quantity above zero.')
      if (quantity > lot.remaining)
        return fail(`Only ${lot.remaining} left in this stock lot.`)
      const unmet = unmetQty(data, req)
      if (quantity > unmet)
        return fail(`Only ${unmet} still needed for this request.`)
      const delivery: Delivery = {
        id: nextId('D'),
        requestId,
        communityId: req.communityId,
        item: req.item,
        quantity,
        lotId,
        status: 'assigned',
        assignedBy: user.name,
        assignedAt: new Date().toISOString(),
      }
      setData((d) =>
        log(
          {
            ...d,
            stock: d.stock.map((l) =>
              l.id === lotId ? { ...l, remaining: l.remaining - quantity } : l,
            ),
            deliveries: [delivery, ...d.deliveries],
          },
          user.name,
          'delivery',
          `Assigned ${quantity} ${SUPPLY[req.item].unit} of ${SUPPLY[req.item].label.toLowerCase()} to request ${requestId} for ${communityName(d, req.communityId)}.`,
        ),
      )
      return ok
    },
    [user, data, log],
  )

  const updateDelivery: ReliefContextValue['updateDelivery'] = useCallback(
    (id, status) => {
      if (!user || user.role === 'volunteer')
        return fail('Only coordinators and admins can update deliveries.')
      setData((d) => {
        const del = d.deliveries.find((x) => x.id === id)
        if (!del) return d
        if (status === 'dispatched' && del.status !== 'assigned') return d
        if (status === 'delivered' && del.status !== 'dispatched') return d
        const now = new Date().toISOString()
        const next = {
          ...d,
          deliveries: d.deliveries.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status,
                  ...(status === 'dispatched'
                    ? { dispatchedAt: now }
                    : { deliveredAt: now }),
                }
              : x,
          ),
        }
        return log(
          next,
          user.name,
          'delivery',
          `Delivery ${id} to ${communityName(d, del.communityId)} marked ${status}.`,
        )
      })
      return ok
    },
    [user, log],
  )

  const value = useMemo<ReliefContextValue>(
    () => ({
      dataMode: 'sample',
      user,
      data,
      signIn,
      signOut,
      submitReport,
      reviewRequest,
      submitPledge,
      reviewPledge,
      receivePledge,
      assignStock,
      updateDelivery,
    }),
    [
      user,
      data,
      signIn,
      signOut,
      submitReport,
      reviewRequest,
      submitPledge,
      reviewPledge,
      receivePledge,
      assignStock,
      updateDelivery,
    ],
  )

  return <ReliefContext.Provider value={value}>{children}</ReliefContext.Provider>
}

export function useRelief() {
  const ctx = useContext(ReliefContext)
  if (!ctx) throw new Error('useRelief must be used within ReliefProvider')
  return ctx
}

export { inTransitQty }
