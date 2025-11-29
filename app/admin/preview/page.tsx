"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { QuestionCard } from "@/components/question-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Question } from "@/lib/types"
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const questionId = searchParams.get("id")
  const mode = searchParams.get("mode") // "single" or "all"

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [totalScore, setTotalScore] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    loadQuestions()
  }, [questionId, mode])

  const loadQuestions = async () => {
    setLoading(true)

    if (mode === "single" && questionId) {
      const { data } = await supabase.from("questions").select("*").eq("id", questionId).single()

      if (data) {
        setQuestions([data])
      }
    } else {
      const { data } = await supabase.from("questions").select("*").order("question_order", { ascending: true })

      setQuestions(data || [])
    }

    setLoading(false)
  }

  const handleCorrectAnswer = (hintsUsed: number, points: number, timeTaken: number) => {
    setCompleted((prev) => new Set([...prev, currentIndex]))
    setTotalScore((prev) => prev + points)

    // In test mode, auto-advance after 1.5s
    if (mode === "all" && currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 1500)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setCompleted(new Set())
    setTotalScore(0)
  }

  const currentQuestion = questions[currentIndex]
  const allCompleted = completed.size === questions.length && questions.length > 0

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading preview...</p>
        </div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden">
        <Snowfall />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Link href="/admin">
            <Button variant="ghost" className="text-muted-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <Card className="bg-card border-border max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No questions found to preview.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <Link href="/admin">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent text-accent">
              Preview Mode
            </Badge>
            {mode === "all" && <Badge className="bg-primary text-primary-foreground">Score: {totalScore}</Badge>}
          </div>
        </div>

        <FestiveHeader
          title={mode === "all" ? "Test All Questions" : "Question Preview"}
          subtitle={
            mode === "all" ? "Play through all questions like a real game" : "Preview how this question appears"
          }
        />

        <div className="max-w-2xl mx-auto">
          {allCompleted ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-serif text-foreground">Test Complete!</h2>
                <p className="text-muted-foreground">You answered all {questions.length} questions correctly.</p>
                <p className="text-xl font-semibold text-accent">Final Score: {totalScore} points</p>
                <div className="flex justify-center gap-3 pt-4">
                  <Button onClick={handleReset} variant="outline" className="border-border bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Test Again
                  </Button>
                  <Link href="/admin">
                    <Button className="bg-primary">Back to Admin</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {currentQuestion && (
                <QuestionCard
                  key={`${currentQuestion.id}-${currentIndex}`}
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={questions.length}
                  onCorrectAnswer={handleCorrectAnswer}
                />
              )}

              {/* Navigation for test all mode */}
              {mode === "all" && questions.length > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="border-border bg-transparent"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          completed.has(idx) ? "bg-green-500" : idx === currentIndex ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="border-border bg-transparent"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
