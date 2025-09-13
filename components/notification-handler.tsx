"use client"

import { useEffect, useRef } from "react"
import type { Alarm } from "@/app/page"

interface NotificationHandlerProps {
  alarms: Alarm[]
  onAlarmTrigger: (alarm: Alarm) => void
}

export function NotificationHandler({ alarms, onAlarmTrigger }: NotificationHandlerProps) {
  const checkInterval = useRef<NodeJS.Timeout>()
  const triggeredAlarms = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // Check alarms every second
    checkInterval.current = setInterval(() => {
      checkAlarms()
    }, 1000)

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current)
      }
    }
  }, [alarms])

  const checkAlarms = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const currentDay = now.toLocaleDateString("en-US", { weekday: "short" })
    const currentMinute = `${currentTime}-${now.getDate()}` // Include date to prevent multiple triggers

    alarms.forEach((alarm) => {
      if (!alarm.enabled) return

      const alarmTime = alarm.time
      const shouldTrigger = currentTime === alarmTime
      const alarmKey = `${alarm.id}-${currentMinute}`

      if (shouldTrigger && !triggeredAlarms.current.has(alarmKey)) {
        // Check if alarm should repeat today
        const shouldRepeatToday = alarm.repeat.length === 0 || alarm.repeat.includes(currentDay)

        if (shouldRepeatToday) {
          triggeredAlarms.current.add(alarmKey)
          triggerAlarm(alarm)

          // Clean up old triggered alarms (keep only last 100)
          if (triggeredAlarms.current.size > 100) {
            const oldEntries = Array.from(triggeredAlarms.current).slice(0, 50)
            oldEntries.forEach((entry) => triggeredAlarms.current.delete(entry))
          }
        }
      }
    })
  }

  const triggerAlarm = (alarm: Alarm) => {
    console.log("[v0] Alarm triggered:", alarm.label, "at", alarm.time)

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(`🔔 ${alarm.label}`, {
          body: `Time: ${alarm.time}\nSong: ${alarm.ringtone.title}`,
          icon: "/favicon.ico",
          tag: alarm.id,
          requireInteraction: true,
          silent: false,
        })

        // Auto-close notification after 30 seconds
        setTimeout(() => {
          notification.close()
        }, 30000)
      } catch (error) {
        console.error("[v0] Notification error:", error)
      }
    }

    // Trigger alarm in the app
    onAlarmTrigger(alarm)

    try {
      // Try to play a notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("[v0] Audio notification failed, using fallback")
      // Fallback to simple beep
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      audio.play().catch(() => {
        console.log("[v0] All audio playback failed - browser restrictions")
      })
    }
  }

  return null // This component doesn't render anything
}
