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

// Secure YouTube search using server-side API route
export async function searchYouTubeVideos(query: string): Promise<YouTubeSearchResponse> {
  try {
    console.log("[v0] Searching YouTube via secure API for:", query)

    const response = await fetch("/api/youtube/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("[v0] YouTube Search Error:", error)
    return {
      videos: [],
      error: `Failed to search YouTube videos: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Get video embed URL for YouTube IFrame Player
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`
}

// Get video thumbnail URL
export function getYouTubeThumbnail(videoId: string, quality: "default" | "medium" | "high" = "medium"): string {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}
