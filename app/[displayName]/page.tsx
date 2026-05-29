"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, doc, updateDoc, increment } from "firebase/firestore"
import { notFound } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"

interface PageProps {
  params: {
    displayName: string
  }
}

export default function PublicProfilePage({ params }: PageProps) {
  const { displayName } = params

  const { data: userData, isLoading: isUserLoading, error } = useQuery({
    queryKey: ['public-profile', displayName],
    queryFn: async () => {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("displayName", "==", displayName))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }
      
      const userDoc = querySnapshot.docs[0]
      return { id: userDoc.id, ...userDoc.data() } as any
    }
  })

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['public-links', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return []
      const q = query(
        collection(db, "users", userData.id, "links"),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
    },
    enabled: !!userData?.id,
  })

  // Handle 404
  if (!isUserLoading && !userData && !error) {
    notFound()
  }

  if (isUserLoading || isLinksLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  const handleLinkClick = (linkId: string) => {
    if (userData?.id) {
      const linkRef = doc(db, "users", userData.id, "links", linkId);
      updateDoc(linkRef, {
        clickCount: increment(1)
      }).catch(console.error);
    }
  };

  const realName = userData?.username || "사용자 이름"
  const bio = userData?.bio || ""

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <div className="z-10 flex w-full max-w-md flex-col gap-6 mt-16 mb-12 px-6">
        {/* Profile Area */}
        <div className="mb-4 text-center flex flex-col items-center">
          <div className="relative w-28 h-28 mx-auto mb-4">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg" />
            ) : (
              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center border-4 border-background shadow-lg text-2xl font-bold">
                {realName.charAt(0) || "U"}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">{realName}</h1>
          <p className="text-primary font-medium mb-2">@{displayName}</p>
          {bio && <p className="text-muted-foreground font-medium">{bio}</p>}
        </div>

        {/* Links Area */}
        <div className="flex flex-col gap-4">
          {links.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">아직 추가된 링크가 없습니다.</p>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                className="block w-full outline-none group"
              >
                <Card className="relative w-full flex items-center p-4 overflow-hidden border border-border/50 bg-background/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:bg-background/80 hover:border-primary/50 group-hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mr-4 shrink-0 overflow-hidden shadow-inner border border-border/50">
                    <img 
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(link.url)}`} 
                      alt="" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span className="font-semibold text-lg text-foreground/90 group-hover:text-primary transition-colors flex-1 truncate text-left">{link.title}</span>
                </Card>
              </a>
            ))
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="z-10 mt-auto py-6">
        <a href="/" className="text-sm font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Create your own MyLink
        </a>
      </footer>
    </div>
  )
}
