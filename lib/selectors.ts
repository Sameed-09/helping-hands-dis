import type { NeedRequest, ReliefData, SupplyType } from './types'

export function deliveredQty(data: ReliefData, requestId: string) {
  return data.deliveries
    .filter((d) => d.requestId === requestId && d.status === 'delivered')
    .reduce((sum, d) => sum + d.quantity, 0)
}

export function inTransitQty(data: ReliefData, requestId: string) {
  return data.deliveries
    .filter(
      (d) =>
        d.requestId === requestId &&
        (d.status === 'assigned' || d.status === 'dispatched'),
    )
    .reduce((sum, d) => sum + d.quantity, 0)
}

export function unmetQty(data: ReliefData, request: NeedRequest) {
  return Math.max(
    0,
    request.quantity -
      deliveredQty(data, request.id) -
      inTransitQty(data, request.id),
  )
}

export function isFilled(data: ReliefData, request: NeedRequest) {
  return (
    request.status === 'verified' &&
    deliveredQty(data, request.id) >= request.quantity
  )
}

export function isOpen(data: ReliefData, request: NeedRequest) {
  return request.status !== 'rejected' && !isFilled(data, request)
}

export function availableStock(data: ReliefData, item: SupplyType) {
  return data.stock
    .filter((l) => l.item === item)
    .reduce((sum, l) => sum + l.remaining, 0)
}

export function getSummary(data: ReliefData) {
  const affected = data.communities.filter((c) => c.severity !== 'monitoring')
  const severe = affected.filter((c) => c.severity === 'severe').length
  const monitoring = data.communities.length - affected.length

  const waiting = new Set(
    data.requests
      .filter((r) => r.status === 'verified' && !isFilled(data, r))
      .map((r) => r.communityId),
  )
  const peopleAwaiting = data.communities
    .filter((c) => waiting.has(c.id))
    .reduce((sum, c) => sum + c.peopleAwaiting, 0)

  const dispatched = data.deliveries.filter((d) => d.status === 'dispatched')
  const assigned = data.deliveries.filter((d) => d.status === 'assigned')
  const verified = data.requests.filter((r) => r.status === 'verified')
  const filled = verified.filter((r) => isFilled(data, r))

  return {
    affectedCount: affected.length,
    severe,
    monitoring,
    peopleAwaiting,
    inTransit: dispatched.length,
    awaitingDispatch: assigned.length,
    filled: filled.length,
    verifiedTotal: verified.length,
    pendingReports: data.requests.filter((r) => r.status === 'pending').length,
  }
}
