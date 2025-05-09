"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react"
import {
  initializeSocket,
  playTrack,
  pauseTrack,
  resumeTrack,
  seekTrack,
  listenForMusicEvents,
} from "@/lib/socket-client"

export function MusicPlayer({ currentTrack, onEnded, canSkip = true, roomId }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [isExternalControl, setIsExternalControl] = useState(false)
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const playerReadyRef = useRef(false)
  const syncTimeoutRef = useRef(null)
  const cleanupRef = useRef(null)

  // Initialize YouTube player
  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializePlayer
    } else if (window.YT && window.YT.Player) {
      initializePlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      if (window.timeUpdateInterval) {
        clearInterval(window.timeUpdateInterval)
        window.timeUpdateInterval = null
      }
    }
  }, [currentTrack])

  // Initialize socket connection for music sync
  useEffect(() => {
    if (!roomId) return

    // Initialize socket
    initializeSocket()

    // Listen for music events
    const cleanup = listenForMusicEvents({
      onTrackChanged: (track) => {
        console.log("Received track change event:", track)
        // Handle track change from other users
        if (playerRef.current && playerReadyRef.current && track.youtubeId !== currentTrack?.youtubeId) {
          setIsExternalControl(true)
          onEnded() // This will update the current track in the parent component
        }
      },
      onTrackPaused: () => {
        console.log("Received pause event")
        if (playerRef.current && playerReadyRef.current && isPlaying) {
          setIsExternalControl(true)
          playerRef.current.pauseVideo()
        }
      },
      onTrackResumed: () => {
        console.log("Received resume event")
        if (playerRef.current && playerReadyRef.current && !isPlaying) {
          setIsExternalControl(true)
          playerRef.current.playVideo()
        }
      },
      onTrackSeeked: (time) => {
        console.log("Received seek event to time:", time)
        if (playerRef.current && playerReadyRef.current) {
          setIsExternalControl(true)
          playerRef.current.seekTo(time, true)
          setCurrentTime(time)
        }
      },
    })

    cleanupRef.current = cleanup

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [roomId, currentTrack, isPlaying, onEnded])

  const initializePlayer = () => {
    if (!currentTrack || !containerRef.current) return

    if (playerRef.current) {
      playerRef.current.destroy()
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "0",
      width: "0",
      videoId: currentTrack.youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: (e) => console.error("YouTube player error:", e),
      },
    })
  }

  const onPlayerReady = (event) => {
    playerReadyRef.current = true
    setDuration(event.target.getDuration())
    event.target.setVolume(volume)

    // Auto-play when ready
    togglePlay()

    // Notify others about this track if we're the first to play it
    if (roomId && currentTrack) {
      playTrack(roomId, currentTrack)
    }
  }

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
      startTimeUpdate() // This will now create a proper interval

      // If this wasn't triggered by an external control, notify others
      if (!isExternalControl && roomId) {
        resumeTrack(roomId)
      }
      setIsExternalControl(false)
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false)

      // If this wasn't triggered by an external control, notify others
      if (!isExternalControl && roomId) {
        pauseTrack(roomId)
      }
      setIsExternalControl(false)
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false)
      setCurrentTime(0)
      onEnded()
    }
  }

  const startTimeUpdate = () => {
    // Clear any existing interval first
    if (window.timeUpdateInterval) {
      clearInterval(window.timeUpdateInterval)
    }

    // Create a new interval that updates every 250ms for smoother time display
    window.timeUpdateInterval = setInterval(() => {
      if (playerRef.current && isPlaying && !isSeeking) {
        try {
          const currentPlayerTime = playerRef.current.getCurrentTime()
          setCurrentTime(currentPlayerTime)
        } catch (error) {
          console.error("Error updating time:", error)
        }
      }
    }, 250) // Update 4 times per second for smoother display

    // Return a cleanup function
    return () => {
      if (window.timeUpdateInterval) {
        clearInterval(window.timeUpdateInterval)
        window.timeUpdateInterval = null
      }
    }
  }

  const togglePlay = () => {
    if (!playerRef.current || !playerReadyRef.current) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
      // Notify other users handled in onPlayerStateChange
    } else {
      playerRef.current.playVideo()
      // Notify other users handled in onPlayerStateChange
    }
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)

    if (playerRef.current) {
      playerRef.current.setVolume(newVolume)
      if (newVolume === 0) {
        playerRef.current.mute()
      } else {
        playerRef.current.unMute()
      }
    }
  }

  const toggleMute = () => {
    if (!playerRef.current) return

    if (isMuted) {
      playerRef.current.unMute()
      playerRef.current.setVolume(volume || 70)
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const handleSeekStart = () => {
    setIsSeeking(true)
  }

  const handleSeek = (value) => {
    if (!playerRef.current) return

    const seekTime = value[0]
    setCurrentTime(seekTime)
  }

  const handleSeekEnd = (value) => {
    if (!playerRef.current) return

    const seekTime = value[0]
    playerRef.current.seekTo(seekTime, true)
    setCurrentTime(seekTime)
    setIsSeeking(false)

    // Notify other users
    if (roomId) {
      seekTrack(roomId, seekTime)
    }
  }

  const handleSkip = () => {
    if (!canSkip) return

    onEnded()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Sync playback with other users periodically
  useEffect(() => {
    if (!roomId || !playerRef.current || !playerReadyRef.current || !isPlaying) return

    const syncPlayback = () => {
      const currentPlayerTime = playerRef.current.getCurrentTime()

      // If the difference is more than 3 seconds, sync
      if (Math.abs(currentTime - currentPlayerTime) > 3) {
        seekTrack(roomId, currentPlayerTime)
      }

      syncTimeoutRef.current = setTimeout(syncPlayback, 30000) // Sync every 30 seconds
    }

    syncTimeoutRef.current = setTimeout(syncPlayback, 30000)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [roomId, isPlaying, currentTime])

  if (!currentTrack) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">No track playing</p>
        <p className="text-xs text-muted-foreground">Add a track to the queue to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-2">
      <div ref={containerRef} id="youtube-player" className="hidden"></div>

      <div className="space-y-1">
        {currentTrack.thumbnail && (
          <div className="mb-2 overflow-hidden rounded-md">
            <img
              src={currentTrack.thumbnail || "/placeholder.svg"}
              alt={currentTrack.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h4 className="font-medium">{currentTrack.title}</h4>
        <p className="text-xs text-muted-foreground">{currentTrack.artist}</p>
        <p className="text-xs text-muted-foreground">Added by {currentTrack.addedBy}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            onValueCommit={handleSeekEnd}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            className="flex-1"
          />
          <span className="text-xs tabular-nums">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSkip} disabled={!canSkip}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
