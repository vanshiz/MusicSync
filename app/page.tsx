import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Music, Users, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold">
            <Music className="h-6 w-6" />
            <span>MusicSync</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Listen Together, Chat Together
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Join fandom groups, create private rooms, and enjoy synchronized music with friends.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" size="lg">
                    Explore Fandoms
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary p-3">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Join Fandom Groups</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Connect with fans who share your musical interests and passions.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary p-3">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Private Chat Rooms</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Create exclusive spaces to chat and share music with friends.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary p-3">
                  <Music className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Synchronized Music</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Listen to the same songs at the same time, perfectly in sync.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 MusicSync. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
