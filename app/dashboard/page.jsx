"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { FandomList } from "@/components/fandom-list"
import { RoomList } from "@/components/room-list"
import { JoinRoomForm } from "@/components/join-room-form"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(storedUser))
    } catch (error) {
      console.error("Failed to parse user data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username}! Explore fandoms or join a room.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <JoinRoomForm />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Create Room</CardTitle>
                <CardDescription>Start a new listening session</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/create-room")} className="w-full">
                  Create New Room
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => router.push("/profile")} className="w-full">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Tabs defaultValue="rooms">
              <TabsList className="mb-4">
                <TabsTrigger value="rooms">Active Rooms</TabsTrigger>
                <TabsTrigger value="fandoms">Fandoms</TabsTrigger>
              </TabsList>
              <TabsContent value="rooms">
                <RoomList />
              </TabsContent>
              <TabsContent value="fandoms">
                <FandomList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
