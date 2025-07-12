"use client";

import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { GitHubRepository } from "@/hooks/useGitHub";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useState } from "react";

interface DataContextType {
  repositories: GitHubRepository[] | undefined;
  repositoriesLength: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: session } = useSession();
  const { data: repositoriesLength } = useQuery({
    queryKey: ["repositoriesLength"],
    queryFn: () => authenticatedFetcher<number>("/github/repositories/length"),
    enabled: !!session,
  });

  const refetch = () => {
    // Logic to refetch data
  };

  console.log("repositoriesLength", repositoriesLength);

  return (
    <DataContext.Provider
      value={{
        repositories,
        repositoriesLength: repositoriesLength ?? null,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}
