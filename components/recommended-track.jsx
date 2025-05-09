"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function RecommendedTrack({ track, onAdd }) {
  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      <div className="h-10 w-10 overflow-hidden rounded-md">
        <img src={track.thumbnail || "/placeholder.svg"} alt={track.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      </div>
      {onAdd && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAdd}>
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
