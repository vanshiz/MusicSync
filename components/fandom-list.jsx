"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockFandoms } from "@/lib/mock-data"

export function FandomList({ searchQuery = "" }) {
  const router = useRouter()
  const [fandoms, setFandoms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch fandoms from your API
    setFandoms(mockFandoms)
    setIsLoading(false)
  }, [])

  const filteredFandoms = fandoms.filter(
    (fandom) =>
      fandom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fandom.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fandom.genres.some((genre) => genre.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

  if (filteredFandoms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Fandoms Found</CardTitle>
          <CardDescription>
            {searchQuery
              ? `No fandoms match your search for "${searchQuery}"`
              : "There are no fandoms available at the moment."}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredFandoms.map((fandom) => (
        <Card key={fandom.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {fandom.name}
              <Badge variant="outline">{fandom.members} members</Badge>
            </CardTitle>
            <CardDescription>{fandom.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
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
  )
}
