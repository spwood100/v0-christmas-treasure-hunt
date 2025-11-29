"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Users, LogIn } from "lucide-react"

export function TeamForm() {
  const [teamName, setTeamName] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Check if team name already exists
      const { data: existing } = await supabase.from("teams").select("id").eq("name", teamName.trim()).single()

      if (existing) {
        setError("Team name already exists. Choose another or join with PIN.")
        setIsLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from("teams")
        .insert({ name: teamName.trim(), pin: pin })
        .select()
        .single()

      if (insertError) throw insertError

      localStorage.setItem("teamId", data.id)
      localStorage.setItem("teamName", data.name)
      router.push("/play")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("teams")
        .select("*")
        .eq("name", teamName.trim())
        .eq("pin", pin)
        .single()

      if (fetchError || !data) {
        setError("Team not found or incorrect PIN")
        setIsLoading(false)
        return
      }

      localStorage.setItem("teamId", data.id)
      localStorage.setItem("teamName", data.name)
      router.push("/play")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-center">Join the Hunt!</CardTitle>
        <CardDescription className="text-center">Create a new team or join an existing one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              Create Team
            </TabsTrigger>
            <TabsTrigger
              value="join"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Join Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Team Name</Label>
                <Input
                  id="create-name"
                  placeholder="The Reindeer Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-pin">Team PIN (4 digits)</Label>
                <Input
                  id="create-pin"
                  type="password"
                  placeholder="1234"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  required
                  className="bg-input border-border"
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Team & Start!"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="join">
            <form onSubmit={handleJoinTeam} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="join-name">Team Name</Label>
                <Input
                  id="join-name"
                  placeholder="The Reindeer Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="join-pin">Team PIN</Label>
                <Input
                  id="join-pin"
                  type="password"
                  placeholder="1234"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  required
                  className="bg-input border-border"
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Joining..." : "Join Team"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
