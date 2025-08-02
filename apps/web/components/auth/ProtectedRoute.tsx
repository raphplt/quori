"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "../ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/auth/login",
  requiredRole,
}: ProtectedRouteProps) {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    } else if (
      status === "authenticated" &&
      requiredRole &&
      session?.user.role !== requiredRole
    ) {
      router.push("/");
    }
  }, [status, router, redirectTo, requiredRole, session?.user.role]);

  if (status === "loading") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Spinner />

            <p className="text-gray-600 mt-4">Veuillez patienter.</p>
          </div>
        </div>
      )
    );
  }

  if (
    status !== "authenticated" ||
    (requiredRole && session?.user.role !== requiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
}
