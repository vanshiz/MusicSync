"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { MusicPlayer } from "@/components/music-player"
import { ChatMessage } from "@/components/chat-message"
import { QueueItem } from "@/components/queue-item"
import { RecommendedTrack } from "@/components/recommended-track"
import { extractYouTubeId, getYouTubeVideoDetails } from "@/lib/utils"
import { initializeSocket, joinRoom, sendMessage as socketSendMessage, listenForMessages } from "@/lib/socket-client"
import { Send, Plus, Users, MoreVertical, Crown, Shield, UserPlus, Settings } from "lucide-react"

export default function RoomPage({ params }) {
  // Simply use params.id directly instead of trying to unwrap it
  // This will work for now, though Next.js warns it might change in the future
  const roomId = params.id

  const router = useRouter()
  const [user, setUser] = useState(null)
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isAddingTrack, setIsAddingTrack] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [showRoomSettings, setShowRoomSettings] = useState(false)
  const messagesEndRef = useRef(null)
  const [socketStatus, setSocketStatus] = useState("connecting")
  const socketCleanupRef = useRef(null)

  // Load user and room data
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

      // Load room data
      const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
      const currentRoom = rooms.find((r) => r.id === roomId) // Use roomId instead of params.id

      if (!currentRoom) {
        router.push("/dashboard")
        return
      }

      // Initialize room roles if they don't exist
      if (!currentRoom.roles) {
        currentRoom.roles = {
          [currentRoom.createdBy]: "host",
        }
      }

      // Initialize room settings if they don't exist
      if (!currentRoom.settings) {
        currentRoom.settings = {
          allowGuestQueue: true,
          allowGuestSkip: false,
          showRecommendations: true,
        }
      }

      // Check if user is in the room, if not add them
      const userInRoom = currentRoom.users.some((u) => u.id === parsedUser.id)
      if (!userInRoom) {
        currentRoom.users.push(parsedUser)

        // Update rooms in localStorage
        const updatedRooms = rooms.map((r) => (r.id === currentRoom.id ? currentRoom : r))
        localStorage.setItem("rooms", JSON.stringify(updatedRooms))
      }

      setRoom(currentRoom)

      // Generate invite link
      setInviteLink(`${window.location.origin}/invite/${currentRoom.id}`)

      // Initialize socket connection and join room
      initializeSocket()
      const roomEvents = joinRoom(roomId, parsedUser.id, parsedUser.username)

      // Listen for messages
      const messageCleanup = listenForMessages((message) => {
        setMessages((prev) => [...prev, message])
      })

      // Store cleanup functions
      socketCleanupRef.current = () => {
        messageCleanup()
      }

      // Load existing messages from localStorage or create initial ones
      const storedMessages = localStorage.getItem(`room_messages_${roomId}`)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      } else {
        // Create initial messages
        const initialMessages = [
          {
            id: "1",
            userId: currentRoom.createdBy,
            username: currentRoom.users[0].username,
            content: "Welcome to the room!",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            userId: "system",
            username: "System",
            content: "Add some music to the queue to get started!",
            timestamp: new Date().toISOString(),
          },
          {
            id: "3",
            userId: "system",
            username: "System",
            content: `${parsedUser.username} has joined the room`,
            timestamp: new Date().toISOString(),
          },
        ]
        setMessages(initialMessages)
        localStorage.setItem(`room_messages_${roomId}`, JSON.stringify(initialMessages))
      }

      // Generate recommendations based on current track and queue
      generateRecommendations(currentRoom)
    } catch (error) {
      console.error("Failed to load data:", error)
      router.push("/dashboard")
    }

    // Cleanup socket connection on unmount
    return () => {
      if (socketCleanupRef.current) {
        socketCleanupRef.current()
      }
    }
  }, [roomId, router]) // Use roomId instead of params.id

  // Add this useEffect to monitor socket connection status
  useEffect(() => {
    // Import at the top of your file
    const { getConnectionStatus } = require("@/lib/socket-client")

    // Initial status
    setSocketStatus(getConnectionStatus())

    // Check status periodically
    const interval = setInterval(() => {
      const status = getConnectionStatus()
      setSocketStatus(status)

      // Log the status for debugging
      console.log("Socket connection status:", status)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0 && roomId) {
      localStorage.setItem(`room_messages_${roomId}`, JSON.stringify(messages))
    }
  }, [messages, roomId])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateRecommendations = (roomData) => {
    // In a real app, this would be an API call to a recommendation service
    // For demo purposes, we'll generate some mock recommendations

    // Get genres from played tracks or use defaults
    const genres = ["pop", "rock", "electronic", "hip-hop", "r&b"]

    // Mock recommendations
    const mockRecommendations = [
      {
        id: "rec1",
        youtubeId: "JGwWNGJdvx8",
        title: "Shape of You",
        artist: "Ed Sheeran",
        thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg",
      },
      {
        id: "rec2",
        youtubeId: "kJQP7kiw5Fk",
        title: "Despacito",
        artist: "Luis Fonsi ft. Daddy Yankee",
        thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
      },
      {
        id: "rec3",
        youtubeId: "RgKAFK5djSk",
        title: "See You Again",
        artist: "Wiz Khalifa ft. Charlie Puth",
        thumbnail: "https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg",
      },
      {
        id: "rec4",
        youtubeId: "fKopy74weus",
        title: "Thunder",
        artist: "Imagine Dragons",
        thumbnail: "https://img.youtube.com/vi/fKopy74weus/mqdefault.jpg",
      },
      {
        id: "rec5",
        youtubeId: "JRfuAukYTKg",
        title: "Believer",
        artist: "Imagine Dragons",
        thumbnail: "https://img.youtube.com/vi/JRfuAukYTKg/mqdefault.jpg",
      },
    ]

    setRecommendations(mockRecommendations)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!messageInput.trim() || !user) return

    const newMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      content: messageInput,
      timestamp: new Date().toISOString(),
    }

    // Add message to local state
    setMessages((prev) => [...prev, newMessage])

    // Send message via socket
    socketSendMessage(roomId, newMessage)

    // Clear input
    setMessageInput("")
  }

  const handleAddTrack = async (e) => {
    e.preventDefault()

    if (!youtubeUrl.trim() || !room) return

    const videoId = extractYouTubeId(youtubeUrl)

    if (!videoId) {
      alert("Please enter a valid YouTube URL")
      return
    }

    try {
      // In a real app, you would fetch video details from YouTube API
      // For demo purposes, we'll use a mock function
      const videoDetails = await getYouTubeVideoDetails(videoId)

      const newTrack = {
        id: Date.now().toString(),
        youtubeId: videoId,
        title: videoDetails.title,
        artist: videoDetails.channelTitle,
        addedBy: user.username,
        addedById: user.id,
        addedAt: new Date().toISOString(),
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      }

      // Update room queue
      const updatedRoom = { ...room }
      updatedRoom.queue = [...(updatedRoom.queue || []), newTrack]

      // If no current track, set this as current
      if (!updatedRoom.currentTrack) {
        updatedRoom.currentTrack = newTrack
        updatedRoom.queue = updatedRoom.queue.filter((t) => t.id !== newTrack.id)
      }

      // Update in localStorage
      const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
      const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

      localStorage.setItem("rooms", JSON.stringify(updatedRooms))
      setRoom(updatedRoom)
      setYoutubeUrl("")
      setIsAddingTrack(false)

      // Add system message
      const systemMessage = {
        id: Date.now().toString(),
        userId: "system",
        username: "System",
        content: `${user.username} added "${newTrack.title}" to the queue`,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, systemMessage])

      // Send system message via socket
      socketSendMessage(roomId, systemMessage)

      // Update listening history
      updateListeningHistory(newTrack)
    } catch (error) {
      console.error("Failed to add track:", error)
      alert("Failed to add track. Please try again.")
    }
  }

  const handleAddRecommendation = async (recommendation) => {
    if (!room) return

    const newTrack = {
      id: Date.now().toString(),
      youtubeId: recommendation.youtubeId,
      title: recommendation.title,
      artist: recommendation.artist,
      addedBy: user.username,
      addedById: user.id,
      addedAt: new Date().toISOString(),
      thumbnail: recommendation.thumbnail,
    }

    // Update room queue
    const updatedRoom = { ...room }
    updatedRoom.queue = [...(updatedRoom.queue || []), newTrack]

    // If no current track, set this as current
    if (!updatedRoom.currentTrack) {
      updatedRoom.currentTrack = newTrack
      updatedRoom.queue = updatedRoom.queue.filter((t) => t.id !== newTrack.id)
    }

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    setRoom(updatedRoom)

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "System",
      content: `${user.username} added recommended track "${newTrack.title}" to the queue`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, systemMessage])

    // Send system message via socket
    socketSendMessage(roomId, systemMessage)

    // Update listening history
    updateListeningHistory(newTrack)
  }

  const updateListeningHistory = (track) => {
    if (!user) return

    // Get existing history
    const historyKey = `history_${user.id}`
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]")

    // Add new track to history
    const historyItem = {
      id: Date.now().toString(),
      trackTitle: track.title,
      artist: track.artist,
      roomName: room.name,
      timestamp: new Date().toISOString(),
      youtubeId: track.youtubeId,
    }

    // Limit history to 20 items
    const updatedHistory = [historyItem, ...existingHistory].slice(0, 20)

    // Save to localStorage
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory))
  }

  const handlePlayNext = () => {
    if (!room || !room.queue || room.queue.length === 0) return

    // Check if user has permission to skip
    if (!canSkipTrack()) {
      alert("You don't have permission to skip tracks in this room")
      return
    }

    const updatedRoom = { ...room }
    const nextTrack = updatedRoom.queue[0]
    updatedRoom.currentTrack = nextTrack
    updatedRoom.queue = updatedRoom.queue.slice(1)

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    localStorage.setItem("rooms", JSON.stringify(updatedRooms))

    setRoom(updatedRoom)

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "System",
      content: `Now playing: ${nextTrack.title}`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, systemMessage])

    // Send system message via socket
    socketSendMessage(roomId, systemMessage)

    // Update listening history
    updateListeningHistory(nextTrack)
  }

  const handleRemoveFromQueue = (trackId) => {
    if (!room) return

    // Check if user has permission to modify queue
    if (!canModifyQueue(trackId)) {
      alert("You don't have permission to remove this track from the queue")
      return
    }

    const updatedRoom = { ...room }
    const removedTrack = updatedRoom.queue.find((t) => t.id === trackId)
    updatedRoom.queue = updatedRoom.queue.filter((t) => t.id !== trackId)

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    setRoom(updatedRoom)

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "System",
      content: `${user.username} removed "${removedTrack.title}" from the queue`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, systemMessage])

    // Send system message via socket
    socketSendMessage(roomId, systemMessage)
  }

  const handlePromoteToModerator = (userId) => {
    if (!room || !isHost()) return

    const updatedRoom = { ...room }
    updatedRoom.roles = { ...updatedRoom.roles, [userId]: "moderator" }

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    setRoom(updatedRoom)

    // Find username
    const promotedUser = room.users.find((u) => u.id === userId)

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "System",
      content: `${promotedUser.username} has been promoted to moderator`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, systemMessage])

    // Send system message via socket
    socketSendMessage(roomId, systemMessage)
  }

  const handleDemoteUser = (userId) => {
    if (!room || !isHost()) return

    const updatedRoom = { ...room }
    const { [userId]: _, ...restRoles } = updatedRoom.roles
    updatedRoom.roles = restRoles

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    setRoom(updatedRoom)

    // Find username
    const demotedUser = room.users.find((u) => u.id === userId)

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "System",
      content: `${demotedUser.username} is no longer a moderator`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, systemMessage])

    // Send system message via socket
    socketSendMessage(roomId, systemMessage)
  }

  const handleUpdateRoomSettings = (settings) => {
    if (!room || !isHost()) return

    const updatedRoom = { ...room }
    updatedRoom.settings = { ...updatedRoom.settings, ...settings }

    // Update in localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]")
    const updatedRooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    setRoom(updatedRoom)
    setShowRoomSettings(false)

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "System",
      content: "Room settings have been updated",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, systemMessage])

    // Send system message via socket
    socketSendMessage(roomId, systemMessage)
  }

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        alert("Invite link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy invite link:", err)
        alert("Failed to copy invite link. Please try again.")
      })
  }

  // Permission checks
  const getUserRole = () => {
    if (!room || !user) return "guest"
    return room.roles?.[user.id] || "guest"
  }

  const isHost = () => {
    return getUserRole() === "host"
  }

  const isModerator = () => {
    const role = getUserRole()
    return role === "host" || role === "moderator"
  }

  const canModifyQueue = (trackId) => {
    if (isHost() || isModerator()) return true

    // Check if user added the track
    if (trackId && room.queue) {
      const track = room.queue.find((t) => t.id === trackId)
      if (track && track.addedById === user.id) return true
    }

    // Check room settings
    return room.settings?.allowGuestQueue || false
  }

  const canSkipTrack = () => {
    if (isHost() || isModerator()) return true

    // Check room settings
    return room.settings?.allowGuestSkip || false
  }

  const getRoleBadge = (userId) => {
    if (!room || !room.roles) return null

    const role = room.roles[userId]
    if (role === "host") {
      return (
        <Badge className="ml-2 flex items-center gap-1">
          <Crown className="h-3 w-3" />
          Host
        </Badge>
      )
    } else if (role === "moderator") {
      return (
        <Badge variant="secondary" className="ml-2 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Mod
        </Badge>
      )
    }
    return null
  }

  if (!user || !room) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex flex-1 overflow-hidden">
        {/* Chat Section */}
        <div className="flex flex-1 flex-col border-r">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{room.name}</h2>
                {socketStatus !== "connected" && (
                  <div className="rounded-md bg-yellow-50 p-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                    {socketStatus === "connecting" ? (
                      <span>Connecting to server... The app will work in offline mode until connected.</span>
                    ) : (
                      <span>Offline mode - Chat and music sync between different users will be limited.</span>
                    )}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{room.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {room.users?.length || 1}
                </Button>

                {(isHost() || isModerator()) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Room Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowRoomSettings(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Room Settings
                      </DropdownMenuItem>
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Users
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite Users</DialogTitle>
                            <DialogDescription>
                              Share this link with others to invite them to this room.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center gap-2">
                            <Input value={inviteLink} readOnly />
                            <Button onClick={copyInviteLink}>Copy</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isCurrentUser={message.userId === user.id}
                  roleBadge={getRoleBadge(message.userId)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Music Player Section */}
        <div className="w-96 flex flex-col border-l">
          {/* Current Track */}
          <div className="border-b p-4">
            <h3 className="font-medium">Now Playing</h3>
            <MusicPlayer
              currentTrack={room.currentTrack}
              onEnded={handlePlayNext}
              canSkip={canSkipTrack()}
              roomId={roomId}
            />
          </div>

          {/* Queue */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="queue">
              <TabsList className="w-full">
                <TabsTrigger value="queue" className="flex-1">
                  Queue
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex-1" onClick={() => setShowRecommendations(true)}>
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="queue" className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Up Next</h3>
                  {canModifyQueue() && (
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingTrack(!isAddingTrack)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isAddingTrack && (
                  <form onSubmit={handleAddTrack} className="mb-4 space-y-2">
                    <Input
                      placeholder="Paste YouTube URL..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                    <Button type="submit" size="sm" className="w-full">
                      Add to Queue
                    </Button>
                  </form>
                )}

                {room.queue && room.queue.length > 0 ? (
                  <div className="space-y-2">
                    {room.queue.map((track) => (
                      <QueueItem
                        key={track.id}
                        track={track}
                        onRemove={canModifyQueue(track.id) ? () => handleRemoveFromQueue(track.id) : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Queue is empty. Add some tracks!</p>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium">Recommended Tracks</h3>
                  <p className="text-xs text-muted-foreground">Based on your room's listening history</p>
                </div>

                {recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {recommendations.map((track) => (
                      <RecommendedTrack
                        key={track.id}
                        track={track}
                        onAdd={canModifyQueue() ? () => handleAddRecommendation(track) : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Play some tracks to get recommendations!</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Room Members */}
          <div className="border-t p-4">
            <h3 className="mb-2 font-medium">Room Members</h3>
            <div className="space-y-2">
              {room.users?.map((roomUser) => (
                <div key={roomUser.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-center text-xs leading-6 text-primary-foreground">
                      {roomUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{roomUser.username}</span>
                    {getRoleBadge(roomUser.id)}
                  </div>

                  {isHost() && roomUser.id !== user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {room.roles?.[roomUser.id] === "moderator" ? (
                          <DropdownMenuItem onClick={() => handleDemoteUser(roomUser.id)}>
                            Remove Moderator
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handlePromoteToModerator(roomUser.id)}>
                            Make Moderator
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Room Settings Dialog */}
      <Dialog open={showRoomSettings} onOpenChange={setShowRoomSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Settings</DialogTitle>
            <DialogDescription>Configure permissions and settings for this room.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow Guests to Add to Queue</h4>
                <p className="text-sm text-muted-foreground">Let all users add tracks to the queue</p>
              </div>
              <input
                type="checkbox"
                checked={room.settings?.allowGuestQueue}
                onChange={(e) => handleUpdateRoomSettings({ allowGuestQueue: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow Guests to Skip Tracks</h4>
                <p className="text-sm text-muted-foreground">Let all users skip to the next track</p>
              </div>
              <input
                type="checkbox"
                checked={room.settings?.allowGuestSkip}
                onChange={(e) => handleUpdateRoomSettings({ allowGuestSkip: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Display music recommendations based on listening history
                </p>
              </div>
              <input
                type="checkbox"
                checked={room.settings?.showRecommendations}
                onChange={(e) => handleUpdateRoomSettings({ showRecommendations: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowRoomSettings(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
