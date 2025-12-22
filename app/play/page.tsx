"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { QuestionCard } from "@/components/question-card"
import { CompletionScreen } from "@/components/completion-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { QuestionWithOptions, Team, TeamProgress } from "@/lib/types"
import { LogOut, Star, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function PlayPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [progress, setProgress] = useState<TeamProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTime, setTotalTime] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const teamId = localStorage.getItem("teamId")
    if (!teamId) {
      router.push("/")
      return
    }

    const loadGameData = async () => {
      const { data: teamData } = await supabase.from("teams").select("*").eq("id", teamId).single()

      if (!teamData) {
        localStorage.removeItem("teamId")
        localStorage.removeItem("teamName")
        router.push("/")
        return
      }

      setTeam(teamData)

      const { data: questionsData } = await supabase
        .from("questions")
        .select(`
          *,
          options:question_options(*)
        `)
        .order("question_order", { ascending: true })

      setQuestions(questionsData || [])

      const { data: progressData } = await supabase.from("team_progress").select("*").eq("team_id", teamId)

      setProgress(progressData || [])

      if (progressData) {
        const time = progressData.reduce((acc, p) => acc + (p.time_taken_seconds || 0), 0)
        setTotalTime(time)
      }

      setLoading(false)
    }

    loadGameData()
  }, [router, supabase])

  const handleCorrectAnswer = async (
    hintsUsed: number,
    points: number,
    timeTaken: number,
    selectedOptionId?: string,
  ) => {
    if (!team || !questions.length) return

    const currentQuestion = questions[team.current_question_index]

    await supabase.from("team_progress").insert({
      team_id: team.id,
      question_id: currentQuestion.id,
      hints_used: hintsUsed,
      points_earned: points,
      time_taken_seconds: timeTaken,
    })

    await supabase.from("player_answers").insert({
      team_id: team.id,
      question_id: currentQuestion.id,
      selected_option_id: selectedOptionId || null,
      free_text_answer: selectedOptionId ? null : currentQuestion.answer,
      is_correct: true,
      points_awarded: points,
      hints_used: hintsUsed,
    })

    const newScore = team.total_score + points
    const newIndex = team.current_question_index + 1
    const isComplete = newIndex >= questions.length

    await supabase
      .from("teams")
      .update({
        current_question_index: newIndex,
        total_score: newScore,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq("id", team.id)

    setTeam({
      ...team,
      current_question_index: newIndex,
      total_score: newScore,
      completed_at: isComplete ? new Date().toISOString() : null,
    })

    setProgress([
      ...progress,
      {
        id: crypto.randomUUID(),
        team_id: team.id,
        question_id: currentQuestion.id,
        hints_used: hintsUsed,
        points_earned: points,
        answered_at: new Date().toISOString(),
        time_taken_seconds: timeTaken,
      },
    ])

    setTotalTime(totalTime + timeTaken)
  }

  const handleLogout = () => {
    localStorage.removeItem("teamId")
    localStorage.removeItem("teamName")
    router.push("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your adventure...</p>
        </div>
      </main>
    )
  }

  if (!team) return null

  const isComplete = team.completed_at || team.current_question_index >= questions.length
  const currentQuestion = questions[team.current_question_index]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">{team.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{team.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3 text-accent" />
                {team.total_score} points
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-1" />
            Leave
          </Button>
        </div>

        {isComplete ? (
          <CompletionScreen teamName={team.name} totalScore={team.total_score} totalTime={totalTime} />
        ) : questions.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Questions Yet</h2>
              <p className="text-muted-foreground mb-4">
                The quiz hasn&apos;t been set up yet. Ask the game master to add some questions!
              </p>
              <Link href="/admin">
                <Button variant="outline">Go to Admin</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-lg mx-auto">
            <FestiveHeader
              title={`Clue ${team.current_question_index + 1}`}
              subtitle="Solve this riddle to find your next clue!"
            />
            <QuestionCard
              question={currentQuestion}
              questionNumber={team.current_question_index + 1}
              totalQuestions={questions.length}
              onCorrectAnswer={handleCorrectAnswer}
            />
          </div>
        )}
      </div>
    </main>
  )
}
