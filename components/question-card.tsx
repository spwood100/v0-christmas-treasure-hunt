"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { QuestionWithOptions } from "@/lib/types"
import { Lightbulb, Check, X, Camera, Music, FileText, Star, Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface QuestionCardProps {
  question: QuestionWithOptions
  questionNumber: number
  totalQuestions: number
  onCorrectAnswer: (hintsUsed: number, points: number, timeTaken: number, selectedOptionId?: string) => void
}

export function QuestionCard({ question, questionNumber, totalQuestions, onCorrectAnswer }: QuestionCardProps) {
  const [answer, setAnswer] = useState("")
  const [selectedOptionId, setSelectedOptionId] = useState<string>("")
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHints, setShowHints] = useState<string[]>([])
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [startTime] = useState(Date.now())
  const [currentPoints, setCurrentPoints] = useState(question.max_points)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    // Calculate current points based on hints used
    let points = question.max_points
    if (hintsUsed >= 1) points -= question.hint_1_penalty
    if (hintsUsed >= 2) points -= question.hint_2_penalty
    if (hintsUsed >= 3) points -= question.hint_3_penalty
    setCurrentPoints(Math.max(points, 10)) // Minimum 10 points
  }, [hintsUsed, question])

  const handleRevealHint = () => {
    const hints = [question.hint_1, question.hint_2, question.hint_3].filter(Boolean) as string[]
    if (hintsUsed < hints.length) {
      setShowHints([...showHints, hints[hintsUsed]])
      setHintsUsed(hintsUsed + 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let isCorrect = false
    let optionId: string | undefined

    if (question.answer_mode === "freetext") {
      // Original free-text logic
      const normalizedAnswer = answer.toLowerCase().trim()
      const correctAnswer = question.answer.toLowerCase().trim()
      isCorrect = normalizedAnswer === correctAnswer
    } else {
      // MCQ or typeahead - check selected option
      const selectedOption = question.options?.find((opt) => opt.id === selectedOptionId)
      isCorrect = selectedOption?.is_correct || false
      optionId = selectedOptionId
    }

    if (isCorrect) {
      setFeedback("correct")
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      setTimeout(() => {
        onCorrectAnswer(hintsUsed, currentPoints, timeTaken, optionId)
      }, 1500)
    } else {
      setFeedback("incorrect")
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      setTimeout(() => {
        onCorrectAnswer(hintsUsed, 0, timeTaken, optionId)
      }, 1500)
    }
  }

  const getRoundIcon = () => {
    switch (question.round_type) {
      case "photo":
        return <Camera className="h-5 w-5" />
      case "music":
        return <Music className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getRoundLabel = () => {
    switch (question.round_type) {
      case "photo":
        return "Photo Round"
      case "music":
        return "Music Round"
      default:
        return "Clue Round"
    }
  }

  const availableHints = [question.hint_1, question.hint_2, question.hint_3].filter(Boolean).length

  const selectedOption = question.options?.find((opt) => opt.id === selectedOptionId)

  return (
    <Card
      className={`bg-card border-border transition-all duration-300 ${
        feedback === "correct" ? "ring-4 ring-green-500" : feedback === "incorrect" ? "ring-4 ring-destructive" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {getRoundIcon()}
            <span className="ml-1">{getRoundLabel()}</span>
          </Badge>
          <Badge variant="outline" className="border-accent text-accent">
            Question {questionNumber} of {totalQuestions}
          </Badge>
        </div>
        <CardTitle className="font-serif text-xl">
          {question.round_type === "photo" && question.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={question.image_url || "/placeholder.svg"}
                alt="Photo clue"
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          {question.round_type === "music" && question.audio_url && (
            <div className="mb-4">
              <audio controls className="w-full">
                <source src={question.audio_url} type="audio/mpeg" />
                Your browser does not support audio.
              </audio>
            </div>
          )}
          <p className="text-foreground leading-relaxed">{question.clue}</p>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points display */}
        <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
          <Star className="h-5 w-5 text-accent" />
          <span className="text-lg font-semibold text-accent">{currentPoints} points available</span>
        </div>

        {/* Hints section */}
        {showHints.length > 0 && (
          <div className="space-y-2">
            {showHints.map((hint, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{hint}</p>
              </div>
            ))}
          </div>
        )}

        {hintsUsed < availableHints && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRevealHint}
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Reveal Hint ({availableHints - hintsUsed} remaining, -
            {question[`hint_${hintsUsed + 1}_penalty` as keyof QuestionWithOptions]} points)
          </Button>
        )}

        {/* Answer form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {question.answer_mode === "freetext" && (
            <Input
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="bg-input border-border text-lg"
              disabled={feedback !== null}
            />
          )}

          {question.answer_mode === "mcq" && (
            <RadioGroup value={selectedOptionId} onValueChange={setSelectedOptionId} disabled={feedback !== null}>
              <div className="space-y-2">
                {question.options
                  ?.sort((a, b) => a.sort_order - b.sort_order)
                  .map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                        {option.label}
                      </Label>
                    </div>
                  ))}
              </div>
            </RadioGroup>
          )}

          {question.answer_mode === "typeahead" && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-input border-border text-lg h-12"
                  disabled={feedback !== null}
                >
                  {selectedOption ? selectedOption.label : "Select answer..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Type to search..." value={searchValue} onValueChange={setSearchValue} />
                  <CommandList>
                    <CommandEmpty>No answer found.</CommandEmpty>
                    <CommandGroup>
                      {question.options
                        ?.filter((opt) => opt.normalized_label.includes(searchValue.toLowerCase()))
                        .map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.id}
                            onSelect={(value) => {
                              setSelectedOptionId(value)
                              setOpen(false)
                            }}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
            disabled={
              (question.answer_mode === "freetext" && !answer.trim()) ||
              (question.answer_mode !== "freetext" && !selectedOptionId) ||
              feedback !== null
            }
          >
            {feedback === "correct" ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Correct! Well done!
              </>
            ) : feedback === "incorrect" ? (
              <>
                <X className="h-5 w-5 mr-2" />
                Incorrect - Moving on...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
