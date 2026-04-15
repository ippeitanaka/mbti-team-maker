import { type NextRequest, NextResponse } from "next/server"

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL

    if (!apiKey) {
      console.error("Groq API key is not configured")
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an assistant that organizes students into MBTI-aware teams. Follow the requested output format exactly.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          top_p: 0.95,
          max_completion_tokens: 4096,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Groq API error:", errorData)
        return NextResponse.json(
          { error: errorData.error?.message || "Failed to generate content" },
          { status: response.status },
        )
      }

      const data = await response.json()

      const generatedText = data.choices?.[0]?.message?.content || ""

      return NextResponse.json({ text: generatedText })
    } catch (error) {
      console.error("Error calling Groq API:", error)
      return NextResponse.json({ error: "Failed to call Groq API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in AI API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
