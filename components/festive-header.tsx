import { Gift, TreePine } from "lucide-react"

interface FestiveHeaderProps {
  title: string
  subtitle?: string
}

export function FestiveHeader({ title, subtitle }: FestiveHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <TreePine className="h-8 w-8 text-secondary-foreground animate-sparkle" />
        <Gift className="h-10 w-10 text-primary animate-sparkle" style={{ animationDelay: "0.5s" }} />
        <TreePine className="h-8 w-8 text-secondary-foreground animate-sparkle" style={{ animationDelay: "1s" }} />
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground glow mb-2">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
      <div className="flex justify-center gap-2 mt-4">
        {["🎄", "⭐", "🎁", "⭐", "🎄"].map((emoji, i) => (
          <span key={i} className="text-2xl animate-sparkle" style={{ animationDelay: `${i * 0.2}s` }}>
            {emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
