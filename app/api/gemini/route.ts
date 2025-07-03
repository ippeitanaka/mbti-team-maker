import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY

    if (!apiKey) {
      console.error("Google Gemini API key is not configured")
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    try {
      // Using the free tier model "gemini-pro"
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Gemini API error:", errorData)
        return NextResponse.json(
          { error: errorData.error?.message || "Failed to generate content" },
          { status: response.status },
        )
      }

      const data = await response.json()

      // Extract the generated text from the response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

      return NextResponse.json({ text: generatedText })
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return NextResponse.json({ error: "Failed to call Gemini API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in Gemini API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
