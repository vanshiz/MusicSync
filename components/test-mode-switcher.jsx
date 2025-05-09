"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Users } from "lucide-react"

export function TestModeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [testUsers, setTestUsers] = useState([])
  const [newUsername, setNewUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [currentUser, setCurrentUser] = useState(null)

  // Load test users and current user on mount
  useEffect(() => {
    const storedTestUsers = localStorage.getItem("test_users")
    if (storedTestUsers) {
      setTestUsers(JSON.parse(storedTestUsers))
    }

    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
  }, [])

  const handleCreateTestUser = () => {
    if (!newUsername.trim() || !newEmail.trim()) return

    const newUser = {
      id: `test-${Date.now()}`,
      username: newUsername,
      email: newEmail,
    }

    const updatedUsers = [...testUsers, newUser]
    setTestUsers(updatedUsers)
    localStorage.setItem("test_users", JSON.stringify(updatedUsers))

    setNewUsername("")
    setNewEmail("")
  }

  const handleSwitchUser = (user) => {
    // Save current user to test users if not already there
    if (currentUser && !testUsers.some((u) => u.id === currentUser.id)) {
      const updatedUsers = [...testUsers, currentUser]
      setTestUsers(updatedUsers)
      localStorage.setItem("test_users", JSON.stringify(updatedUsers))
    }

    // Switch to selected user
    localStorage.setItem("user", JSON.stringify(user))
    setCurrentUser(user)
    setIsOpen(false)

    // Reload the page to apply changes
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1 bg-background"
        >
          <Users className="h-4 w-4" />
          <span>Test Mode</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Mode: Switch Users</DialogTitle>
          <DialogDescription>
            Create and switch between test users to simulate multiple users in the same browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current User</h3>
            {currentUser ? (
              <div className="rounded-md border p-2">
                <p className="font-medium">{currentUser.username}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No user logged in</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Available Test Users</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {testUsers.length > 0 ? (
                testUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitchUser(user)}
                      disabled={currentUser?.id === user.id}
                    >
                      Switch
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No test users created yet</p>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-medium">Create New Test User</h3>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTestUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
