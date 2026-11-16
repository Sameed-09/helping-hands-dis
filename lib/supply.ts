import {
  BriefcaseMedical,
  Droplets,
  Pill,
  Shirt,
  Utensils,
  BedDouble,
  type LucideIcon,
} from 'lucide-react'
import type { Severity, SupplyType, Urgency } from './types'

export const SUPPLY: Record<
  SupplyType,
  { label: string; unit: string; icon: LucideIcon }
> = {
  food: { label: 'Food', unit: 'meal packs', icon: Utensils },
  water: { label: 'Clean water', unit: 'litres', icon: Droplets },
  medicine: { label: 'Medicine', unit: 'kits', icon: Pill },
  blankets: { label: 'Blankets', unit: 'blankets', icon: BedDouble },
  clothing: { label: 'Clothing', unit: 'sets', icon: Shirt },
  first_aid: { label: 'First aid', unit: 'kits', icon: BriefcaseMedical },
}

export const SUPPLY_TYPES = Object.keys(SUPPLY) as SupplyType[]

export const SEVERITY: Record<
  Severity,
  { label: string; color: string; description: string }
> = {
  severe: {
    label: 'Severely affected',
    color: '#c62828',
    description: 'Severely affected',
  },
  affected: {
    label: 'Affected',
    color: '#e5a900',
    description: 'Affected',
  },
  monitoring: {
    label: 'Monitoring',
    color: '#2e7d5b',
    description: 'Monitoring',
  },
}

export const URGENCY: Record<Urgency, { label: string; rank: number }> = {
  critical: { label: 'Critical', rank: 0 },
  high: { label: 'High', rank: 1 },
  medium: { label: 'Medium', rank: 2 },
}

export const REPORT_SOURCES = [
  'Direct observation by volunteer',
  'Local official or panchayat',
  'Relief camp in-charge',
  'Community member',
  'Phone call or message',
  'Media or social media (unconfirmed)',
]
