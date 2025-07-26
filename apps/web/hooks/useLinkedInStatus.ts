import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useLinkedInStatus() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const user = session?.user;
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const linkedinStatus = searchParams.get("linkedin");
    if (linkedinStatus === "success" && !hasRefreshed) {
      setHasRefreshed(true);
      updateSession();
      router.push("/dashboard");
    }
  }, [searchParams, updateSession, hasRefreshed]);

  // Considérer connecté si on a un linkedInId OU un access token
  const isConnected = !!(user?.linkedInId || user?.linkedinAccessToken);

  return {
    isConnected,
    user,
    session,
  };
}
