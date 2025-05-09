"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DashboardHeader } from "@/components/dashboard-header"
import type { User } from "@/types/user"
import { mockFandoms } from "@/lib/mock-data"

export default function CreateRoom() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fandom: "",
    isPrivate: false,
    maxUsers: "10",
  })
  const [isLoading, setIsLoading] = useState(false)

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
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPrivate: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a random room ID
      const roomId = Math.random().toString(36).substring(2, 10)

      // Store room in localStorage for demo purposes
      const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
      const newRoom = {
        id: roomId,
        ...formData,
        createdBy: user?.id,
        createdAt: new Date().toISOString(),
        users: [user],
        queue: [],
        currentTrack: null,
      }

      localStorage.setItem("rooms", JSON.stringify([...rooms, newRoom]))

      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
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
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Room</CardTitle>
              <CardDescription>Set up a new listening room for you and your friends</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter a name for your room"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Describe what your room is about"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fandom">Fandom</Label>
                  <Select value={formData.fandom} onValueChange={(value) => handleSelectChange("fandom", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a fandom" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFandoms.map((fandom) => (
                        <SelectItem key={fandom.id} value={fandom.id}>
                          {fandom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Select value={formData.maxUsers} onValueChange={(value) => handleSelectChange("maxUsers", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select maximum users" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} users
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isPrivate" checked={formData.isPrivate} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isPrivate">Private Room</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Room..." : "Create Room"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
