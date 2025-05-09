import { io } from "socket.io-client"

let socket = null
let isConnecting = false
let connectionAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 3

// Create a mock socket for fallback when real socket connection fails
const createMockSocket = () => {
  console.log("Using mock socket (offline mode)")

  // Create an event emitter to simulate socket behavior locally
  const events = {}
  const mockSocket = {
    id: `mock-${Math.random().toString(36).substring(2, 9)}`,
    connected: true,
    disconnected: false,

    on: (event, callback) => {
      if (!events[event]) {
        events[event] = []
      }
      events[event].push(callback)
      return mockSocket
    },

    off: (event, callback) => {
      if (events[event]) {
        events[event] = events[event].filter((cb) => cb !== callback)
      }
      return mockSocket
    },

    emit: (event, data) => {
      console.log(`Mock socket emitting: ${event}`, data)

      // For local-only events, we can trigger them immediately
      if (event === "join-room") {
        setTimeout(() => {
          if (events["connect"]) {
            events["connect"].forEach((cb) => cb())
          }
        }, 100)
      }

      // For send-message, we can simulate receiving the message locally
      if (event === "send-message" && data.message) {
        // Simulate a slight delay
        setTimeout(() => {
          if (events["receive-message"]) {
            events["receive-message"].forEach((cb) => cb(data.message))
          }
        }, 300)
      }

      return mockSocket
    },

    disconnect: () => {
      console.log("Mock socket disconnected")
      mockSocket.connected = false
      mockSocket.disconnected = true
    },
  }

  return mockSocket
}

