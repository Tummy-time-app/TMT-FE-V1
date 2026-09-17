"use client";

import type { ReactNode } from "react";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

export interface AdminTablePagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * One reusable paginated table shared by every admin list page (Orders/
 * Vendors/Riders/Customers) — no pagination pattern existed anywhere in
 * this codebase before the Admin dashboard (every other list view fetches
 * everything and filters client-side), so this is built fresh rather than
 * copied from components/vendor-portal/StoreEarnings.tsx's small
 * unpaginated `vd-table`.
 */
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  emptyMessage = "Nothing to show yet.",
  pagination,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  pagination?: AdminTablePagination;
}) {
  if (isLoading) {
    return <p className="vp-empty">Loading…</p>;
  }

  if (isError) {
    return (
      <div className="vp-empty">
        <p className="vp-empty-title">Couldn&apos;t load this list</p>
        <p className="vp-empty-sub">Please check your connection and try again.</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="vp-empty">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="ad-pagination">
          <button
            type="button"
            className="rd-btn rd-btn--ghost"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="ad-pagination__label">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="rd-btn rd-btn--ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
