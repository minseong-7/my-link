"use client"

import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc, where, getDocs } from "firebase/firestore"
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const urlRegex = /^(https?:\/\/)?((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-zA-Z\d%_.~+]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[a-zA-Z\d_]*)?$/i;

const linkSchema = z.object({
  title: z.string().trim().min(1, { message: "제목을 입력해주세요." }),
  url: z.string().trim()
    .min(1, { message: "URL을 입력해주세요." })
    .regex(urlRegex, { message: "올바른 URL 형식(예: example.com 또는 https://example.com)을 입력해주세요." })
})

type LinkFormValues = z.infer<typeof linkSchema>

const profileSchema = z.object({
  username: z.string().trim().min(1, { message: "이름을 입력해주세요." }),
  bio: z.string().trim().max(100, { message: "소개글은 100자 이내로 작성해주세요." }).optional()
})

type ProfileFormValues = z.infer<typeof profileSchema>

function LinkItem({ link, userId }: { link: any, userId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link.title,
      url: link.url,
    },
    mode: "onSubmit",
  })

  const updateMutation = useMutation({
    mutationFn: async (data: LinkFormValues) => {
      let finalUrl = data.url
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      await updateDoc(doc(db, "users", userId, "links", link.id), {
        title: data.title,
        url: finalUrl,
        updatedAt: new Date().toISOString(),
      });
      return { ...link, title: data.title, url: finalUrl };
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['links', userId] });
      const previousLinks = queryClient.getQueryData(['links', userId]);
      
      let finalUrl = newData.url
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }
      queryClient.setQueryData(['links', userId], (old: any) => 
        old?.map((l: any) => l.id === link.id ? { ...l, title: newData.title, url: finalUrl } : l)
      );
      return { previousLinks };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['links', userId], context?.previousLinks);
      console.error("Error updating document: ", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links', userId] });
    },
    onSuccess: () => {
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      await deleteDoc(doc(db, "users", userId, "links", link.id));
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['links', userId] });
      const previousLinks = queryClient.getQueryData(['links', userId]);
      queryClient.setQueryData(['links', userId], (old: any) => 
        old?.filter((l: any) => l.id !== link.id)
      );
      return { previousLinks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['links', userId], context?.previousLinks);
      console.error("Error deleting document: ", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links', userId] });
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
    }
  });

  const onUpdate = (data: LinkFormValues) => updateMutation.mutate(data);
  const onDelete = () => deleteMutation.mutate();

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
            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
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
                  <div className="flex-1 min-w-0 mr-2">
                    <span className="font-semibold text-lg text-foreground/90 group-hover:text-primary transition-colors block truncate text-left">{link.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground/70 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    <span className="text-xs font-semibold">{link.clickCount || 0}</span>
                  </div>
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
              <Button type="button" variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthChecking(false)
    })
    return () => unsubscribeAuth()
  }, [])

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const defaultEmailPrefix = user.email ? user.email.split('@')[0] : user.uid;
        const newProfile = {
          uid: user.uid,
          email: user.email,
          displayName: defaultEmailPrefix, // URL ID
          username: user.displayName, // Real Name
          photoURL: user.photoURL,
          bio: "",
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
      return userSnap.data();
    },
    enabled: !!user,
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['links', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "users", user.uid, "links"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!user,
  });

  const isLoading = isProfileLoading || isLinksLoading;

  const emailPrefix = profileData?.displayName || (user?.email ? user.email.split('@')[0] : user?.uid || "");
  const realName = profileData?.username || user?.displayName || "사용자 이름";
  const bio = profileData?.bio || "짧은 소개글을 입력해주세요.";

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

  const addLinkMutation = useMutation({
    mutationFn: async (data: LinkFormValues) => {
      let finalUrl = data.url
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      const newDoc = {
        title: data.title,
        url: finalUrl,
        createdAt: new Date().toISOString(),
        clickCount: 0,
      };
      const docRef = await addDoc(collection(db, "users", user!.uid, "links"), newDoc);
      return { id: docRef.id, ...newDoc };
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['links', user?.uid] });
      const previousLinks = queryClient.getQueryData(['links', user?.uid]);
      let finalUrl = newData.url
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }
      queryClient.setQueryData(['links', user?.uid], (old: any) => [
        { id: "temp-" + Date.now(), title: newData.title, url: finalUrl, createdAt: new Date().toISOString(), clickCount: 0 },
        ...(old || [])
      ]);
      return { previousLinks };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['links', user?.uid], context?.previousLinks);
      console.error("Error adding document: ", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
    },
    onSuccess: () => {
      reset();
      setIsDialogOpen(false);
    }
  });

  const onSubmit = async (data: LinkFormValues) => {
    if (!user) return;
    await addLinkMutation.mutateAsync(data);
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) reset()
  }

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      bio: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (isProfileDialogOpen && profileData) {
      resetProfile({
        username: profileData.username || "",
        bio: profileData.bio || "",
      });
    }
  }, [isProfileDialogOpen, profileData, resetProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await updateDoc(doc(db, "users", user!.uid), data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['profile', user?.uid] });
      const previousProfile = queryClient.getQueryData(['profile', user?.uid]);
      
      queryClient.setQueryData(['profile', user?.uid], (old: any) => ({
        ...old,
        username: newData.username,
        bio: newData.bio || "",
      }));
      return { previousProfile };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['profile', user?.uid], context?.previousProfile);
      console.error("Failed to update profile", err);
      toast.error("프로필 업데이트에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
    },
    onSuccess: () => {
      toast.success("프로필이 업데이트 되었습니다.");
      setIsProfileDialogOpen(false);
    }
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    // 변경된 사항이 없는지 확인
    const currentUsername = profileData?.username || "";
    const currentBio = profileData?.bio || "";
    
    if (
      data.username === currentUsername &&
      (data.bio || "") === currentBio
    ) {
      toast.info("변경된 사항이 없습니다.");
      setIsProfileDialogOpen(false);
      return;
    }

    await updateProfileMutation.mutateAsync({
      username: data.username,
      bio: data.bio || "",
      updatedAt: new Date().toISOString(),
    });
  };

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
    const url = `${window.location.origin}/${emailPrefix}`
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다.", {
        description: "이제 원하는 곳에 링크를 공유해 보세요."
      });
    } catch (err) {
      console.error("Failed to copy!", err);
      toast.error("링크 복사에 실패했습니다.", {
        description: "다시 시도해 주세요."
      });
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
      <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/30 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />

        {/* Header */}
        <header className="w-full flex items-center justify-between p-6 z-20 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-primary-foreground shadow-lg">M</div>
            <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">MyLink</span>
          </div>
          <Button onClick={handleLogin} variant="outline" className="rounded-full px-6 font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
            로그인
          </Button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
            {/* Text Content */}
            <div className="flex flex-col gap-8 text-left max-w-xl mx-auto md:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary w-fit shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="text-sm font-semibold tracking-wide">쉽고 빠른 링크 관리</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                하나의 링크로<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-500">
                  모든 것을 연결하세요
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                나만의 맞춤형 프로필 페이지를 만들고 흩어져 있는 SNS, 블로그, 포트폴리오를 한 곳에 모아 공유해보세요.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={handleLogin} size="lg" className="h-14 px-8 text-base font-bold shadow-lg shadow-primary/25 rounded-full hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google로 3초 만에 시작하기
                </Button>
              </div>
            </div>

            {/* Visual/Mockup Content */}
            <div className="relative w-full h-[500px] hidden md:flex items-center justify-center" style={{ perspective: "1000px" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
              
              {/* Mockup Phone/Card */}
              <div 
                className="relative w-[300px] h-[550px] bg-background/80 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-2xl p-6 flex flex-col items-center gap-4 group transition-all duration-700 ease-out hover:!transform-none"
                style={{ transform: "rotateY(-15deg) rotateX(10deg)" }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border/50 rounded-b-xl" />
                
                {/* Profile */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-1 mt-6 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden border-2 border-background">
                    <span className="text-4xl">🧑‍💻</span>
                  </div>
                </div>
                <h3 className="font-bold text-xl mt-2">개발자 김링크</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">나를 표현하는 단 하나의 링크</p>
                
                {/* Mock Links */}
                <div className="w-full flex flex-col gap-3">
                  {[
                    { title: "포트폴리오 보기", icon: "🌐", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                    { title: "GitHub", icon: "💻", color: "bg-foreground/5 text-foreground border-border/50" },
                    { title: "기술 블로그", icon: "✍️", color: "bg-primary/10 text-primary border-primary/20" },
                  ].map((item, i) => (
                    <div key={i} className={`w-full p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md shadow-sm transform transition-all duration-300 hover:scale-[1.02] cursor-pointer ${item.color}`}>
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-semibold">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 -left-12 p-4 bg-background/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-3xl">🚀</span>
              </div>
              <div className="absolute bottom-32 -right-8 p-4 bg-background/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <span className="text-3xl">✨</span>
              </div>
            </div>
          </div>
        </main>
        
        {/* Features / Steps Section */}
        <section className="relative w-full py-20 md:py-32 z-10">
          {/* Subtle separator */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Decorative elements for this section */}
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-secondary-foreground w-fit shadow-sm mb-6">
                <span className="text-sm font-semibold tracking-wide">어떻게 사용하나요?</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                단 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">3단계</span>로 완성하는<br className="md:hidden" /> 나만의 공간
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />
              
              {[
                { step: "1", title: "빠른 가입하기", desc: "구글 계정으로 1초 만에\n번거로움 없이 가입하세요.", icon: "🔑" },
                { step: "2", title: "링크 추가하기", desc: "공유하고 싶은\n나만의 링크들을 마음껏 추가하세요.", icon: "➕" },
                { step: "3", title: "널리 공유하기", desc: "완성된 프로필 링크를\n인스타그램, 블로그에 공유하세요.", icon: "🚀" },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center p-8 bg-background/60 backdrop-blur-xl rounded-[2rem] border border-border/50 shadow-xl group hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 ease-out">
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-primary-foreground flex items-center justify-center text-xl font-black shadow-lg shadow-primary/25 transform group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 mt-4 mb-6 rounded-full bg-secondary/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative w-full py-12 text-center z-10">
          <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 font-bold text-xl grayscale opacity-50">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-sm">M</div>
              <span>MyLink</span>
            </div>
            <p className="text-muted-foreground/70 text-sm">© {new Date().getFullYear()} MyLink. All rights reserved.</p>
          </div>
        </footer>
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
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="flex h-8 px-2 sm:px-3 text-xs font-medium border-primary/20 hover:bg-primary/5" onClick={() => window.open(`/${emailPrefix}`, '_blank')} title="내 페이지 보기">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:mr-2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="hidden sm:inline">내 페이지</span>
          </Button>
          <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border text-sm font-bold">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform text-muted-foreground ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 z-50">
              <div className="flex flex-col p-4 border-b border-border/50 bg-muted/20">
                <p className="font-semibold text-sm truncate">{user.displayName || "사용자 이름"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email || ""}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Button variant="ghost" className="w-full justify-start text-sm h-9 px-3 font-normal" onClick={() => { setIsDropdownOpen(false); window.open(`/${emailPrefix}`, '_blank'); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-70"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  내 페이지 보기
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-9 px-3 font-normal" onClick={() => { setIsDropdownOpen(false); handleShare(); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-70"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                  공유하기
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-9 px-3 font-normal" onClick={() => { setIsDropdownOpen(false); router.push('/stats'); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-70"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  통계 보기
                </Button>
              </div>
              <div className="p-2 border-t border-border/50">
                <Button variant="ghost" className="w-full justify-start text-sm h-9 px-3 font-normal text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-70"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  로그아웃
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>
      </header>

      <div className="z-10 flex w-full max-w-md flex-col gap-6 mt-8 mb-12 px-6">
        {/* Profile Area */}
        <div className="mb-4 text-center flex flex-col items-center">
          <div className="relative w-28 h-28 mx-auto mb-4" onClick={() => setIsProfileDialogOpen(true)}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg cursor-pointer" />
            ) : (
              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center border-4 border-background shadow-lg text-2xl font-bold cursor-pointer">
                {realName.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-background p-1.5 rounded-full border border-border shadow-sm cursor-pointer hover:bg-muted transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1 cursor-pointer group" onClick={() => setIsProfileDialogOpen(true)}>
            <h1 className="text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{realName}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-muted-foreground opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </div>
          <div className="flex items-center gap-2 mb-2 cursor-pointer group text-primary font-medium" onClick={() => setIsProfileDialogOpen(true)}>
            <p>@{emailPrefix}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium cursor-pointer group" onClick={() => setIsProfileDialogOpen(true)}>
            <p>{bio}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-muted-foreground opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </div>
        </div>

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>프로필 수정</DialogTitle>
              <DialogDescription>
                이름과 소개글을 변경할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">이름 (디스플레이 이름)</Label>
                  <Input 
                    id="username" 
                    placeholder="예: 홍길동" 
                    aria-invalid={!!profileErrors.username}
                    {...registerProfile("username")}
                  />
                  {profileErrors.username && <p className="text-sm font-medium text-destructive">{profileErrors.username.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="bio">소개글</Label>
                  <Input 
                    id="bio" 
                    placeholder="짧은 소개글을 입력해주세요." 
                    aria-invalid={!!profileErrors.bio}
                    {...registerProfile("bio")}
                  />
                  {profileErrors.bio && <p className="text-sm font-medium text-destructive">{profileErrors.bio.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>취소</Button>
                <Button type="submit" disabled={isProfileSubmitting}>
                  {isProfileSubmitting ? "저장 중..." : "저장하기"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
