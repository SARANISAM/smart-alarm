"use client"

import type { Alarm } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, Clock } from "lucide-react"

interface AlarmManagerProps {
  alarms: Alarm[]
  onToggleAlarm: (id: string) => void
  onEditAlarm: (alarm: Alarm) => void
  onDeleteAlarm: (id: string) => void
}

export function AlarmManager({ alarms, onToggleAlarm, onEditAlarm, onDeleteAlarm }: AlarmManagerProps) {
  const formatRepeatDays = (repeat: string[]) => {
    if (repeat.length === 0) return "Once"
    if (repeat.length === 7) return "Daily"
    return repeat.join(", ")
  }

  const getNextOccurrence = (alarm: Alarm) => {
    const now = new Date()
    const [hours, minutes] = alarm.time.split(":").map(Number)

    const nextAlarm = new Date()
    nextAlarm.setHours(hours, minutes, 0, 0)

    // If alarm time has passed today, set for tomorrow
    if (nextAlarm <= now) {
      nextAlarm.setDate(nextAlarm.getDate() + 1)
    }

    return nextAlarm.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (alarms.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No alarms set</h3>
        <p className="text-muted-foreground">Add your first alarm to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Your Alarms</h2>
      {alarms.map((alarm) => (
        <Card key={alarm.id} className={`transition-opacity ${!alarm.enabled ? "opacity-50" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-mono font-bold">{alarm.time}</span>
                  {!alarm.is24Hour && alarm.amPm && <span className="text-lg text-muted-foreground">{alarm.amPm}</span>}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{alarm.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRepeatDays(alarm.repeat)} • Next: {getNextOccurrence(alarm)}
                  </p>
                  {alarm.ringtone.title && <p className="text-sm text-accent">🎵 {alarm.ringtone.title}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={alarm.enabled} onCheckedChange={() => onToggleAlarm(alarm.id)} />
                <Button variant="ghost" size="icon" onClick={() => onEditAlarm(alarm)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDeleteAlarm(alarm.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
