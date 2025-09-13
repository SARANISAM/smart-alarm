"use client"

import { useState, useEffect } from "react"
import type { Alarm } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { YouTubePlayer } from "@/components/youtube-player"
import { AlarmClock, Store as Snooze, X } from "lucide-react"

interface AlarmPopupProps {
  alarm: Alarm
  onStop: () => void
  onSnooze: () => void
}

export function AlarmPopup({ alarm, onStop, onSnooze }: AlarmPopupProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    // Request notification permission and show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Alarm: ${alarm.label}`, {
        body: `Time: ${alarm.time}`,
        icon: "/favicon.ico",
        tag: alarm.id,
        requireInteraction: true,
      })
    }

    // Track elapsed time
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    // Auto-dismiss after 10 minutes if no interaction
    const autoDismiss = setTimeout(
      () => {
        onStop()
      },
      10 * 60 * 1000,
    )

    return () => {
      clearInterval(timer)
      clearTimeout(autoDismiss)
    }
  }, [alarm, onStop])

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStop = () => {
    setIsVisible(false)
    setTimeout(onStop, 300) // Allow fade out animation
  }

  const handleSnooze = () => {
    setIsVisible(false)
    setTimeout(onSnooze, 300) // Allow fade out animation
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-accent/20 rounded-full">
              <AlarmClock className="h-8 w-8 text-accent animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{alarm.label}</CardTitle>
          <div className="space-y-1">
            <p className="text-lg font-mono">{alarm.time}</p>
            <p className="text-sm text-muted-foreground">Ringing for {formatElapsedTime(timeElapsed)}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* YouTube Player */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Now Playing:</p>
            <p className="text-xs text-muted-foreground text-center line-clamp-2">{alarm.ringtone.title}</p>
            <YouTubePlayer videoId={alarm.ringtone.videoId} autoplay={true} className="w-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleStop} variant="destructive" className="flex-1 gap-2" size="lg">
              <X className="h-4 w-4" />
              Stop
            </Button>
            <Button onClick={handleSnooze} variant="outline" className="flex-1 gap-2 bg-transparent" size="lg">
              <Snooze className="h-4 w-4" />
              Snooze ({alarm.snoozeMinutes}m)
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Press Escape to stop • Space to snooze</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Keyboard shortcuts hook
export function useAlarmKeyboardShortcuts(onStop: () => void, onSnooze: () => void) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onStop()
      } else if (event.key === " " || event.code === "Space") {
        event.preventDefault()
        onSnooze()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [onStop, onSnooze])
}
