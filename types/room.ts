import type { User } from "./user"

export interface Track {
  id: string
  youtubeId: string
  title: string
  addedBy: string
  addedAt: string
}

export interface Message {
  id: string
  userId: string
  username: string
  content: string
  timestamp: string
}

export interface Room {
  id: string
  name: string
  description: string
  fandom: string
  isPrivate: boolean
  maxUsers: string
  createdBy: string
  createdAt: string
  users: User[]
  queue: Track[]
  currentTrack: Track | null
}
