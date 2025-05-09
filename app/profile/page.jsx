"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserRooms } from "@/components/user-rooms"
import { UserHistory } from "@/components/user-history"
import { MusicPreferences } from "@/components/music-preferences"
import { Upload, Save } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicture: "",
    favoriteGenres: [],
    favoriteArtists: [],
  })

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      // Get profile data from localStorage or use defaults
      const storedProfile = localStorage.getItem(`profile_${parsedUser.id}`)
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile))
      } else {
        // Set default profile data
        setProfileData({
          username: parsedUser.username,
          email: parsedUser.email,
          bio: "Music enthusiast and collaborative listening fan.",
          profilePicture: "",
          favoriteGenres: ["Pop", "Rock", "Hip Hop"],
          favoriteArtists: ["The Weeknd", "Taylor Swift", "Drake"],
        })
      }
    } catch (error) {
      console.error("Failed to parse user data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Save profile data to localStorage
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData))

    // Update user data
    const updatedUser = { ...user, username: profileData.username }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)

    setIsEditing(false)
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, profilePicture: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

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
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Profile Card */}
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{profileData.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                  )}
                </div>

                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" value={profileData.username} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleChange}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" name="bio" value={profileData.bio} onChange={handleChange} rows={4} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <h3 className="text-xl font-semibold">{profileData.username}</h3>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                    <div className="rounded-md bg-muted p-3 text-sm">{profileData.bio}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isEditing ? (
                  <Button onClick={handleSave} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Tabs Section */}
            <div className="md:col-span-8">
              <Tabs defaultValue="preferences">
                <TabsList className="mb-4">
                  <TabsTrigger value="preferences">Music Preferences</TabsTrigger>
                  <TabsTrigger value="rooms">Your Rooms</TabsTrigger>
                  <TabsTrigger value="history">Listening History</TabsTrigger>
                </TabsList>

                <TabsContent value="preferences">
                  <MusicPreferences profileData={profileData} setProfileData={setProfileData} userId={user.id} />
                </TabsContent>

                <TabsContent value="rooms">
                  <UserRooms userId={user.id} />
                </TabsContent>

                <TabsContent value="history">
                  <UserHistory userId={user.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
