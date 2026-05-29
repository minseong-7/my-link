import { Metadata } from 'next'
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

type Props = {
  params: { displayName: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const displayName = params.displayName;
  
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("displayName", "==", displayName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        title: '사용자를 찾을 수 없습니다 | MyLink',
      }
    }
    
    const userData = querySnapshot.docs[0].data();
    const realName = userData.username || "사용자";
    const bio = userData.bio || `${realName}님의 모든 링크를 한 곳에서 확인하세요.`;
    
    return {
      title: `${realName} (@${displayName}) | MyLink`,
      description: bio,
      openGraph: {
        title: `${realName} (@${displayName}) | MyLink`,
        description: bio,
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${realName} (@${displayName}) | MyLink`,
        description: bio,
      }
    }
  } catch (error) {
    return {
      title: `${displayName} | MyLink`,
    }
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
