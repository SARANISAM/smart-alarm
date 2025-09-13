# ⏰ Smart Label-Based Alarm Clock

A smart alarm system that automatically selects ringtones based on **user-defined labels** like *Wake Up*, *Workout*, *Meditation*, *Study*, etc.  
It integrates with **YouTube API** (or similar music APIs) to fetch and play songs/sounds that match the chosen label, making alarms more personalized and engaging.

---

## 🌐 Live Demo

Try it out here:  
[Smart Alarm Clock](https://v0-smart-alarm-clock.vercel.app/)

---

## 📌 Features

- 🎵 **Label-Based Ringtones** — Each alarm is linked to a label (e.g., *Workout*) and fetches suitable music  
- 🕒 **Smart Scheduling** — Set alarms in 24-hour format  
- 🌐 **API-Driven Sounds** — Uses YouTube (or another music API) to play matching audio for the label  
- ✅ **Simple UI** — Easy to add, view, and manage alarms  

---

## 🛠️ Tech Stack

- **Frontend:** React / JavaScript (hosted on **Vercel**)  
- **APIs:** YouTube Data API v3 (for fetching music/videos based on labels)  

---

## ⚙️ API Usage

The app integrates with **YouTube API** to fetch alarm sounds dynamically:  

1. **Search Request**  
   When a user sets an alarm with a label (e.g., `Workout`), the app sends a query
2. **Get Video ID**  
The API returns a list of YouTube videos. The app selects one (random or top result) using its `videoId`.
3. **Play Video**  
The selected video is then played.


4. **Play Video**  
The selected `videoId` is embedded in an `<iframe>` or played using the **YouTube Player API** at alarm time:
