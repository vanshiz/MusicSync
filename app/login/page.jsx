"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState(null)

  useEffect(() => {
    // Check if there's a redirect URL in session storage
    const redirect = sessionStorage.getItem("redirectAfterLogin")
    if (redirect) {
      setRedirectUrl(redirect)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // In a real app, you would validate credentials with your backend
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, just create a user
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: Date.now().toString(),
          username: "User" + Math.floor(Math.random() * 1000),
          email: formData.email,
        }),
      )

      // Clear the redirect URL from session storage
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin")
        router.push(redirectUrl)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold">
        <Music className="h-6 w-6" />
        <span>MusicSync</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            {redirectUrl ? "Login to join the room you were invited to" : "Welcome back to MusicSync!"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
