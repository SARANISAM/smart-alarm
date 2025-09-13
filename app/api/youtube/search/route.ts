import { type NextRequest, NextResponse } from "next/server"

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration?: string
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[]
  error?: string
}

function enhanceSearchQuery(query: string): string {
  const labelKeywords = query.toLowerCase()

  // Add contextual keywords based on alarm labels
  if (labelKeywords.includes("workout") || labelKeywords.includes("gym") || labelKeywords.includes("exercise")) {
    return `${query} workout motivation music energetic songs`
  } else if (labelKeywords.includes("study") || labelKeywords.includes("focus") || labelKeywords.includes("work")) {
    return `${query} focus study music concentration instrumental`
  } else if (
    labelKeywords.includes("meditation") ||
    labelKeywords.includes("relax") ||
    labelKeywords.includes("calm")
  ) {
    return `${query} meditation relaxing music peaceful instrumental`
  } else if (labelKeywords.includes("morning") || labelKeywords.includes("wake") || labelKeywords.includes("alarm")) {
    return `${query} morning wake up music energetic songs`
  } else if (
    labelKeywords.includes("birthday") ||
    labelKeywords.includes("celebration") ||
    labelKeywords.includes("party")
  ) {
    return `${query} birthday celebration party songs happy music`
  } else if (
    labelKeywords.includes("bollywood") ||
    labelKeywords.includes("hindi") ||
    labelKeywords.includes("indian")
  ) {
    return `${query} bollywood hindi indian songs music`
  } else if (labelKeywords.includes("english") || labelKeywords.includes("pop") || labelKeywords.includes("western")) {
    return `${query} english pop songs western music`
  } else {
    return `${query} music songs`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ videos: [], error: "Query parameter is required" }, { status: 400 })
    }

    const API_KEY = process.env.YOUTUBE_API_KEY

    if (!API_KEY) {
      console.error("[v0] YouTube API key not configured on server")
      return NextResponse.json({
        videos: [],
        error: "YouTube API key not configured. Please add YOUTUBE_API_KEY to your environment variables.",
      })
    }

    // Enhanced search query for better results based on alarm labels
    const enhancedQuery = enhanceSearchQuery(query)
    console.log("[v0] Searching YouTube for:", enhancedQuery)

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(enhancedQuery)}&maxResults=10&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] YouTube API Response Error:", response.status, errorText)

      if (response.status === 400) {
        return NextResponse.json({
          videos: [],
          error: `Invalid API request. Please check your API key and ensure YouTube Data API v3 is enabled.`,
        })
      } else if (response.status === 403) {
        return NextResponse.json({
          videos: [],
          error: `API quota exceeded or access forbidden. Check your API key permissions.`,
        })
      } else {
        return NextResponse.json({
          videos: [],
          error: `YouTube API error: ${response.status}`,
        })
      }
    }

    const data = await response.json()

    if (data.error) {
      console.error("[v0] YouTube API Data Error:", data.error)
      return NextResponse.json({
        videos: [],
        error: data.error.message || "YouTube API returned an error",
      })
    }

    if (!data.items || data.items.length === 0) {
      console.log("[v0] No videos found for query:", enhancedQuery)
      return NextResponse.json({
        videos: [],
        error: "No videos found for this search. Try a different label.",
      })
    }

    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: item.snippet.duration,
    }))

    console.log("[v0] Found", videos.length, "videos")
    return NextResponse.json({ videos })
  } catch (error) {
    console.error("[v0] YouTube API Error:", error)
    return NextResponse.json({
      videos: [],
      error: `Failed to search YouTube videos: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
