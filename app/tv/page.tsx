"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy, Star, Users } from "lucide-react"
import type { TeamWithPlayers, Player } from "@/lib/types"

export default function TVLeaderboardPage() {
  const [teams, setTeams] = useState<TeamWithPlayers[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadLeaderboard()

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadLeaderboard() {
    // Get teams with their scores
    const { data: teamsData } = await supabase.from("teams").select("*").order("total_score", { ascending: false })

    if (!teamsData) return

    // Get all players
    const { data: playersData } = await supabase.from("players").select("*")

    // Map players to teams
    const teamsWithPlayers: TeamWithPlayers[] = teamsData.map((team) => ({
      ...team,
      players: (playersData || []).filter((p: Player) => p.team_id === team.id).map((p: Player) => p.name),
    }))

    setTeams(teamsWithPlayers)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-red-950 p-8">
      {/* Animated snowflakes background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white opacity-70 animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 10 + 10}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-7xl font-bold text-gold mb-4 drop-shadow-lg">🎄 Christmas Quiz 🎄</h1>
          <p className="text-3xl text-white/90 font-medium">Live Leaderboard</p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          {teams.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="h-24 w-24 mx-auto text-gold/50 mb-4" />
              <p className="text-2xl text-white/70">No teams yet. Start the quiz!</p>
            </div>
          ) : (
            teams.map((team, index) => (
              <div
                key={team.id}
                className={`
                  bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 
                  ${index === 0 ? "border-yellow-400 shadow-2xl shadow-yellow-400/20" : "border-white/20"}
                  transition-all duration-500
                `}
              >
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-20">
                    {index === 0 ? (
                      <Trophy className="h-16 w-16 text-yellow-400" />
                    ) : index === 1 ? (
                      <Star className="h-14 w-14 text-gray-300" />
                    ) : index === 2 ? (
                      <Star className="h-12 w-12 text-amber-600" />
                    ) : (
                      <div className="text-5xl font-bold text-white/70">#{index + 1}</div>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white mb-2">{team.name}</h2>
                    {team.players.length > 0 && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Users className="h-5 w-5" />
                        <span className="text-lg">{team.players.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-6xl font-bold text-gold">{team.total_score}</div>
                    <div className="text-xl text-white/70">points</div>
                    {team.completed_at && <div className="text-sm text-green-400 mt-2">✓ Completed</div>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/50 text-xl">Auto-refreshes every 5 seconds</div>
      </div>
    </div>
  )
}
