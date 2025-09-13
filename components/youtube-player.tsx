"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Pause, Play } from "lucide-react"

interface YouTubePlayerProps {
  videoId: string
  autoplay?: boolean
  onReady?: () => void
  onEnd?: () => void
  className?: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YouTubePlayer({ videoId, autoplay = false, onReady, onEnd, className = "" }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializePlayer
    } else {
      initializePlayer()
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy()
      }
    }
  }, [videoId])

  const initializePlayer = () => {
    if (!playerRef.current || !window.YT) return

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      height: "200",
      width: "100%",
      videoId: videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event: any) => {
          setIsReady(true)
          if (autoplay) {
            event.target.playVideo()
            setIsPlaying(true)
          }
          onReady?.()
        },
        onStateChange: (event: any) => {
          const state = event.data
          setIsPlaying(state === window.YT.PlayerState.PLAYING)

          if (state === window.YT.PlayerState.ENDED) {
            onEnd?.()
          }
        },
      },
    })
  }

  const togglePlayPause = () => {
    if (!playerInstanceRef.current || !isReady) return

    if (isPlaying) {
      playerInstanceRef.current.pauseVideo()
    } else {
      playerInstanceRef.current.playVideo()
    }
  }

  const toggleMute = () => {
    if (!playerInstanceRef.current || !isReady) return

    if (isMuted) {
      playerInstanceRef.current.unMute()
      setIsMuted(false)
    } else {
      playerInstanceRef.current.mute()
      setIsMuted(true)
    }
  }

  const stopVideo = () => {
    if (!playerInstanceRef.current || !isReady) return
    playerInstanceRef.current.stopVideo()
    setIsPlaying(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <div ref={playerRef} className="w-full" />
      </div>

      {isReady && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button variant="outline" onClick={stopVideo}>
            Stop
          </Button>
        </div>
      )}
    </div>
  )
}
