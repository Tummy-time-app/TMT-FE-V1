"use client";

import { useState } from "react";
import { useListUsersQuery } from "@/features/admin/adminUsersApi";
import type { AdminUser } from "@/features/admin/types";
import { AdminTable, type AdminTableColumn } from "./AdminTable";

const LIMIT = 20;

/** Rendered inside AdminPortalShell. Read-only for this pass — no suspend/ban action yet. */
export function AdminCustomersView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useListUsersQuery({ page, limit: LIMIT });

  const columns: AdminTableColumn<AdminUser>[] = [
    { key: "name", label: "Name", render: (u) => u.name },
    { key: "email", label: "Email", render: (u) => u.email },
    { key: "role", label: "Role", render: (u) => u.role },
    { key: "verified", label: "Email verified", render: (u) => (u.isEmailVerified ? "Yes" : "No") },
  ];

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Customers</h1>
        <p className="vd-subtitle">Every platform account, all roles.</p>
      </header>

      <AdminTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No users yet."
        pagination={data ? { page: data.pagination.page, totalPages: data.pagination.totalPages, onPageChange: setPage } : undefined}
      />
    </>
  );
}
