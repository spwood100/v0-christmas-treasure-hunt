import { Snowfall } from "@/components/snowfall"
import { FestiveHeader } from "@/components/festive-header"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <FestiveHeader title="Leaderboard" subtitle="See who's leading the quiz!" />

        <div className="max-w-2xl mx-auto">
          <LeaderboardTable />
        </div>
      </div>
    </main>
  )
}
