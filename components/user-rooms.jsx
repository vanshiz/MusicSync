"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Users, Lock, Unlock } from "lucide-react"

export function UserRooms({ userId }) {
  const router = useRouter()
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get rooms from localStorage
    const storedRooms = JSON.parse(localStorage.getItem("rooms") || "[]")

    // Filter rooms created by or joined by the user
    const userRooms = storedRooms.filter(
      (room) => room.createdBy === userId || room.users.some((user) => user.id === userId),
    )

    setRooms(userRooms)
    setIsLoading(false)
  }, [userId])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
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
          <CardTitle>No Rooms</CardTitle>
          <CardDescription>You haven't created or joined any rooms yet.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/create-room")}>Create Room</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rooms.map((room) => (
        <Card key={room.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>{room.name}</CardTitle>
              {room.isPrivate ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Unlock className="h-3 w-3" />
                  Public
                </Badge>
              )}
            </div>
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
              {room.createdBy === userId && <Badge>Host</Badge>}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push(`/room/${room.id}`)}>
              {room.createdBy === userId ? "Manage Room" : "Join Room"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
