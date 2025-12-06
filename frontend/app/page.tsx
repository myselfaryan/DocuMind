import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowUpRight, Sparkles, FileText, Presentation, Zap } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-serif font-bold text-foreground tracking-tight">DocuMind</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary/70 transition-colors">Log in</Link>
            <Link href="/register">
              <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">

          {/* Hero Card - Large */}
          <div className="md:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-6">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Generation</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight text-foreground">
                Documents,<br />
                <span className="text-muted-foreground">Reimagined.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                Create professional reports and presentations in seconds.
                Just describe your topic, and let our AI handle the rest.
              </p>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button size="lg" className="rounded-full text-base px-8 h-12 bg-foreground text-background hover:bg-foreground/90">
                    Start Creating
                  </Button>
                </Link>
              </div>
            </div>
            {/* Abstract decorative circle */}
            <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-[oklch(var(--accent-green))] rounded-full opacity-20 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          {/* Feature Card 1 - Green */}
          <div className="bg-[oklch(var(--accent-green))] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group text-foreground">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <FileText className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Word Docs</h3>
              <p className="opacity-90 font-medium">Generate comprehensive reports, proposals, and guides instantly.</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-20 rounded-full blur-2xl"></div>
          </div>

          {/* Feature Card 2 - Blue */}
          <div className="bg-[oklch(var(--accent-blue))] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group text-foreground">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Presentation className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">PowerPoint</h3>
              <p className="opacity-90 font-medium">Create stunning slide decks with structured content and speaker notes.</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white opacity-20 rounded-full blur-2xl"></div>
          </div>

          {/* Feature Card 3 - Pink */}
          <div className="md:col-span-1 bg-[oklch(var(--accent-pink))] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group text-foreground">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant Refinement</h3>
              <p className="opacity-90 font-medium">Iterate with AI. Ask for changes, get results immediately.</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Stats / Social Proof - White */}
          <div className="md:col-span-1 bg-white rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-5xl font-serif font-bold text-foreground mb-2">10x</h3>
            <p className="text-muted-foreground font-medium">Faster Document Creation</p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-20 flex justify-between items-end text-muted-foreground">
          <div>
            <p className="font-serif text-lg text-foreground mb-2">DocuMind</p>
            <p className="text-sm">© 2025 DocuMind Inc.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
