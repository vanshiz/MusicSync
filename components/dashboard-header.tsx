"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Music, User, LogOut, Settings } from "lucide-react"
import type { User as UserType } from "@/types/user"

interface DashboardHeaderProps {
  user: UserType | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Music className="h-6 w-6" />
          <span>MusicSync</span>
        </Link>

        <nav className="ml-6 hidden md:flex">
          <ul className="flex gap-6">
            <li>
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/my-rooms" className="text-sm font-medium transition-colors hover:text-primary">
                My Rooms
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
