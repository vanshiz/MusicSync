"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function QueueItem({ track, onRemove }) {
  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      <div className="h-10 w-10 overflow-hidden rounded-md">
        {track.thumbnail ? (
          <img src={track.thumbnail || "/placeholder.svg"} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs">🎵</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">Added by {track.addedBy}</p>
      </div>
      {onRemove && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
