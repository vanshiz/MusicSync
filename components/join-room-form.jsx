"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function JoinRoomForm() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinRoom = async (e) => {
    e.preventDefault()

    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      // Get rooms from localStorage
      const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
      const room = rooms.find((r) => r.id === roomCode.trim())

      if (!room) {
        setError("Room not found. Please check the code and try again.")
        setIsJoining(false)
        return
      }

      // Get current user
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user) {
        router.push("/login")
        return
      }

      // Check if user is already in the room
      const userInRoom = room.users.some((u) => u.id === user.id)
      if (!userInRoom) {
        // Add user to room
        room.users.push(user)

        // Update rooms in localStorage
        const updatedRooms = rooms.map((r) => (r.id === room.id ? room : r))
        localStorage.setItem("rooms", JSON.stringify(updatedRooms))
      }

      // Navigate to the room
      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error("Error joining room:", error)
      setError("An error occurred while joining the room. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Join a Room</CardTitle>
        <CardDescription>Enter a room code to join your friend's room</CardDescription>
      </CardHeader>
      <form onSubmit={handleJoinRoom}>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isJoining}>
              {isJoining ? "Joining..." : "Join"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