export const initializeSocket = () => {
  // If already connecting, don't try again
  if (isConnecting) return socket || createMockSocket()

  // If already connected, return existing socket
  if (socket && socket.connected) return socket

  isConnecting = true
  connectionAttempts++

  try {
    // Determine the socket URL based on environment
    let socketUrl

    // Check if we're in a preview/production environment
    if (typeof window !== "undefined") {
      // In both development and production, use the relative path
      socketUrl = "/api/socket"

      // For local development with a separate socket server, uncomment this:
      // if (window.location.hostname === "localhost") {
      //   socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
      // }
    } else {
      // Fallback for server-side
      socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    }

    console.log(`Attempting to connect to socket server at: ${socketUrl}`)

    // Initialize socket with better error handling and reconnection
    socket = io(socketUrl, {
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
      path: "/api/socket", // Make sure path is set correctly
      transports: ["websocket", "polling"],
      forceNew: connectionAttempts > 1, // Force new connection on retry
    })

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id)
      isConnecting = false
      connectionAttempts = 0
    })

    socket.on("disconnect", (reason) => {
      console.log(`Disconnected from socket server: ${reason}`)
      isConnecting = false
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
      isConnecting = false

      // If we've tried too many times, fall back to mock socket
      if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Using offline mode.`)
        socket = createMockSocket()
      }
    })

    return socket
  } catch (error) {
    console.error("Error initializing socket:", error)
    isConnecting = false
    return createMockSocket()
  }
}

// Create a local room state cache to use when offline
const localRoomCache = {}

export const joinRoom = (roomId, userId, username) => {
  const currentSocket = initializeSocket()

  console.log(`User ${username} (${userId}) joining room ${roomId}`)
  currentSocket.emit("join-room", { roomId, userId, username })

  // Store in local cache for offline mode
  if (!localRoomCache[roomId]) {
    localRoomCache[roomId] = {
      users: [],
      messages: [],
      currentTrack: null,
    }
  }

  // Add user to local cache if not already there
  if (!localRoomCache[roomId].users.some((u) => u.id === userId)) {
    localRoomCache[roomId].users.push({ id: userId, username })
  }

  // Return the user joined event for the component to listen to
  return {
    onUserJoined: (callback) => {
      currentSocket.on("user-joined", callback)
      return () => currentSocket.off("user-joined", callback)
    },
    onUserLeft: (callback) => {
      currentSocket.on("user-left", callback)
      return () => currentSocket.off("user-left", callback)
    },
  }
}

export const leaveRoom = (roomId, userId) => {
  const currentSocket = socket || createMockSocket()

  console.log(`Leaving room ${roomId}`)
  currentSocket.emit("leave-room", { roomId, userId })

  // Update local cache
  if (localRoomCache[roomId]) {
    localRoomCache[roomId].users = localRoomCache[roomId].users.filter((u) => u.id !== userId)
  }
}

export const sendMessage = (roomId, message) => {
  const currentSocket = socket || createMockSocket()
  currentSocket.emit("send-message", { roomId, message })

  // Store in local cache for offline mode
  if (localRoomCache[roomId]) {
    localRoomCache[roomId].messages.push(message)
  }
}

export const listenForMessages = (callback) => {
  const currentSocket = socket || createMockSocket()
  currentSocket.on("receive-message", callback)
  return () => currentSocket.off("receive-message", callback)
}

export const playTrack = (roomId, track) => {
  const currentSocket = socket || createMockSocket()
  console.log(`Emitting play-track for room ${roomId}`)
  currentSocket.emit("play-track", { roomId, track })

  // Update local cache
  if (localRoomCache[roomId]) {
    localRoomCache[roomId].currentTrack = track
  }
}

export const pauseTrack = (roomId) => {
  const currentSocket = socket || createMockSocket()
  console.log(`Emitting pause-track for room ${roomId}`)
  currentSocket.emit("pause-track", { roomId })
}

export const resumeTrack = (roomId) => {
  const currentSocket = socket || createMockSocket()
  console.log(`Emitting resume-track for room ${roomId}`)
  currentSocket.emit("resume-track", { roomId })
}

export const seekTrack = (roomId, time) => {
  const currentSocket = socket || createMockSocket()
  console.log(`Emitting seek-track for room ${roomId} to time ${time}`)
  currentSocket.emit("seek-track", { roomId, time })
}

export const addToQueue = (roomId, track) => {
  const currentSocket = socket || createMockSocket()
  currentSocket.emit("add-to-queue", { roomId, track })
}

export const removeFromQueue = (roomId, trackId) => {
  const currentSocket = socket || createMockSocket()
  currentSocket.emit("remove-from-queue", { roomId, trackId })
}

export const listenForMusicEvents = (callbacks) => {
  const currentSocket = socket || createMockSocket()

  if (callbacks.onTrackChanged) {
    currentSocket.on("track-changed", callbacks.onTrackChanged)
  }

  if (callbacks.onTrackPaused) {
    currentSocket.on("track-paused", callbacks.onTrackPaused)
  }

  if (callbacks.onTrackResumed) {
    currentSocket.on("track-resumed", callbacks.onTrackResumed)
  }

  if (callbacks.onTrackSeeked) {
    currentSocket.on("track-seeked", callbacks.onTrackSeeked)
  }

  if (callbacks.onQueueUpdated) {
    currentSocket.on("queue-updated", callbacks.onQueueUpdated)
  }

  return () => {
    if (callbacks.onTrackChanged) {
      currentSocket.off("track-changed", callbacks.onTrackChanged)
    }

    if (callbacks.onTrackPaused) {
      currentSocket.off("track-paused", callbacks.onTrackPaused)
    }

    if (callbacks.onTrackResumed) {
      currentSocket.off("track-resumed", callbacks.onTrackResumed)
    }

    if (callbacks.onTrackSeeked) {
      currentSocket.off("track-seeked", callbacks.onTrackSeeked)
    }

    if (callbacks.onQueueUpdated) {
      currentSocket.off("queue-updated", callbacks.onQueueUpdated)
    }
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Check connection status
export const isSocketConnected = () => {
  return socket && socket.connected
}

// Get connection status for UI
export const getConnectionStatus = () => {
  if (!socket) return "disconnected"
  if (socket.connected) return "connected"
  if (isConnecting) return "connecting"
  return "disconnected"
}
