"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Room } from "@/types/room"
import { Users, Music, Lock, Unlock } from "lucide-react"

export function RoomList() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch rooms from your API
    const storedRooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    setRooms(storedRooms)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-1/2 rounded bg-muted"></div>
              <div className="h-4 w-3/4 rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full rounded bg-muted"></div>
            </CardContent>
            <CardFooter>
              <div className="h-9 w-full rounded bg-muted"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Rooms</CardTitle>
          <CardDescription>There are no active rooms at the moment. Create a new room to get started!</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/create-room")}>Create Room</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Card key={room.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {room.name}
              {room.isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Unlock className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription>{room.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{room.users?.length || 1} users</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                <span>{room.queue?.length || 0} in queue</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push(`/room/${room.id}`)}>
              Join Room
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
