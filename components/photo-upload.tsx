"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"

interface PhotoUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function PhotoUpload({ value, onChange, label = "Image" }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.url) {
        onChange(data.url)
      }
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-input border-border flex-1"
        />
        <label>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          <Button
            asChild
            variant="outline"
            disabled={uploading}
            className="border-border cursor-pointer bg-transparent"
          >
            <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
          </Button>
        </label>
      </div>
      {value && (
        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border">
          <img src={value || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}
