"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Upload, FileCode, CheckCircle, AlertCircle, Download } from "lucide-react"

interface ParsedQuestion {
  round_type: "text" | "photo" | "music"
  answer_mode: "freetext" | "mcq" | "typeahead"
  clue: string
  answer: string
  hint_1: string
  hint_2: string
  hint_3: string
  max_points: number
  hint_1_penalty: number
  hint_2_penalty: number
  hint_3_penalty: number
  image_url: string
  audio_url: string
  question_order: number
  options?: Array<{
    label: string
    normalized_label: string
    is_correct: boolean
    sort_order: number
  }>
}

interface XmlUploadProps {
  onSuccess: () => void
  existingCount: number
}

export function XmlUpload({ onSuccess, existingCount }: XmlUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const supabase = createClient()

  const parseXml = (xmlString: string): ParsedQuestion[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, "text/xml")

    const parseError = doc.querySelector("parsererror")
    if (parseError) {
      throw new Error("Invalid XML format")
    }

    const questions: ParsedQuestion[] = []
    const questionNodes = doc.querySelectorAll("question")

    const startOrder = replaceExisting ? 0 : existingCount

    questionNodes.forEach((node, index) => {
      const getText = (tags: string[]) => {
        for (const tag of tags) {
          const content = node.querySelector(tag)?.textContent?.trim()
          if (content) return content
        }
        return ""
      }
      const getNumber = (tags: string[], defaultVal: number) => {
        for (const tag of tags) {
          const val = node.querySelector(tag)?.textContent?.trim()
          if (val) return Number.parseInt(val, 10)
        }
        return defaultVal
      }

      const roundType = getText(["type"]) as "text" | "photo" | "music"
      const answerMode = getText(["answerMode", "answer_mode"]) as "freetext" | "mcq" | "typeahead"

      const optionNodes = node.querySelectorAll("option")
      const options: ParsedQuestion["options"] = []

      if (optionNodes.length > 0) {
        optionNodes.forEach((optNode, optIndex) => {
          const label = optNode.textContent?.trim() || ""
          const isCorrect = optNode.getAttribute("correct") === "true"
          options.push({
            label,
            normalized_label: label.toLowerCase().trim(),
            is_correct: isCorrect,
            sort_order: optIndex,
          })
        })
      }

      questions.push({
        round_type: ["text", "photo", "music"].includes(roundType) ? roundType : "text",
        answer_mode: ["freetext", "mcq", "typeahead"].includes(answerMode) ? answerMode : "freetext",
        clue: getText(["clue", "text"]),
        answer: getText(["answer"]),
        hint_1: getText(["hint1", "clue1"]),
        hint_2: getText(["hint2", "clue2"]),
        hint_3: getText(["hint3", "clue3"]),
        max_points: getNumber(["maxPoints", "max_points"], 100),
        hint_1_penalty: getNumber(["hint1Penalty", "hint1_penalty"], 20),
        hint_2_penalty: getNumber(["hint2Penalty", "hint2_penalty"], 20),
        hint_3_penalty: getNumber(["hint3Penalty", "hint3_penalty"], 20),
        image_url: getText(["imageUrl", "image_url", "image"]),
        audio_url: getText(["audioUrl", "audio_url", "audio"]),
        question_order: startOrder + index + 1,
        options: options.length > 0 ? options : undefined,
      })
    })

    return questions
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const text = await file.text()
      const questions = parseXml(text)

      if (questions.length === 0) {
        throw new Error("No questions found in XML")
      }

      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].clue || !questions[i].answer) {
          throw new Error(`Question ${i + 1} is missing clue or answer`)
        }
        if (questions[i].answer_mode !== "freetext") {
          if (!questions[i].options || questions[i].options!.length < 2) {
            throw new Error(`Question ${i + 1} must have at least 2 options for ${questions[i].answer_mode} mode`)
          }
          const correctCount = questions[i].options!.filter((opt) => opt.is_correct).length
          if (correctCount !== 1) {
            throw new Error(`Question ${i + 1} must have exactly 1 correct option (found ${correctCount})`)
          }
        }
      }

      if (replaceExisting) {
        const { error: deleteError } = await supabase
          .from("questions")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000")
        if (deleteError) throw deleteError
      }

      for (const question of questions) {
        const { options, ...questionData } = question

        const { data: insertedQuestion, error: questionError } = await supabase
          .from("questions")
          .insert(questionData)
          .select()
          .single()

        if (questionError) throw questionError

        if (options && options.length > 0 && insertedQuestion) {
          const optionsToInsert = options.map((opt) => ({
            ...opt,
            question_id: insertedQuestion.id,
          }))

          const { error: optionsError } = await supabase.from("question_options").insert(optionsToInsert)

          if (optionsError) throw optionsError
        }
      }

      setResult({
        success: true,
        message: replaceExisting
          ? `Replaced all questions with ${questions.length} new questions!`
          : `Successfully imported ${questions.length} questions!`,
      })
      onSuccess()
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to import XML",
      })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const downloadTemplate = () => {
    const template = `<?xml version="1.0" encoding="UTF-8"?>
<questions>
  <question>
    <type>text</type>
    <answerMode>freetext</answerMode>
    <clue>I'm cold inside but keep things fresh, open my door to find your next quest!</clue>
    <answer>fridge</answer>
    <hint1>I'm in the kitchen</hint1>
    <hint2>I keep food cold</hint2>
    <hint3>I have a freezer section</hint3>
    <maxPoints>100</maxPoints>
    <hint1Penalty>20</hint1Penalty>
    <hint2Penalty>20</hint2Penalty>
    <hint3Penalty>20</hint3Penalty>
  </question>

  <question>
    <type>text</type>
    <answerMode>mcq</answerMode>
    <clue>What is the capital of France?</clue>
    <answer>Paris</answer>
    <option correct="false">London</option>
    <option correct="true">Paris</option>
    <option correct="false">Berlin</option>
    <option correct="false">Madrid</option>
    <hint1>It's in Western Europe</hint1>
  </question>

  <question>
    <type>text</type>
    <answerMode>typeahead</answerMode>
    <clue>In English criminal law, what word describes a person's "guilty mind"?</clue>
    <answer>Mens rea</answer>
    <option correct="false">Actus reus</option>
    <option correct="true">Mens rea</option>
    <option correct="false">Habeas corpus</option>
    <option correct="false">Caveat emptor</option>
    <hint1>It's Latin.</hint1>
    <hint2>Opposite partner term is "actus reus".</hint2>
  </question>

  <question>
    <type>photo</type>
    <answerMode>mcq</answerMode>
    <clue>What location is shown in this photo?</clue>
    <answer>fireplace</answer>
    <imageUrl>https://example.com/fireplace-clue.jpg</imageUrl>
    <option correct="false">Kitchen</option>
    <option correct="true">Fireplace</option>
    <option correct="false">Bedroom</option>
    <hint1>It's warm here</hint1>
  </question>
</questions>`

    const blob = new Blob([template], { type: "text/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "treasure-hunt-template.xml"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Import Questions from XML
        </CardTitle>
        <CardDescription>
          Bulk upload questions using an XML file. Download the template to see the format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="replace-existing"
            checked={replaceExisting}
            onCheckedChange={(checked) => setReplaceExisting(checked === true)}
          />
          <Label htmlFor="replace-existing" className="text-sm text-muted-foreground cursor-pointer">
            Replace all existing questions (delete current questions first)
          </Label>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadTemplate} className="border-border bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>

          <label>
            <input type="file" accept=".xml" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            <Button asChild disabled={uploading} className="bg-primary cursor-pointer">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Importing..." : "Upload XML"}
              </span>
            </Button>
          </label>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="border-border">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
