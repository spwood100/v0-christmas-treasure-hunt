"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, Clock, PartyPopper } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

interface CompletionScreenProps {
  teamName: string
  totalScore: number
  totalTime: number
}

export function CompletionScreen({ teamName, totalScore, totalTime }: CompletionScreenProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Trigger confetti
    const duration = 3000
    const end = Date.now() + duration

    const colors = ["#c41e3a", "#ffd700", "#1a472a", "#ffffff"]
    ;(function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()

    setTimeout(() => setShowContent(true), 500)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div
      className={`transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      <Card className="bg-card border-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-20 w-20 text-accent animate-sparkle" />
              <PartyPopper
                className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-sparkle"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
          <CardTitle className="font-serif text-3xl md:text-4xl text-foreground">Congratulations!</CardTitle>
          <p className="text-xl text-muted-foreground mt-2">{teamName} completed the Christmas Quiz!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <Star className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-3xl font-bold text-accent">{totalScore}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">{formatTime(totalTime)}</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
          </div>

          <div className="text-6xl animate-sparkle">🎄🎁🎅</div>

          <p className="text-lg text-foreground">You answered all the questions and completed the Christmas Quiz!</p>

          <div className="flex flex-col gap-3">
            <Link href="/leaderboard">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-border bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
