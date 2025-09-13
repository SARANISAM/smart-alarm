"use client"

import { useState, useEffect } from "react"
import type { Alarm } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Loader2 } from "lucide-react"
import { searchYouTubeVideos, type YouTubeVideo, getYouTubeThumbnail } from "@/lib/youtube-api"

interface AlarmModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (alarm: Alarm) => void
  editingAlarm?: Alarm | null
}

export function AlarmModal({ isOpen, onClose, onSave, editingAlarm }: AlarmModalProps) {
  const [label, setLabel] = useState("")
  const [time, setTime] = useState("07:00")
  const [is24Hour, setIs24Hour] = useState(false)
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM")
  const [repeat, setRepeat] = useState<string[]>([])
  const [snoozeMinutes, setSnoozeMinutes] = useState(10)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  useEffect(() => {
    if (editingAlarm) {
      setLabel(editingAlarm.label)
      setTime(editingAlarm.time)
      setIs24Hour(editingAlarm.is24Hour)
      setAmPm(editingAlarm.amPm || "AM")
      setRepeat(editingAlarm.repeat)
      setSnoozeMinutes(editingAlarm.snoozeMinutes)
      setSelectedVideo({
        id: editingAlarm.ringtone.videoId,
        title: editingAlarm.ringtone.title,
        thumbnail: getYouTubeThumbnail(editingAlarm.ringtone.videoId),
      })
    } else {
      // Reset form
      setLabel("")
      setTime("07:00")
      setIs24Hour(false)
      setAmPm("AM")
      setRepeat([])
      setSnoozeMinutes(10)
      setSelectedVideo(null)
      setSearchResults([])
      setSearchError(null)
    }
  }, [editingAlarm, isOpen])

  useEffect(() => {
    if (label.trim() && label.length > 2) {
      const timeoutId = setTimeout(() => {
        performYouTubeSearch(label)
      }, 1000)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
      setSelectedVideo(null)
    }
  }, [label])

  const performYouTubeSearch = async (query: string) => {
    setIsSearching(true)
    setSearchError(null)

    try {
      const result = await searchYouTubeVideos(query)

      if (result.error) {
        setSearchError(result.error)
        setSearchResults([])
      } else {
        setSearchResults(result.videos)
        // Auto-select first video if none selected
        if (!selectedVideo && result.videos.length > 0) {
          setSelectedVideo(result.videos[0])
        }
      }
    } catch (error) {
      setSearchError("Failed to search for songs")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const toggleRepeatDay = (day: string) => {
    setRepeat((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSave = () => {
    if (!label.trim()) {
      alert("Label is required!")
      return
    }

    if (!selectedVideo) {
      alert("Please select a ringtone!")
      return
    }

    const alarm: Alarm = {
      id: editingAlarm?.id || `alarm-${Date.now()}`,
      label: label.trim(),
      time,
      is24Hour,
      amPm: is24Hour ? undefined : amPm,
      repeat,
      ringtone: {
        type: "youtube",
        videoId: selectedVideo.id,
        title: selectedVideo.title,
      },
      enabled: true,
      snoozeMinutes,
    }

    onSave(alarm)
    onClose()
  }

  const previewVideo = (video: YouTubeVideo) => {
    // Open YouTube video in new tab for preview
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAlarm ? "Edit Alarm" : "Add New Alarm"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="label">Alarm Label *</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Wake Up, Workout, Study Time, Meditation"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              The label helps find the perfect song for your alarm (supports Indian and English content)
            </p>
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label>Alarm Time</Label>
            <div className="flex items-center gap-4">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-auto" />
              {!is24Hour && (
                <Select value={amPm} onValueChange={(value: "AM" | "PM") => setAmPm(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center gap-2">
                <Switch checked={is24Hour} onCheckedChange={setIs24Hour} />
                <Label className="text-sm">24-hour format</Label>
              </div>
            </div>
          </div>

          {/* Repeat Days */}
          <div className="space-y-2">
            <Label>Repeat Days</Label>
            <div className="flex gap-2 flex-wrap">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={repeat.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleRepeatDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
            {repeat.length === 0 && <p className="text-sm text-muted-foreground">One-time alarm</p>}
          </div>

          {/* Snooze Duration */}
          <div className="space-y-2">
            <Label htmlFor="snooze">Snooze Duration</Label>
            <Select value={snoozeMinutes.toString()} onValueChange={(value) => setSnoozeMinutes(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* YouTube Song Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label>Ringtone Selection</Label>
              {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            {/* Search Status */}
            {label.trim() && label.length <= 2 && (
              <p className="text-sm text-muted-foreground">Enter at least 3 characters to search for songs</p>
            )}

            {searchError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md space-y-2">
                <p className="text-sm text-destructive font-medium">YouTube API Error:</p>
                <p className="text-sm text-destructive">{searchError}</p>
                {searchError.includes("not configured") && (
                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded border">
                    <p className="font-medium mb-1">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Get a YouTube Data API v3 key from Google Cloud Console</li>
                      <li>Add YOUTUBE_API_KEY to your environment variables in Vercel</li>
                      <li>Restart your development server</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Choose a song for "{label}":</p>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {searchResults.map((video) => (
                    <Card
                      key={video.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedVideo?.id === video.id ? "ring-2 ring-accent bg-accent/5" : ""
                      }`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.thumbnail || "/placeholder.svg"}
                            alt={video.title}
                            className="w-16 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=48&width=64&text=Video"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              previewVideo(video)
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {label.trim() && label.length > 2 && searchResults.length === 0 && !isSearching && !searchError && (
              <p className="text-sm text-muted-foreground">
                No songs found for this label. Try a different search term.
              </p>
            )}

            {/* Selected Video Preview */}
            {selectedVideo && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-md">
                <p className="text-sm font-medium text-accent mb-1">Selected Ringtone:</p>
                <p className="text-sm">{selectedVideo.title}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedVideo}>
              {editingAlarm ? "Update Alarm" : "Create Alarm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
