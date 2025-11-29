import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { TeamForm } from "@/components/team-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Settings } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <FestiveHeader title="Christmas Quiz" subtitle="Answer the questions, solve the clues, win the prize!" />

        <div className="max-w-md mx-auto space-y-6">
          <TeamForm />

          <div className="flex gap-3">
            <Link href="/leaderboard" className="flex-1">
              <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Link href="/admin" className="flex-1">
              <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
