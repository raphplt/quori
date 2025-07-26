import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useLinkedInStatus() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const user = session?.user;
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    const linkedinStatus = searchParams.get("linkedin");
    if (linkedinStatus === "success" && !hasRefreshed) {
      setHasRefreshed(true);
      // Délai pour éviter la boucle
      setTimeout(() => {
        updateSession();
      }, 100);
    }
  }, [searchParams, updateSession, hasRefreshed]);

  return {
    isConnected: !!user?.linkedInId,
    user,
    session,
  };
}
