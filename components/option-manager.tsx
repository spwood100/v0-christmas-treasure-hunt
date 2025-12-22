"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Plus, GripVertical } from "lucide-react"
import type { QuestionOption } from "@/lib/types"

interface OptionManagerProps {
  options: Omit<QuestionOption, "id" | "question_id" | "created_at">[]
  onChange: (options: Omit<QuestionOption, "id" | "question_id" | "created_at">[]) => void
}

export function OptionManager({ options, onChange }: OptionManagerProps) {
  const [localOptions, setLocalOptions] = useState(options)

  const handleAddOption = () => {
    const newOption = {
      label: "",
      normalized_label: "",
      is_correct: localOptions.length === 0,
      sort_order: localOptions.length,
    }
    const updated = [...localOptions, newOption]
    setLocalOptions(updated)
    onChange(updated)
  }

  const handleRemoveOption = (index: number) => {
    const updated = localOptions.filter((_, i) => i !== index)
    // Re-index sort order
    const reindexed = updated.map((opt, i) => ({ ...opt, sort_order: i }))
    setLocalOptions(reindexed)
    onChange(reindexed)
  }

  const handleUpdateOption = (index: number, field: keyof (typeof localOptions)[0], value: string | boolean) => {
    const updated = [...localOptions]
    updated[index] = { ...updated[index], [field]: value }

    // Update normalized_label when label changes
    if (field === "label" && typeof value === "string") {
      updated[index].normalized_label = value.toLowerCase().trim()
    }

    // Ensure only one correct answer
    if (field === "is_correct" && value === true) {
      updated.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false
      })
    }

    setLocalOptions(updated)
    onChange(updated)
  }

  const handleSetCorrect = (index: number) => {
    const updated = localOptions.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }))
    setLocalOptions(updated)
    onChange(updated)
  }

  const moveOption = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === localOptions.length - 1)) {
      return
    }

    const updated = [...localOptions]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]

    // Update sort_order
    const reindexed = updated.map((opt, i) => ({ ...opt, sort_order: i }))
    setLocalOptions(reindexed)
    onChange(reindexed)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Answer Options</Label>
        <Button type="button" size="sm" variant="outline" onClick={handleAddOption}>
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>

      {localOptions.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No options yet. Add at least 2 options.</p>
      )}

      <RadioGroup value={localOptions.findIndex((opt) => opt.is_correct).toString()}>
        <div className="space-y-2">
          {localOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-4 w-6 p-0"
                  onClick={() => moveOption(index, "up")}
                  disabled={index === 0}
                >
                  <GripVertical className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-4 w-6 p-0"
                  onClick={() => moveOption(index, "down")}
                  disabled={index === localOptions.length - 1}
                >
                  <GripVertical className="h-3 w-3" />
                </Button>
              </div>

              <RadioGroupItem
                value={index.toString()}
                id={`option-${index}`}
                checked={option.is_correct}
                onClick={() => handleSetCorrect(index)}
              />

              <Input
                placeholder="Option text..."
                value={option.label}
                onChange={(e) => handleUpdateOption(index, "label", e.target.value)}
                className="flex-1 bg-input"
              />

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveOption(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </RadioGroup>

      {localOptions.length > 0 && localOptions.filter((opt) => opt.is_correct).length === 0 && (
        <p className="text-sm text-destructive">Please mark one option as correct (click the radio button)</p>
      )}

      {localOptions.length === 1 && (
        <p className="text-sm text-amber-500">Add at least one more option (minimum 2 required)</p>
      )}
    </div>
  )
}
