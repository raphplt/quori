import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useLinkedInStatus() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const linkedinStatus = searchParams.get("linkedin");
  const user = session?.user;
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    if (linkedinStatus === "success" && !hasRefreshed) {
      setHasRefreshed(true);
      updateSession().then(() => {
        const params = new URLSearchParams(window.location.search);
        params.delete("linkedin");
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
      });
    }
  }, [linkedinStatus, updateSession, hasRefreshed]);

  return {
    isConnected: !!user?.linkedInId,
    user,
    session,
  };
}
