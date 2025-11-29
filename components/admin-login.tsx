"use client"

import type React from "react"
import { useState } from "react"
import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle } from "lucide-react"

interface AdminLoginProps {
  onSuccess: () => void
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // Store in session storage so it persists during the session
        sessionStorage.setItem("admin_authenticated", "true")
        onSuccess()
      } else {
        setError("Incorrect password. Please try again.")
      }
    } catch {
      setError("Failed to verify password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <FestiveHeader title="Admin Access" subtitle="Enter password to continue" />

        <Card className="max-w-md mx-auto bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-serif">Protected Area</CardTitle>
            <CardDescription>
              This area is password protected. Enter the admin password to manage questions and teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
                  autoFocus
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-primary" disabled={loading}>
                {loading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
