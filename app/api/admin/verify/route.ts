import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Get admin password from environment variable
    // Set this in your Vercel project settings or .env.local
    const adminPassword = process.env.ADMIN_PASSWORD || "christmas2024"

    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 })
  }
}
