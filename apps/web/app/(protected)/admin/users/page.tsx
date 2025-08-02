"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useAuthenticatedQuery,
  authenticatedFetcher,
} from "@/hooks/useAuthenticatedQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  postsCount: number;
}

interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersResponse {
  data: AdminUser[];
  pagination: UsersPagination;
}

// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

// Reusable sortable header component
const SortableHead: React.FC<{
  label: string;
  field: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  onSort: (field: string) => void;
}> = React.memo(
  ({
    label,
    field,
    sortBy,
    sortOrder,
    onSort,
  }: {
    label: string;
    field: string;
    sortBy: string;
    sortOrder: "ASC" | "DESC";
    onSort: (field: string) => void;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSort(field)}
    >
      {label}
      {sortBy === field && (
        <span className="ml-1">{sortOrder === "ASC" ? "↑" : "↓"}</span>
      )}
    </TableHead>
  )
);

SortableHead.displayName = "SortableHead";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminUsersContent />
    </ProtectedRoute>
  );
}

function AdminUsersContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<keyof AdminUser>("username");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const pageSize = 10;

  const params = useMemo(() => {
    const qs = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      sortBy: sortBy as string,
      sortOrder,
      ...(debouncedSearch && { search: debouncedSearch }),
    });
    return qs.toString();
  }, [page, pageSize, sortBy, sortOrder, debouncedSearch]);

  const queryKey = useMemo(
    () => ["admin-users", { page, debouncedSearch, sortBy, sortOrder }],
    [page, debouncedSearch, sortBy, sortOrder]
  );

  const { data, refetch, isLoading } = useAuthenticatedQuery<UsersResponse>(
    queryKey,
    `/admin/users?${params}`
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder(prev => (prev === "ASC" ? "DESC" : "ASC"));
      } else {
        setSortBy(field as keyof AdminUser);
        setSortOrder("ASC");
      }
    },
    [sortBy]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
        return;
      try {
        await authenticatedFetcher(`/admin/users/${id}`, { method: "DELETE" });
        refetch();
      } catch (err) {
        console.error(err);
        alert("Impossible de supprimer cet utilisateur.");
      }
    },
    [refetch]
  );

  if (isLoading) {
    return <div className="p-4">Chargement...</div>;
  }

  if (!data) {
    return <div className="p-4 text-red-600">Erreur de chargement</div>;
  }

  const { data: users, pagination } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Gestion des utilisateurs</h1>

      <Input
        placeholder="Rechercher par nom ou email..."
        value={search}
        onChange={handleSearch}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Utilisateur"
              field="username"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortableHead
              label="Email"
              field="email"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <TableHead>Posts</TableHead>
            <SortableHead
              label="Créé le"
              field="createdAt"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center">
                {debouncedSearch ? "Aucun résultat" : "Pas d'utilisateurs."}
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.postsCount}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Affichage {Math.min((page - 1) * pageSize + 1, pagination.total)}–
          {Math.min(page * pageSize, pagination.total)} sur {pagination.total}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage(p => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
