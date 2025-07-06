"use client";
import { useGitHubRepositories } from "@/hooks/useGitHub";
import { useSession } from "next-auth/react";
import React from "react";

const Repositories = () => {
  const { data: session, status } = useSession();
  const { data: repositories, isLoading, error } = useGitHubRepositories();

  if (status === "loading") {
    return <div>Chargement de la session...</div>;
  }

  if (!session) {
    return <div>Veuillez vous connecter pour voir vos repositories</div>;
  }

  if (isLoading) {
    return <div>Chargement des repositories...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Erreur: {error instanceof Error ? error.message : "Erreur inconnue"}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Mes repositories GitHub ({repositories?.length || 0})
      </h2>

      {repositories && repositories.length > 0 ? (
        <div className="grid gap-4">
          {repositories.map(repo => (
            <div
              key={repo.id}
              className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {repo.name}
                    </a>
                  </h3>
                  <p className="text-gray-600 text-sm">{repo.full_name}</p>
                  {repo.description && (
                    <p className="text-gray-700 mt-2">{repo.description}</p>
                  )}
                </div>
                <div className="ml-4">
                  {repo.private ? (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      Privé
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Public
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-sm text-gray-600">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    📝 {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  ⭐ {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  🍴 {repo.forks_count}
                </span>
              </div>

              <div className="text-xs text-gray-500 mt-3">
                Mis à jour:{" "}
                {new Date(repo.updated_at).toLocaleDateString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Aucun repository trouvé</p>
      )}
    </div>
  );
  return <div></div>;
};

export default Repositories;
