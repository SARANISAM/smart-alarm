"use client"

import { useState, useEffect } from "react"
import { ClockDisplay } from "@/components/clock-display"
import { AlarmManager } from "@/components/alarm-manager"
import { AlarmModal } from "@/components/alarm-modal"
import { NotificationHandler } from "@/components/notification-handler"
import { AlarmPopup, useAlarmKeyboardShortcuts } from "@/components/alarm-popup"
import { Button } from "@/components/ui/button"
import { Plus, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export interface Alarm {
  id: string
  label: string
  time: string
  is24Hour: boolean
  amPm?: "AM" | "PM"
  repeat: string[]
  ringtone: {
    type: "youtube"
    videoId: string
    title: string
  }
  enabled: boolean
  snoozeMinutes: number
}

export default function AlarmClockApp() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null)
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null)
  const { theme, setTheme } = useTheme()

  // Load alarms from localStorage on mount
  useEffect(() => {
    const savedAlarms = localStorage.getItem("smart-alarms")
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms))
    }

    // Request notification permission on app load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Save alarms to localStorage whenever alarms change
  useEffect(() => {
    localStorage.setItem("smart-alarms", JSON.stringify(alarms))
  }, [alarms])

  const addAlarm = (alarm: Alarm) => {
    setAlarms((prev) => [...prev, alarm])
  }

  const updateAlarm = (updatedAlarm: Alarm) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === updatedAlarm.id ? updatedAlarm : alarm)))
  }

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id))
  }

  const toggleAlarm = (id: string) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)))
  }

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAlarm(null)
  }

  const handleAlarmTrigger = (alarm: Alarm) => {
    setActiveAlarm(alarm)
  }

  const handleStopAlarm = () => {
    setActiveAlarm(null)
  }

  const handleSnoozeAlarm = () => {
    if (activeAlarm) {
      // Create a new alarm for snooze time
      const now = new Date()
      now.setMinutes(now.getMinutes() + activeAlarm.snoozeMinutes)
      const snoozeTime = now.toTimeString().slice(0, 5)

      const snoozeAlarm: Alarm = {
        ...activeAlarm,
        id: `${activeAlarm.id}-snooze-${Date.now()}`,
        time: snoozeTime,
        repeat: [], // One-time snooze alarm
        label: `${activeAlarm.label} (Snoozed)`,
      }

      addAlarm(snoozeAlarm)
      setActiveAlarm(null)
    }
  }

  useAlarmKeyboardShortcuts(handleStopAlarm, handleSnoozeAlarm)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Smart Alarm Clock</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Alarm
            </Button>
          </div>
        </div>

        {/* Clock Display */}
        <ClockDisplay />

        {/* Alarm List */}
        <AlarmManager
          alarms={alarms}
          onToggleAlarm={toggleAlarm}
          onEditAlarm={handleEditAlarm}
          onDeleteAlarm={deleteAlarm}
        />

        {/* Add/Edit Alarm Modal */}
        <AlarmModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={editingAlarm ? updateAlarm : addAlarm}
          editingAlarm={editingAlarm}
        />

        {/* Notification Handler */}
        <NotificationHandler alarms={alarms} onAlarmTrigger={handleAlarmTrigger} />

        {activeAlarm && <AlarmPopup alarm={activeAlarm} onStop={handleStopAlarm} onSnooze={handleSnoozeAlarm} />}
      </div>
    </div>
  )
}
