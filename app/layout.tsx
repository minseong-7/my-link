import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "MyLink - 하나의 링크로 모든 것을 연결하세요",
  description: "나만의 맞춤형 프로필 페이지를 만들고 흩어져 있는 SNS, 블로그, 포트폴리오를 한 곳에 모아 공유해보세요.",
  keywords: ["MyLink", "프로필 링크", "링크 모음", "멀티 링크", "바이오 링크", "포트폴리오"],
  authors: [{ name: "MyLink" }],
  openGraph: {
    title: "MyLink - 하나의 링크로 모든 것을 연결하세요",
    description: "나만의 맞춤형 프로필 페이지를 만들고 흩어져 있는 SNS, 블로그, 포트폴리오를 한 곳에 모아 공유해보세요.",
    siteName: "MyLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink - 하나의 링크로 모든 것을 연결하세요",
    description: "나만의 맞춤형 프로필 페이지를 만들고 흩어져 있는 SNS, 블로그, 포트폴리오를 한 곳에 모아 공유해보세요.",
  },
}

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
        <Providers>
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
        </Providers>
      </body>
    </html>
  )
}
