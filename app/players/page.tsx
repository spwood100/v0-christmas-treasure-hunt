"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Users, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Player, Team } from "@/lib/types"

export default function PlayersPage() {
  const [playerName, setPlayerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
    loadTeams()
  }, [])

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*").order("created_at", { ascending: true })
    if (data) setPlayers(data)
  }

  async function loadTeams() {
    const { data } = await supabase.from("teams").select("*").order("name", { ascending: true })
    if (data) setTeams(data)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!playerName.trim()) return

    setLoading(true)

    try {
      // Insert player
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({ name: playerName.trim() })
        .select()
        .single()

      if (playerError) throw playerError

      setPlayerName("")
      await loadPlayers()
      alert(`Welcome ${player.name}! Wait for the organizer to assign teams.`)
    } catch (error) {
      alert("Failed to sign up. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <FestiveHeader title="Player Sign-Up" subtitle="Sign up and get randomly assigned to a team" />

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join the Quiz
              </CardTitle>
              <CardDescription>Enter your name to sign up</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="flex gap-2">
                <Input
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  disabled={loading}
                  className="bg-background"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Signed Up Players ({players.length})</CardTitle>
              <CardDescription>Waiting for team assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No players yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {players.map((player) => (
                    <div key={player.id} className="bg-background rounded-lg p-3 text-sm font-medium text-center">
                      {player.name}
                      {player.team_id && <div className="text-xs text-muted-foreground mt-1">Assigned</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
