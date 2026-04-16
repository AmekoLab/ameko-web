"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAdminUserList } from "@/src/store/slices/adminUsersSlice";
import CreateUserModal from "@/src/components/Admin/CreateUserModal";
import EditUserModal from "@/src/components/Admin/EditUserModal";
import { AdminUserItem } from "@/src/types/admin.types";

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsersPage");
  const dispatch = useAppDispatch();
  const { userList, loading, pagination } = useAppSelector(
    (state) => state.adminUsers,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchAdminUserList({ currentPage, pageSize }));
  }, [dispatch, currentPage]);

  const renderRoleBadge = (role: string) => {
    const baseClasses =
      "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
    switch (role) {
      case "Admin":
        return (
          <span
            className={`${baseClasses} bg-purple-50 text-purple-700 border-purple-200`}
          >
            {t("roleAdmin")}
          </span>
        );
      case "Shop":
        return (
          <span
            className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}
          >
            {t("roleShop")}
          </span>
        );
      case "Customer":
        return (
          <span
            className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}
          >
            {t("roleCustomer")}
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}
          >
            {role}
          </span>
        );
    }
  };

  const renderEmailBadge = (confirmed: boolean) => {
    return confirmed ? (
      <span className="text-green-600">{t("emailVerified")}</span>
    ) : (
      <span className="text-amber-600">{t("emailUnverified")}</span>
    );
  };

  const renderStatusBadge = (status: number) => {
    const baseClasses =
      "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
    switch (status) {
      case 0:
        return (
          <span
            className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}
          >
            {t("statusActive")}
          </span>
        );
      case 1:
        return (
          <span
            className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}
          >
            {t("statusBanned")}
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}
          >
            {t("statusUnknown")}
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-amazon-text leading-tight">
            {t("title")}
          </h1>
          <p className="text-[11px] text-amazon-textMuted">{t("subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-[10px] text-amazon-textMuted">
            {t("totalLabel")}{" "}
            <strong className="text-amazon-text mx-1">
              {pagination?.totalCount || 0}
            </strong>{" "}
            {t("usersLabel")}
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white border border-amazon-border shadow-sm text-xs font-medium text-amazon-text px-3 py-1.5 rounded-sm hover:bg-neutral-50 transition-colors"
          >
            {t("createUser")}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-amazon-border shadow-sm rounded-md overflow-hidden flex flex-col">
        {loading && userList.length === 0 ? (
          <div className="p-12 text-center text-amazon-textMuted text-[11px]">
            {t("loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-amazon-border">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableUser")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableContact")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableRole")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableEmailStatus")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableStatus")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableCreatedAt")}
                  </th>
                  <th className="px-3 py-2 text-center text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-amazon-border hover:bg-neutral-50 transition-colors"
                  >
                    {/* Col 1: User Info */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-sm relative overflow-hidden shrink-0 flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={t("avatarAlt")}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-sm bg-neutral-100 border border-amazon-border flex items-center justify-center text-[10px] text-amazon-textMuted font-bold">
                              U
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-amazon-text truncate max-w-[100px] lg:max-w-[140px]">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-amazon-textMuted mt-0.5">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Contact */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text">
                      <div
                        className="text-[11px] text-amazon-text truncate max-w-[120px] lg:max-w-[180px]"
                        title={user.email}
                      >
                        {user.email}
                      </div>
                      {user.phoneNumber && (
                        <div className="text-[10px] text-amazon-textMuted mt-0.5">
                          {user.phoneNumber}
                        </div>
                      )}
                    </td>

                    {/* Col 3: Role */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text">
                      {renderRoleBadge(user.roleName)}
                    </td>

                    {/* Col 4: Email Verified */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text whitespace-nowrap">
                      {renderEmailBadge(user.emailConfirmed)}
                    </td>

                    {/* Col 5: Status */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text">
                      {renderStatusBadge(user.status)}
                    </td>

                    {/* Col 6: Created At */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Col 7: Actions */}
                    <td className="px-3 py-2 text-center text-[11px] text-amazon-text">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors"
                        title={t("editUserTitle")}
                      >
                        {t("editUser")}
                      </button>
                    </td>
                  </tr>
                ))}

                {userList.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-amazon-textMuted text-[11px]"
                    >
                      {t("emptyNoUsers")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-amazon-border bg-white">
            <p className="text-[10px] text-amazon-textMuted">
              {t("pageLabel")}{" "}
              <strong className="font-medium text-amazon-text px-0.5">
                {pagination.currentPage} / {pagination.totalPages}
              </strong>{" "}
              — {pagination.totalCount} {t("usersTotalLabel")}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPreviousPage}
                className="bg-white border border-amazon-border text-[11px] font-medium text-amazon-text px-2 py-1 rounded-sm disabled:opacity-50 hover:bg-neutral-50 transition-colors"
              >
                {t("prev")}
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages),
                  )
                }
                disabled={!pagination.hasNextPage}
                className="bg-white border border-amazon-border text-[11px] font-medium text-amazon-text px-2 py-1 rounded-sm disabled:opacity-50 hover:bg-neutral-50 transition-colors"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          dispatch(fetchAdminUserList({ currentPage, pageSize }));
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        user={editingUser}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          dispatch(fetchAdminUserList({ currentPage, pageSize }));
        }}
      />
    </div>
  );
}
