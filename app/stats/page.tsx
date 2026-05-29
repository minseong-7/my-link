"use client"

import { useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, query, getDocs } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <header className="z-20 w-full max-w-2xl flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">통계</h1>
        <Button variant="outline" onClick={() => router.push('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          돌아가기
        </Button>
      </header>

      <div className="z-10 w-full max-w-2xl flex flex-col gap-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 flex flex-col justify-center items-center text-center bg-background/60 backdrop-blur-md border-primary/20 shadow-lg">
            <p className="text-muted-foreground font-medium mb-2">총 클릭 수</p>
            <p className="text-5xl font-black text-primary">{totalClicks}</p>
          </Card>
          <Card className="p-6 flex flex-col justify-center items-center text-center bg-background/60 backdrop-blur-md border-border/50 shadow-md">
            <p className="text-muted-foreground font-medium mb-2">가장 인기있는 링크</p>
            {mostClicked ? (
              <>
                <p className="text-xl font-bold truncate w-full max-w-full px-2">{mostClicked.title}</p>
                <p className="text-sm text-primary font-semibold mt-1">{mostClicked.clickCount} 클릭</p>
              </>
            ) : (
              <p className="text-lg font-medium text-muted-foreground/70">데이터 없음</p>
            )}
          </Card>
        </div>

        <h2 className="text-xl font-bold mt-4">링크별 통계</h2>
        <Card className="overflow-hidden bg-background/60 backdrop-blur-md border-border/50 shadow-md">
          {links.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              추가된 링크가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col">
              {links.map((link, idx) => (
                <div key={link.id} className={`flex items-center justify-between p-4 ${idx !== links.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                      <img 
                        src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(link.url)}`} 
                        alt="" 
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <span className="font-medium truncate">{link.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <span className="font-bold text-lg">{link.clickCount || 0}</span>
                    <span className="text-xs text-muted-foreground">클릭</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
