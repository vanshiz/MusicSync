// Type definitions for YouTube IFrame API
interface Window {
  YT: {
    Player: new (
      elementId: string | HTMLElement,
      options: {
        height?: string | number
        width?: string | number
        videoId?: string
        playerVars?: {
          autoplay?: 0 | 1
          controls?: 0 | 1
          disablekb?: 0 | 1
          fs?: 0 | 1
          modestbranding?: 0 | 1
          rel?: 0 | 1
          [key: string]: any
        }
        events?: {
          onReady?: (event: YT.PlayerEvent) => void
          onStateChange?: (event: YT.OnStateChangeEvent) => void
          onError?: (event: YT.OnErrorEvent) => void
          [key: string]: any
        }
      },
    ) => YT.Player
    PlayerState: {
      UNSTARTED: -1
      ENDED: 0
      PLAYING: 1
      PAUSED: 2
      BUFFERING: 3
      CUED: 5
    }
  }
  onYouTubeIframeAPIReady: () => void
}

declare namespace YT {
  interface Player {
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    getVideoLoadedFraction(): number
    getDuration(): number
    getCurrentTime(): number
    getPlayerState(): number
    getVolume(): number
    setVolume(volume: number): void
    mute(): void
    unMute(): void
    isMuted(): boolean
    destroy(): void
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent {
    target: Player
    data: number
  }

  interface OnErrorEvent {
    target: Player
    data: number
  }
}
