"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save } from "lucide-react"

export function MusicPreferences({ profileData, setProfileData, userId }) {
  const [newGenre, setNewGenre] = useState("")
  const [newArtist, setNewArtist] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [tempGenres, setTempGenres] = useState([])
  const [tempArtists, setTempArtists] = useState([])

  useEffect(() => {
    setTempGenres(profileData.favoriteGenres || [])
    setTempArtists(profileData.favoriteArtists || [])
  }, [profileData])

  const handleAddGenre = (e) => {
    e.preventDefault()
    if (newGenre.trim() && !tempGenres.includes(newGenre.trim())) {
      setTempGenres([...tempGenres, newGenre.trim()])
      setNewGenre("")
    }
  }

  const handleRemoveGenre = (genre) => {
    setTempGenres(tempGenres.filter((g) => g !== genre))
  }

  const handleAddArtist = (e) => {
    e.preventDefault()
    if (newArtist.trim() && !tempArtists.includes(newArtist.trim())) {
      setTempArtists([...tempArtists, newArtist.trim()])
      setNewArtist("")
    }
  }

  const handleRemoveArtist = (artist) => {
    setTempArtists(tempArtists.filter((a) => a !== artist))
  }

  const handleSave = () => {
    const updatedProfile = {
      ...profileData,
      favoriteGenres: tempGenres,
      favoriteArtists: tempArtists,
    }

    setProfileData(updatedProfile)
    localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile))
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Favorite Genres</CardTitle>
          <CardDescription>Music genres you enjoy listening to</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <form onSubmit={handleAddGenre} className="flex gap-2">
                <Input
                  placeholder="Add a genre..."
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                {tempGenres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                    {genre}
                    <button onClick={() => handleRemoveGenre(genre)} className="ml-1 rounded-full hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.favoriteGenres && profileData.favoriteGenres.length > 0 ? (
                profileData.favoriteGenres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No favorite genres added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favorite Artists</CardTitle>
          <CardDescription>Artists and bands you love</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <form onSubmit={handleAddArtist} className="flex gap-2">
                <Input
                  placeholder="Add an artist..."
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                {tempArtists.map((artist) => (
                  <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                    {artist}
                    <button onClick={() => handleRemoveArtist(artist)} className="ml-1 rounded-full hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.favoriteArtists && profileData.favoriteArtists.length > 0 ? (
                profileData.favoriteArtists.map((artist) => (
                  <Badge key={artist} variant="secondary">
                    {artist}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No favorite artists added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {isEditing ? (
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Preferences
          </Button>
        )}
      </div>
    </div>
  )
}
