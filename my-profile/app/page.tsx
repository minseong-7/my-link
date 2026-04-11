import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 sm:p-12">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animate-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animate-delay-4000"></div>
      </div>

      <main className="w-full max-w-4xl relative z-10 glass-panel rounded-3xl p-8 sm:p-12 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
          
          {/* Profile Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 flex-1">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#030014]/50">
                <Image
                  src="/profile.png"
                  alt="김민성"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition duration-500"
                  priority
                />
              </div>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 [font-family:var(--font-heading)] mb-2">
                김민성
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-cyan-400 mb-4">
                Software Engineering Student
              </p>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                한양대학교 컴퓨터소프트웨어학부에서 공부하고 있습니다. 
                새로운 기술을 배우고 창의적인 문제 해결을 통해 성장하는 것을 즐깁니다.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-2">
              <SocialLink href="#" label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </SocialLink>
              <SocialLink href="#" label="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </SocialLink>
              <SocialLink href="#" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </SocialLink>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 w-full lg:w-auto h-full flex flex-col gap-8 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12">
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="cyan" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Interests & Hobbies
              </h2>
              <div className="flex flex-wrap gap-3">
                {["여행 ✈️", "맛집 탐방 🍕", "예능 시청 📺", "독서 📚", "음악 감상 🎧"].map((hobby) => (
                  <span
                    key={hobby}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20 cursor-default"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="fuchsia" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Current Focus
              </h2>
              <div className="space-y-4">
                <FocusItem title="Web Architectures" description="Next.js 및 React 생태계를 활용한 모던 웹 개발" />
                <FocusItem title="System Programming" description="자료구조와 알고리즘 기반의 백엔드 시스템설계" />
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="mt-12 text-sm text-gray-500 relative z-10 animate-fade-in animate-delay-1000">
        © {new Date().getFullYear()} 김민성. Crafted with passion & Next.js.
      </footer>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 hover:bg-white/10 hover:border-cyan-400/50 transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20"
    >
      {children}
    </a>
  );
}

function FocusItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
