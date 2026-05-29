"use client"

import { useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, query, getDocs } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  clickCount: {
    label: "클릭 수",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/')
      } else {
        setUser(currentUser)
      }
      setIsAuthChecking(false)
    })
    return () => unsubscribeAuth()
  }, [router])

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['links-stats', user?.uid],
    queryFn: async () => {
      if (!user) return []
      const q = query(collection(db, "users", user.uid, "links"))
      const snapshot = await getDocs(q)
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      
      return fetchedLinks.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    },
    enabled: !!user,
  })

  if (isAuthChecking || isLinksLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (!user) return null; // Wait for redirect

  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  const mostClicked = links.length > 0 && (links[0].clickCount || 0) > 0 ? links[0] : null;

  const chartData = links.slice(0, 5).map(link => ({
    title: link.title.length > 10 ? link.title.substring(0, 10) + '...' : link.title,
    clickCount: link.clickCount || 0,
  }));

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="z-20 w-full flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0">
        <div 
          className="flex items-center gap-2 font-bold text-xl cursor-pointer group" 
          onClick={() => router.push('/')}
        >
          <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent transition-transform group-hover:scale-105">MyLink</span>
          <span className="text-muted-foreground text-sm font-medium border-l border-border/50 pl-2">통계</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          돌아가기
        </Button>
      </header>

      <div className="z-10 w-full max-w-3xl flex flex-col gap-8 mt-8 mb-16 px-6">
        {/* Title area */}
        <div className="flex flex-col items-center text-center mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">당신의 링크 성과를 확인하세요</h1>
          <p className="text-muted-foreground">어떤 링크가 가장 인기가 많은지 한눈에 파악할 수 있습니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden p-6 flex flex-col justify-center items-center text-center bg-background/60 backdrop-blur-md border border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            </div>
            <p className="text-muted-foreground font-semibold mb-3 z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              총 클릭 수
            </p>
            <p className="text-6xl font-black bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent z-10">{totalClicks}</p>
          </Card>
          
          <Card className="relative overflow-hidden p-6 flex flex-col justify-center items-center text-center bg-background/60 backdrop-blur-md border border-border/50 shadow-md hover:shadow-lg transition-all group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <p className="text-muted-foreground font-semibold mb-3 z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              가장 인기있는 링크
            </p>
            {mostClicked ? (
              <div className="z-10 flex flex-col items-center w-full mt-2">
                <p className="text-2xl font-bold truncate w-full px-4 mb-3">{mostClicked.title}</p>
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-primary/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  {mostClicked.clickCount} 클릭
                </div>
              </div>
            ) : (
              <p className="text-lg font-medium text-muted-foreground/70 z-10 mt-2">데이터 없음</p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex items-center gap-2 px-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <h2 className="text-xl font-bold">클릭 수 TOP 5</h2>
          </div>
          <Card className="p-6 bg-background/60 backdrop-blur-md border-border/50 shadow-md">
            {chartData.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <p>차트 데이터가 없습니다.</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="title" 
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="text-xs font-medium"
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs font-medium"
                  />
                  <ChartTooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="clickCount" fill="var(--color-clickCount)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ChartContainer>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex items-center gap-2 px-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>
            <h2 className="text-xl font-bold">링크별 상세 통계</h2>
          </div>
          <Card className="overflow-hidden bg-background/60 backdrop-blur-md border-border/50 shadow-md">
            {links.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                추가된 링크가 없습니다.
              </div>
            ) : (
              <div className="flex flex-col">
                {links.map((link, idx) => (
                  <div key={link.id} className={`flex items-center justify-between p-5 hover:bg-muted/30 transition-colors ${idx !== links.length - 1 ? 'border-b border-border/50' : ''}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${idx < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {idx + 1}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        <img 
                          src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(link.url)}`} 
                          alt="" 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <span className="font-bold text-foreground/90 truncate text-lg ml-1">{link.title}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-4">
                      <span className="font-black text-2xl text-primary">{link.clickCount || 0}</span>
                      <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
