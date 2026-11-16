'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Community } from '@/lib/types'
import { SEVERITY } from '@/lib/supply'

const INDIA_CENTER: [number, number] = [22.5, 80.5]

function FlyToSelected({ community }: { community?: Community }) {
  const map = useMap()
  useEffect(() => {
    if (community) {
      map.flyTo([community.lat, community.lng], Math.max(map.getZoom(), 6), {
        duration: 0.6,
      })
    }
  }, [community, map])
  return null
}

function ResizeOnMount() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100)
    return () => clearTimeout(t)
  }, [map])
  return null
}

export default function ReliefMap({
  communities,
  selectedId,
  onSelect,
}: {
  communities: Community[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const selected = communities.find((c) => c.id === selectedId)
  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={5}
      minZoom={4}
      scrollWheelZoom
      className="size-full"
      aria-label="Map of affected communities in India"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ResizeOnMount />
      <FlyToSelected community={selected} />
      {communities.map((c) => {
        const color = SEVERITY[c.severity].color
        const isSelected = c.id === selectedId
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={isSelected ? 14 : c.severity === 'severe' ? 11 : 9}
            pathOptions={{
              color: isSelected ? '#12232b' : '#ffffff',
              weight: isSelected ? 3 : 2,
              fillColor: color,
              fillOpacity: 0.92,
            }}
            eventHandlers={{ click: () => onSelect(c.id) }}
          >
            <Tooltip className="hh-tooltip" direction="top" offset={[0, -8]}>
              {c.name}, {c.state} ({SEVERITY[c.severity].label})
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
