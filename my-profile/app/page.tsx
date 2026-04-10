export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-12 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            김민성
          </h1>
          <p className="text-xl font-medium text-zinc-600 dark:text-zinc-400">
            한양대학교 컴퓨터소프트웨어학부
          </p>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Interests & Hobbies
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["예능 시청", "여행", "맛집 탐방"].map((hobby) => (
              <span
                key={hobby}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {hobby}
              </span>
            ))}
          </div>
        </section>

        <footer className="mt-8 text-sm text-zinc-500">
          © {new Date().getFullYear()} 김민성. Built with Next.js.
        </footer>
      </main>
    </div>
  );
}
