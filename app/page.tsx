"use client"

import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const urlRegex = /^(https?:\/\/)?((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-zA-Z\d%_.~+]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[a-zA-Z\d_]*)?$/i;

const linkSchema = z.object({
  title: z.string().trim().min(1, { message: "제목을 입력해주세요." }),
  url: z.string().trim()
    .min(1, { message: "URL을 입력해주세요." })
    .regex(urlRegex, { message: "올바른 URL 형식(예: example.com 또는 https://example.com)을 입력해주세요." })
})

type LinkFormValues = z.infer<typeof linkSchema>

function LinkItem({ link, userId }: { link: any, userId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link.title,
      url: link.url,
    },
    mode: "onSubmit",
  })

  const onUpdate = async (data: LinkFormValues) => {
    let finalUrl = data.url
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      await updateDoc(doc(db, "users", userId, "links", link.id), {
        title: data.title,
        url: finalUrl,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      await deleteDoc(doc(db, "users", userId, "links", link.id));
      setIsDeleteDialogOpen(false);
    } catch (e) {
      console.error("Error deleting document: ", e);
      setIsDeleting(false);
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false);
    reset({ title: link.title, url: link.url });
  }

  if (isEditing) {
    return (
      <Card className="relative w-full p-4 border border-primary/50 bg-background/80 shadow-md">
        <form onSubmit={handleSubmit(onUpdate)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`title-${link.id}`}>제목</Label>
            <Input 
              id={`title-${link.id}`} 
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`url-${link.id}`}>URL</Label>
            <Input 
              id={`url-${link.id}`} 
              aria-invalid={!!errors.url}
              {...register("url")}
            />
            {errors.url && <p className="text-sm font-medium text-destructive">{errors.url.message}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleEditCancel}>취소</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "갱신하기"}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <div className="relative group w-full">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full outline-none"
      >
        <Card className="relative w-full flex items-center p-4 pr-24 overflow-hidden border border-border/50 bg-background/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:bg-background/80 hover:border-primary/50 group-hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary">
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
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
          title="수정"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </Button>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger 
            render={
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDeleteDialogOpen(true); }}
                title="삭제"
              />
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>정말 삭제하겠습니까?</DialogTitle>
              <DialogDescription className="pt-3 flex flex-col gap-2">
                <span><strong className="text-foreground text-base">'{link.title}'</strong> 링크를 삭제합니다.</span>
                <span className="text-destructive font-semibold">이 작업은 되돌릴 수 없습니다.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "삭제하기"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function Page() {
  const [links, setLinks] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthChecking(false)
      if (!currentUser) {
        setIsLoading(false)
        setLinks([])
      }
    })
    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const minLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    const q = query(
      collection(db, "users", user.uid, "links"),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLinks(fetchedLinks);
    });

    return () => {
      clearTimeout(minLoadingTimer);
      unsubscribe();
    };
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
    mode: "onChange",
  })

  const onSubmit = async (data: LinkFormValues) => {
    if (!user) return;
    let finalUrl = data.url
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      await addDoc(collection(db, "users", user.uid, "links"), {
        title: data.title,
        url: finalUrl,
        createdAt: new Date().toISOString(),
      });

      reset()
      setIsDialogOpen(false)
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) reset()
  }

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }
  
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
  
  const handleShare = async () => {
    if (!user) return;
    const url = `${window.location.origin}/${user.uid}`
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  if (isAuthChecking) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative flex min-h-svh flex-col items-center justify-center p-6 overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />
        <div className="z-10 flex w-full max-w-md flex-col gap-6 text-center bg-background/60 p-8 rounded-2xl border border-border/50 shadow-2xl backdrop-blur-lg">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-secondary/50 rounded-full animate-pulse blur-xl opacity-70"></div>
            <div className="relative w-full h-full bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-primary/20 shadow-xl">
              <span className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">ML</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">MyLink</h1>
          <p className="text-muted-foreground text-base">
            나만의 프로필 페이지를 만들고<br/>여러 링크를 한 곳에서 관리하세요.<br/><br/>로그인하여 첫 번째 링크를 추가하고<br/>방문자에게 나를 알려보세요!
          </p>
          <Button onClick={handleLogin} size="lg" className="w-full h-14 mt-4 text-base font-bold shadow-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google 계정으로 시작하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="z-20 w-full flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">MyLink</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>공유</Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`/${user.uid}`, '_blank')}>내 페이지 보기</Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>로그아웃</Button>
        </div>
      </header>

      <div className="z-10 flex w-full max-w-md flex-col gap-6 mt-8 mb-12 px-6">
        {/* Profile Area */}
        <div className="mb-4 text-center flex flex-col items-center">
          <div className="relative w-28 h-28 mx-auto mb-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg" />
            ) : (
              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center border-4 border-background shadow-lg text-2xl font-bold">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-background p-1.5 rounded-full border border-border shadow-sm cursor-pointer hover:bg-muted transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1 cursor-pointer group">
            <h1 className="text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{user.displayName || "사용자 이름"}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-muted-foreground opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium cursor-pointer group">
            <p>짧은 소개글을 입력해주세요.</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-muted-foreground opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger 
              render={
                <Button className="w-full h-14 shadow-md hover:shadow-lg transition-all font-semibold text-base" />
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              새 링크 추가
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>새 링크 추가</DialogTitle>
                <DialogDescription>
                  추가할 링크의 제목과 URL을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">제목</Label>
                    <Input 
                      id="title" 
                      placeholder="예: 내 기술 블로그" 
                      aria-invalid={!!errors.title}
                      {...register("title")}
                    />
                    {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input 
                      id="url" 
                      placeholder="예: blog.example.com" 
                      aria-invalid={!!errors.url}
                      {...register("url")}
                    />
                    {errors.url && <p className="text-sm font-medium text-destructive">{errors.url.message}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>취소</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        추가 중...
                      </>
                    ) : "추가하기"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-muted-foreground font-medium animate-pulse">링크를 불러오는 중입니다...</p>
            </div>
          ) : links.length === 0 ? (
             <div className="text-center p-8 mt-4 text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/30 backdrop-blur-sm">
               아직 등록된 링크가 없습니다.<br/>위 버튼을 눌러 새로운 링크를 추가해 보세요!
             </div>
          ) : (
            links.map((link) => (
              <LinkItem key={link.id} link={link} userId={user.uid} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
