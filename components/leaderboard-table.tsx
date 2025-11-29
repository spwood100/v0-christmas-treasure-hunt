"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Clock, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { LeaderboardEntry } from "@/lib/types"

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name, total_score, completed_at")
        .order("total_score", { ascending: false })
        .order("completed_at", { ascending: true })

      if (teams) {
        const entriesWithProgress = await Promise.all(
          teams.map(async (team) => {
            const { count } = await supabase
              .from("team_progress")
              .select("*", { count: "exact", head: true })
              .eq("team_id", team.id)

            return {
              ...team,
              questions_answered: count || 0,
            }
          }),
        )
        setEntries(entriesWithProgress)
      }
      setLoading(false)
    }

    fetchLeaderboard()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, fetchLeaderboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_progress" }, fetchLeaderboard)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "In Progress"
    return new Date(timestamp).toLocaleTimeString()
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No teams have started yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  index === 0 ? "bg-accent/10 border border-accent/30" : "bg-muted"
                }`}
              >
                <div className="w-10 flex justify-center">{getRankIcon(index)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{entry.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {entry.questions_answered} answered
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.completed_at)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={entry.completed_at ? "default" : "secondary"}
                  className={entry.completed_at ? "bg-primary" : "bg-secondary"}
                >
                  {entry.total_score} pts
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
