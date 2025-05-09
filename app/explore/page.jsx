"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { FandomList } from "@/components/fandom-list"
import { mockFandoms } from "@/lib/mock-data"
import { Search, Music, Users, TrendingUpIcon as Trending, Star } from "lucide-react"

export default function ExplorePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [rooms, setRooms] = useState([])
  const [trendingRooms, setTrendingRooms] = useState([])
  const [featuredFandoms, setFeaturedFandoms] = useState([])

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(storedUser))

      // Get rooms from localStorage
      const storedRooms = JSON.parse(localStorage.getItem("rooms") || "[]")

      // Filter out private rooms
      const publicRooms = storedRooms.filter((room) => !room.isPrivate)
      setRooms(publicRooms)

      // Create trending rooms (most users)
      const sortedByUsers = [...publicRooms].sort((a, b) => (b.users?.length || 0) - (a.users?.length || 0)).slice(0, 3)

      setTrendingRooms(sortedByUsers)

      // Set featured fandoms (most members)
      const sortedFandoms = [...mockFandoms].sort((a, b) => b.members - a.members).slice(0, 3)

      setFeaturedFandoms(sortedFandoms)
    } catch (error) {
      console.error("Failed to parse data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real app, this would trigger an API call
    console.log("Searching for:", searchQuery)
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
            <p className="text-muted-foreground">Discover new rooms, fandoms, and music</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
              <Input
                type="text"
                placeholder="Search rooms and fandoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </div>

          {/* Featured Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Featured</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredFandoms.map((fandom) => (
                <Card key={fandom.id} className="overflow-hidden">
                  <div className="bg-primary p-2 text-primary-foreground">
                    <Star className="h-4 w-4" />
                    <span className="ml-2 text-xs font-medium">Featured Fandom</span>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{fandom.name}</CardTitle>
                    <CardDescription>{fandom.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{fandom.members} members</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {fandom.genres.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/fandom/${fandom.id}`)}>
                      View Fandom
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Rooms */}
          <div className="mb-8">
            <h2 className="mb-4 flex items-center text-2xl font-bold">
              <Trending className="mr-2 h-5 w-5" />
              Trending Rooms
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {trendingRooms.length > 0 ? (
                trendingRooms.map((room) => (
                  <Card key={room.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{room.name}</CardTitle>
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
                ))
              ) : (
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>No Trending Rooms</CardTitle>
                    <CardDescription>
                      There are no active public rooms at the moment. Create a new room to get started!
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => router.push("/create-room")}>Create Room</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>

          {/* Browse Tabs */}
          <div>
            <Tabs defaultValue="rooms">
              <TabsList className="mb-4">
                <TabsTrigger value="rooms">All Rooms</TabsTrigger>
                <TabsTrigger value="fandoms">All Fandoms</TabsTrigger>
              </TabsList>

              <TabsContent value="rooms">
                {filteredRooms.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {filteredRooms.map((room) => (
                      <Card key={room.id}>
                        <CardHeader className="pb-2">
                          <CardTitle>{room.name}</CardTitle>
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
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Rooms Found</CardTitle>
                      <CardDescription>
                        {searchQuery
                          ? `No rooms match your search for "${searchQuery}"`
                          : "There are no active public rooms at the moment."}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button onClick={() => router.push("/create-room")}>Create Room</Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="fandoms">
                <FandomList searchQuery={searchQuery} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
