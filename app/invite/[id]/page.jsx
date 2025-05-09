"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Users } from "lucide-react"

export default function InvitePage({ params }) {
  const router = useRouter()
  const [room, setRoom] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      // Store the invite URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", `/invite/${params.id}`)
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(storedUser))

      // Get room data
      const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
      const roomData = rooms.find((r) => r.id === params.id)

      if (!roomData) {
        setError("Room not found. The room may have been deleted or the invite code is invalid.")
      } else {
        setRoom(roomData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("An error occurred while loading the room data.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router])

  const handleJoinRoom = async () => {
    if (!room || !user) return

    setIsJoining(true)

    try {
      // Get updated rooms data
      const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
      const currentRoom = rooms.find((r) => r.id === room.id)

      if (!currentRoom) {
        setError("Room no longer exists.")
        setIsJoining(false)
        return
      }

      // Check if user is already in the room
      const userInRoom = currentRoom.users.some((u) => u.id === user.id)
      if (!userInRoom) {
        // Add user to room
        currentRoom.users.push(user)

        // Update rooms in localStorage
        const updatedRooms = rooms.map((r) => (r.id === currentRoom.id ? currentRoom : r))
        localStorage.setItem("rooms", JSON.stringify(updatedRooms))
      }

      // Navigate to the room
      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error("Error joining room:", error)
      setError("An error occurred while joining the room. Please try again.")
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading invite...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Link href="/" className="mb-8 flex items-center gap-2 font-bold">
          <Music className="h-6 w-6" />
          <span>MusicSync</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite Error</CardTitle>
            <CardDescription>There was a problem with this invite.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold">
        <Music className="h-6 w-6" />
        <span>MusicSync</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Room Invitation</CardTitle>
          <CardDescription>You've been invited to join a music room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="text-xl font-bold">{room.name}</h3>
            <p className="text-sm text-muted-foreground">{room.description}</p>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{room.users?.length || 1} users</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                <span>{room.queue?.length || 0} in queue</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleJoinRoom} className="w-full" disabled={isJoining}>
            {isJoining ? "Joining..." : "Join Room"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
