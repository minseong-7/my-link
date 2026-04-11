import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      
      {/* Bento Grid Container */}
      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-neo-slide-up">
        
        {/* 1. Main Profile Card (Hero) */}
        <div className="neo-box bg-neo-yellow p-8 md:p-10 flex flex-col md:flex-row lg:flex-col xl:flex-row gap-8 items-center md:items-start lg:col-span-2 lg:row-span-2 col-span-1 md:col-span-2">
          {/* Profile Image with brutalist border */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-full"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-black bg-white">
              <Image
                src="/profile.png"
                alt="김민성"
                width={192}
                height={192}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>
          </div>
          
          <div className="flex flex-col text-center md:text-left">
            <div className="mb-2 inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider self-center md:self-start border-2 border-transparent transform -rotate-2">
              Hello World
            </div>
            <h1 className="text-5xl md:text-6xl font-black [font-family:var(--font-heading)] uppercase tracking-tight text-white mb-4 [text-shadow:_3px_3px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
              김민성
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white bg-black px-4 py-2 border-2 border-black mb-6 inline-block shadow-[4px_4px_0px_0px_#FFD166]">
              Software Engineering Student
            </h2>
            <p className="text-lg font-medium text-gray-900 leading-relaxed border-l-4 border-black pl-4 text-left bg-white/50 p-4">
              한양대학교 컴퓨터소프트웨어학부에서 공부하고 있습니다. 
              새로운 기술을 배우고 창의적인 문제 해결을 통해 성장하는 것을 즐깁니다.
            </p>
          </div>
        </div>

        {/* 2. Focus Area Card */}
        <div className="neo-box bg-neo-pink p-8 lg:col-span-2 md:col-span-2 col-span-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" className="w-8 h-8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <h2 className="text-3xl font-black uppercase text-black">Current Focus</h2>
          </div>
          
          <div className="grid gap-4">
            <FocusItem title="Web Architectures" description="Next.js 및 React 생태계를 활용한 모던 웹 개발 방식 탐구" />
            <FocusItem title="System Programming" description="자료구조와 알고리즘 기반의 백엔드 시스템 설계" />
          </div>
        </div>

        {/* 3. Hobbies Card */}
        <div className="neo-box bg-neo-blue p-8 lg:col-span-1 md:col-span-1 col-span-1 flex flex-col items-start justify-between">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black uppercase text-white">Interests</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["여행 ✈️", "맛집 탐방 🍕", "예능 시청 📺", "독서 📚", "음악 🎧"].map((hobby) => (
              <span
                key={hobby}
                className="px-3 py-1.5 bg-black text-white border-2 border-black font-bold text-base shadow-[2px_2px_0px_0px_#FFD166] whitespace-nowrap transform transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#FFD166]"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Social Links Card */}
        <div className="neo-box bg-neo-green p-8 lg:col-span-1 md:col-span-1 col-span-1 flex flex-col justify-center">
          <h2 className="text-2xl font-black uppercase text-black mb-6">Connect</h2>
          <div className="flex flex-col gap-4">
            <SocialLink href="#" label="GitHub">
              <span className="font-bold">GitHub</span>
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </SocialLink>
            <SocialLink href="#" label="Email">
               <span className="font-bold">Email</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-6 h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </SocialLink>
            <SocialLink href="#" label="Instagram" isLast>
               <span className="font-bold">Instagram</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </SocialLink>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-black font-bold border-t-4 border-black w-full max-w-6xl pt-6 text-center uppercase tracking-widest text-sm bg-white p-4 mx-4 neo-box mx-auto rotate-1 hover:rotate-0 transition-transform">
        © {new Date().getFullYear()} 김민성. Constructed with Next.js
      </footer>
    </div>
  );
}

function SocialLink({ href, label, children, isLast }: { href: string; label: string; children: React.ReactNode, isLast?: boolean }) {
  // Use a different color cycle for social links based on position if needed, or stick to one.
  const bgColors = ["bg-white", "bg-neo-yellow", "bg-neo-pink"];
  const bgColor = isLast ? "bg-white" : "bg-white";
  
  return (
    <a
      href={href}
      aria-label={label}
      className={`neo-btn ${bgColor} w-full flex items-center justify-between p-3 px-4 text-black decoration-transparent`}
    >
      {children}
    </a>
  );
}

function FocusItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border-4 border-black p-4 flex flex-col justify-center">
      <h3 className="text-xl font-black uppercase text-black mb-2">{title}</h3>
      <p className="text-black font-medium">{description}</p>
    </div>
  );
}
