export type Link = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

export const DUMMY_LINKS: Link[] = [
  {
    id: "1",
    title: "인스타그램",
    url: "https://instagram.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "유튜브",
    url: "https://youtube.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "블로그",
    url: "https://blog.example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "GitHub",
    url: "https://github.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "포트폴리오",
    url: "https://portfolio.example.com",
    createdAt: new Date().toISOString(),
  },
];
