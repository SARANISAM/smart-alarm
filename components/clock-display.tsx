"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function ClockDisplay() {
  const [time, setTime] = useState(new Date())
  const [is24Hour, setIs24Hour] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    if (is24Hour) {
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } else {
      return date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="text-center mb-12">
      <div className="bg-card rounded-lg p-8 shadow-sm border">
        <div className="text-6xl md:text-8xl font-mono font-bold text-primary mb-4">{formatTime(time)}</div>
        <div className="text-lg text-muted-foreground mb-4">{formatDate(time)}</div>
        <Button variant="outline" onClick={() => setIs24Hour(!is24Hour)} className="text-sm">
          {is24Hour ? "12-Hour" : "24-Hour"} Format
        </Button>
      </div>
    </div>
  )
}
