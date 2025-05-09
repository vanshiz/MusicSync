import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TestModeSwitcher } from "@/components/test-mode-switcher"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MusicSync - Collaborative Music Streaming",
  description: "Listen to music together with friends and chat in real-time"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <TestModeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  )
}
