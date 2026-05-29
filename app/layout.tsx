import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans", fontSans.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{
              classNames: {
                toast: "group bg-background/80 backdrop-blur-md border border-border/50 text-foreground shadow-lg rounded-xl p-4 flex gap-3 w-full",
                title: "text-sm font-bold tracking-tight",
                description: "text-xs text-muted-foreground font-medium",
                icon: "text-primary shrink-0",
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
