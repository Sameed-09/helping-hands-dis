export type Role = 'volunteer' | 'coordinator' | 'admin'
export type Severity = 'severe' | 'affected' | 'monitoring'
export type SupplyType =
  | 'food'
  | 'water'
  | 'medicine'
  | 'blankets'
  | 'clothing'
  | 'first_aid'
export type Urgency = 'critical' | 'high' | 'medium'
export type RequestStatus = 'pending' | 'verified' | 'rejected'
export type PledgeStatus = 'pending' | 'verified' | 'rejected' | 'received'
export type DeliveryStatus = 'assigned' | 'dispatched' | 'delivered'
export type ContributorType = 'individual' | 'organisation'

export interface User {
  id: string
  name: string
  identifier: string
  role: Role
}

export interface HazardAlert {
  title: string
  detail: string
  source: string
}

export interface Community {
  id: string
  name: string
  district: string
  state: string
  lat: number
  lng: number
  severity: Severity
  hazard: string
  peopleAwaiting: number
  alert?: HazardAlert
}

export interface Review {
  by: string
  at: string
  evidence: string
  decision: 'verified' | 'rejected'
}

export interface NeedRequest {
  id: string
  communityId: string
  item: SupplyType
  quantity: number
  urgency: Urgency
  reportedAt: string
  reportedBy: string
  reportedById: string
  source: string
  accessNotes: string
  status: RequestStatus
  review?: Review
}

export interface Pledge {
  id: string
  communityId: string
  requestId?: string
  item: SupplyType
  quantity: number
  contributorName: string
  contributorType: ContributorType
  pledgedById: string
  note: string
  createdAt: string
  status: PledgeStatus
  review?: Review
  receivedAt?: string
  receivedBy?: string
}

export interface StockLot {
  id: string
  item: SupplyType
  received: number
  remaining: number
  origin: string
  pledgeId?: string
  recordedAt: string
}

export interface Delivery {
  id: string
  requestId: string
  communityId: string
  item: SupplyType
  quantity: number
  lotId: string
  status: DeliveryStatus
  assignedBy: string
  assignedAt: string
  dispatchedAt?: string
  deliveredAt?: string
}

export type ActivityKind =
  | 'report'
  | 'review'
  | 'pledge'
  | 'stock'
  | 'delivery'

export interface Activity {
  id: string
  at: string
  actor: string
  kind: ActivityKind
  text: string
}

export interface ReliefData {
  communities: Community[]
  requests: NeedRequest[]
  pledges: Pledge[]
  stock: StockLot[]
  deliveries: Delivery[]
  activity: Activity[]
}
