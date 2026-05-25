import { DUMMY_LINKS } from "@/data/links"
import { Card } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="relative flex min-h-svh flex-col items-center p-6 overflow-hidden bg-background">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <div className="z-10 flex w-full max-w-md flex-col gap-6 mt-12 mb-12">
        <div className="mb-4 text-center">
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-secondary/50 rounded-full animate-pulse blur-xl opacity-70"></div>
            <div className="relative w-full h-full bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-primary/20 shadow-xl">
              <span className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">ML</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Links</h1>
          <p className="text-muted-foreground font-medium">Welcome to my digital space</p>
        </div>

        <div className="flex flex-col gap-4">
          {DUMMY_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full group outline-none"
            >
              <Card className="relative w-full flex items-center p-4 overflow-hidden border border-border/50 bg-background/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:bg-background/80 hover:border-primary/50 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-primary">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mr-4 shrink-0 overflow-hidden shadow-inner border border-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(link.url)}`} 
                    alt="" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="font-semibold text-lg text-foreground/90 group-hover:text-primary transition-colors flex-1 truncate text-left">{link.title}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 ml-2 transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
