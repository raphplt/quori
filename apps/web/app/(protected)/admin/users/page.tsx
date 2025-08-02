"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthenticatedQuery, authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

interface AdminUser extends User {
  postsCount: number;
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminUsersContent />
    </ProtectedRoute>
  );
}

function AdminUsersContent() {
  const { data, refetch } = useAuthenticatedQuery<AdminUser[]>(
    ["admin-users"],
    "/admin/users"
  );

  const handleDelete = async (id: string) => {
    await authenticatedFetcher(`/admin/users/${id}`, { method: "DELETE" });
    refetch();
  };

  if (!data) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Utilisateur</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Posts</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="px-4 py-2">{u.username}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.postsCount}</td>
              <td className="px-4 py-2 text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(u.id)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
