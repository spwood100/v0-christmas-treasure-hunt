"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Question, Team, Player } from "@/lib/types"
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  RefreshCw,
  FileText,
  Camera,
  Music,
  LogOut,
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
} from "lucide-react"
import Link from "next/link"
import { XmlUpload } from "@/components/xml-upload"
import { PhotoUpload } from "@/components/photo-upload"
import { AudioUpload } from "@/components/audio-upload"
import { AdminLogin } from "@/components/admin-login"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const [newQuestion, setNewQuestion] = useState({
    round_type: "text" as "text" | "photo" | "music",
    clue: "",
    answer: "",
    hint_1: "",
    hint_2: "",
    hint_3: "",
    max_points: 100,
    hint_1_penalty: 20,
    hint_2_penalty: 20,
    hint_3_penalty: 20,
    image_url: "",
    audio_url: "",
  })

  useEffect(() => {
    const authenticated = sessionStorage.getItem("admin_authenticated") === "true"
    setIsAuthenticated(authenticated)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    const [questionsRes, teamsRes, playersRes] = await Promise.all([
      supabase.from("questions").select("*").order("question_order", { ascending: true }),
      supabase.from("teams").select("*").order("created_at", { ascending: true }),
      supabase.from("players").select("*").order("created_at", { ascending: true }),
    ])

    setQuestions(questionsRes.data || [])
    setTeams(teamsRes.data || [])
    setPlayers(playersRes.data || [])
    setLoading(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated")
    setIsAuthenticated(false)
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const questionOrder = questions.length + 1

    const { error } = await supabase.from("questions").insert({
      ...newQuestion,
      question_order: questionOrder,
    })

    if (!error) {
      setNewQuestion({
        round_type: "text",
        clue: "",
        answer: "",
        hint_1: "",
        hint_2: "",
        hint_3: "",
        max_points: 100,
        hint_1_penalty: 20,
        hint_2_penalty: 20,
        hint_3_penalty: 20,
        image_url: "",
        audio_url: "",
      })
      loadData()
    }

    setSaving(false)
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    await supabase.from("questions").delete().eq("id", id)
    loadData()
  }

  const handleResetTeam = async (id: string) => {
    if (!confirm("Reset this team's progress? They will start from the beginning.")) return

    await supabase.from("team_progress").delete().eq("team_id", id)
    await supabase.from("teams").update({ current_question_index: 0, total_score: 0, completed_at: null }).eq("id", id)
    loadData()
  }

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team permanently?")) return

    await supabase.from("teams").delete().eq("id", id)
    loadData()
  }

  const handleDeleteAllQuestions = async () => {
    if (!confirm("Are you sure you want to delete ALL questions? This cannot be undone.")) return

    await supabase.from("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    loadData()
  }

  const handleRandomlyAssignPlayers = async () => {
    const unassignedPlayers = players.filter((p) => !p.team_id)
    if (unassignedPlayers.length === 0) {
      alert("No unassigned players to assign!")
      return
    }

    if (teams.length === 0) {
      alert("No teams exist! Create teams first.")
      return
    }

    if (
      !confirm(
        `Randomly assign ${unassignedPlayers.length} players across ${teams.length} teams? This will distribute players evenly.`,
      )
    )
      return

    const shuffled = [...unassignedPlayers].sort(() => Math.random() - 0.5)

    for (let i = 0; i < shuffled.length; i++) {
      const player = shuffled[i]
      const team = teams[i % teams.length]

      await supabase.from("players").update({ team_id: team.id }).eq("id", player.id)
    }

    loadData()
    alert("Players assigned successfully!")
  }

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Delete this player?")) return

    await supabase.from("players").delete().eq("id", id)
    loadData()
  }

  const handleUnassignPlayer = async (id: string) => {
    await supabase.from("players").update({ team_id: null }).eq("id", id)
    loadData()
  }

  const getRoundIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Camera className="h-4 w-4" />
      case "music":
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="border-border bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <FestiveHeader title="Admin Panel" subtitle="Manage questions, teams, and players" />

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-3 bg-muted mb-6">
              <TabsTrigger
                value="questions"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Questions ({questions.length})
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Teams ({teams.length})
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Players ({players.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              {questions.length > 0 && (
                <Link href="/admin/preview?mode=all">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Play className="h-4 w-4 mr-2" />
                    Test All Questions ({questions.length})
                  </Button>
                </Link>
              )}

              <XmlUpload onSuccess={loadData} existingCount={questions.length} />

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Single Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Round Type</Label>
                        <Select
                          value={newQuestion.round_type}
                          onValueChange={(value: "text" | "photo" | "music") =>
                            setNewQuestion({ ...newQuestion, round_type: value })
                          }
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Clue</SelectItem>
                            <SelectItem value="photo">Photo Round</SelectItem>
                            <SelectItem value="music">Music Round</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Points</Label>
                        <Input
                          type="number"
                          value={newQuestion.max_points}
                          onChange={(e) =>
                            setNewQuestion({ ...newQuestion, max_points: Number.parseInt(e.target.value) || 100 })
                          }
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Clue / Question</Label>
                      <Textarea
                        placeholder="Enter the clue or question..."
                        value={newQuestion.clue}
                        onChange={(e) => setNewQuestion({ ...newQuestion, clue: e.target.value })}
                        required
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer (case-insensitive)</Label>
                      <Input
                        placeholder="The correct answer"
                        value={newQuestion.answer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                        required
                        className="bg-input border-border"
                      />
                    </div>

                    {newQuestion.round_type === "photo" && (
                      <PhotoUpload
                        value={newQuestion.image_url}
                        onChange={(url) => setNewQuestion({ ...newQuestion, image_url: url })}
                        label="Image (upload or paste URL)"
                      />
                    )}

                    {newQuestion.round_type === "music" && (
                      <AudioUpload
                        value={newQuestion.audio_url}
                        onChange={(url) => setNewQuestion({ ...newQuestion, audio_url: url })}
                        label="Audio (upload or paste URL)"
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Hint 1 (-{newQuestion.hint_1_penalty} pts)</Label>
                        <Input
                          placeholder="First hint..."
                          value={newQuestion.hint_1}
                          onChange={(e) => setNewQuestion({ ...newQuestion, hint_1: e.target.value })}
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hint 2 (-{newQuestion.hint_2_penalty} pts)</Label>
                        <Input
                          placeholder="Second hint..."
                          value={newQuestion.hint_2}
                          onChange={(e) => setNewQuestion({ ...newQuestion, hint_2: e.target.value })}
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hint 3 (-{newQuestion.hint_3_penalty} pts)</Label>
                        <Input
                          placeholder="Third hint..."
                          value={newQuestion.hint_3}
                          onChange={(e) => setNewQuestion({ ...newQuestion, hint_3: e.target.value })}
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Adding..." : "Add Question"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {questions.length > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground text-sm">
                      {questions.length} question{questions.length !== 1 ? "s" : ""} total
                    </p>
                    <Button variant="destructive" size="sm" onClick={handleDeleteAllQuestions}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Questions
                    </Button>
                  </div>
                )}

                {questions.map((q, index) => (
                  <Card key={q.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-secondary">
                              #{index + 1}
                            </Badge>
                            <Badge variant="outline" className="border-border">
                              {getRoundIcon(q.round_type)}
                              <span className="ml-1 capitalize">{q.round_type}</span>
                            </Badge>
                            <Badge className="bg-accent text-accent-foreground">{q.max_points} pts</Badge>
                          </div>
                          <p className="text-foreground mb-1">{q.clue}</p>
                          <p className="text-sm text-muted-foreground">
                            Answer: <span className="text-accent font-medium">{q.answer}</span>
                          </p>

                          <button
                            onClick={() => toggleQuestion(q.id)}
                            className="flex items-center gap-1 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {expandedQuestions.has(q.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            {expandedQuestions.has(q.id) ? "Hide" : "Show"} clues
                          </button>

                          {expandedQuestions.has(q.id) && (
                            <div className="mt-3 pl-4 border-l-2 border-border space-y-2">
                              {q.hint_1 && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Clue 1 (-{q.hint_1_penalty}pts):</span>{" "}
                                  <span className="text-foreground">{q.hint_1}</span>
                                </p>
                              )}
                              {q.hint_2 && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Clue 2 (-{q.hint_2_penalty}pts):</span>{" "}
                                  <span className="text-foreground">{q.hint_2}</span>
                                </p>
                              )}
                              {q.hint_3 && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Clue 3 (-{q.hint_3_penalty}pts):</span>{" "}
                                  <span className="text-foreground">{q.hint_3}</span>
                                </p>
                              )}
                              {!q.hint_1 && !q.hint_2 && !q.hint_3 && (
                                <p className="text-sm text-muted-foreground italic">No clues set for this question</p>
                              )}
                              {q.image_url && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Image:</span>{" "}
                                  <a
                                    href={q.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    {q.image_url}
                                  </a>
                                </p>
                              )}
                              {q.audio_url && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Audio:</span>{" "}
                                  <a
                                    href={q.audio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    {q.audio_url}
                                  </a>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Link href={`/admin/preview?mode=single&id=${q.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {questions.length === 0 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No questions yet. Import XML or add manually above!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-3">
              {teams.map((team) => (
                <Card key={team.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{team.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Score: {team.total_score}</span>
                          <span>
                            Progress: {team.current_question_index}/{questions.length}
                          </span>
                          {team.completed_at && <Badge className="bg-green-600">Completed</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetTeam(team.id)}
                          className="border-border bg-transparent"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTeam(team.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {teams.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No teams have joined yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Player Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Unassigned Players: {players.filter((p) => !p.team_id).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Assigned Players: {players.filter((p) => p.team_id).length}
                      </p>
                    </div>
                    <Button onClick={handleRandomlyAssignPlayers} className="bg-accent text-accent-foreground">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Randomly Assign All Unassigned
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">All Players</h3>
                    {players.length === 0 && (
                      <Card className="bg-card border-border">
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">No players have signed up yet.</p>
                        </CardContent>
                      </Card>
                    )}

                    {players.map((player) => {
                      const team = teams.find((t) => t.id === player.team_id)
                      return (
                        <Card key={player.id} className="bg-card border-border">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{player.name}</p>
                                {team ? (
                                  <p className="text-sm text-muted-foreground">Team: {team.name}</p>
                                ) : (
                                  <Badge variant="secondary" className="bg-yellow-600 text-yellow-50 mt-1">
                                    Unassigned
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {player.team_id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnassignPlayer(player.id)}
                                    className="border-border bg-transparent"
                                  >
                                    Unassign
                                  </Button>
                                )}
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePlayer(player.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
