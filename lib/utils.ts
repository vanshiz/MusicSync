import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}

export async function getYouTubeVideoDetails(videoId) {
  // In a real app, you would use the YouTube API to fetch video details
  // For demo purposes, we'll return mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock video titles based on video ID
  const mockTitles = {
    dQw4w9WgXcQ: {
      title: "Rick Astley - Never Gonna Give You Up",
      channelTitle: "Rick Astley",
    },
    JGwWNGJdvx8: {
      title: "Ed Sheeran - Shape of You",
      channelTitle: "Ed Sheeran",
    },
    kJQP7kiw5Fk: {
      title: "Luis Fonsi - Despacito ft. Daddy Yankee",
      channelTitle: "Luis Fonsi",
    },
    RgKAFK5djSk: {
      title: "Wiz Khalifa - See You Again ft. Charlie Puth",
      channelTitle: "Wiz Khalifa",
    },
    fKopy74weus: {
      title: "Imagine Dragons - Thunder",
      channelTitle: "Imagine Dragons",
    },
    JRfuAukYTKg: {
      title: "Imagine Dragons - Believer",
      channelTitle: "Imagine Dragons",
    },
  }

  // Return mock data or a default if the video ID is not in our mock database
  return (
    mockTitles[videoId] || {
      title: `YouTube Video (${videoId})`,
      channelTitle: "Unknown Artist",
    }
  )
}
