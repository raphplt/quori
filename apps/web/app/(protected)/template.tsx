"use client";

import { Spinner } from "@/components/ui/spinner";
import { baseRoute } from "@/utils/routes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
};

const Template = ({ children }: Props) => {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(baseRoute);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="large" />
          <div className="text-center">
            <p className="text-muted-foreground">
              Vérification de l&apos;authentification...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="large" />
          <div className="text-center">
            <p className="text-muted-foreground">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Template;
