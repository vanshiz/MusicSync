"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Music } from "lucide-react"

export function UserHistory({ userId }) {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this from an API
    // For demo purposes, we'll generate some mock history
    const mockHistory = [
      {
        id: "1",
        trackTitle: "Blinding Lights",
        artist: "The Weeknd",
        roomName: "80s Synth Pop",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        youtubeId: "4NRXx6U8ABQ",
      },
      {
        id: "2",
        trackTitle: "As It Was",
        artist: "Harry Styles",
        roomName: "Pop Hits",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        youtubeId: "H5v3kku4y6Q",
      },
      {
        id: "3",
        trackTitle: "Starboy",
        artist: "The Weeknd",
        roomName: "R&B Vibes",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        youtubeId: "34Na4j8AVgA",
      },
      {
        id: "4",
        trackTitle: "Levitating",
        artist: "Dua Lipa",
        roomName: "Dance Party",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        youtubeId: "TUVcZfQe-Kw",
      },
      {
        id: "5",
        trackTitle: "Uptown Funk",
        artist: "Mark Ronson ft. Bruno Mars",
        roomName: "Funk & Soul",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        youtubeId: "OPf0YbXqDm0",
      },
    ]

    // Store in localStorage if not already there
    const storedHistory = localStorage.getItem(`history_${userId}`)
    if (!storedHistory) {
      localStorage.setItem(`history_${userId}`, JSON.stringify(mockHistory))
      setHistory(mockHistory)
    } else {
      setHistory(JSON.parse(storedHistory))
    }

    setIsLoading(false)
  }, [userId])

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-muted"></div>
                  <div className="h-3 w-1/3 rounded bg-muted"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Listening History</CardTitle>
          <CardDescription>
            Your listening history will appear here once you start playing tracks in rooms.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                <img
                  src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                  alt={item.trackTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.trackTitle}</h4>
                <p className="text-sm text-muted-foreground">{item.artist}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    {item.roomName}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
