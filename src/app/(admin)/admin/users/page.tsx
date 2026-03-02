"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAdminUserList } from "@/src/store/slices/adminUsersSlice";
import {
  Calendar,
  Mail,
  Phone,
  User,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Pencil,
} from "lucide-react";
import CreateUserModal from "@/src/components/Admin/CreateUserModal";
import EditUserModal from "@/src/components/Admin/EditUserModal";
import { AdminUserItem } from "@/src/types/admin.types";

export default function AdminUsersPage() {
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

  // Helper: render role badge
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">
            Admin
          </span>
        );
      case "Shop":
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
            Shop
          </span>
        );
      case "Customer":
        return (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold uppercase">
            Customer
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">
            {role}
          </span>
        );
    }
  };

  // Helper: render email verified badge
  const renderEmailBadge = (confirmed: boolean) => {
    return confirmed ? (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <ShieldCheck className="w-3 h-3" /> Verified
      </span>
    ) : (
      <span className="flex items-center gap-1 text-xs text-yellow-600">
        <Shield className="w-3 h-3" /> Unverified
      </span>
    );
  };

  // Helper: render status
  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">
            Active
          </span>
        );
      case 1:
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">
            Banned
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase">
              User Management
            </h1>
            <p className="text-gray-500">
              Manage all registered users on the platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Total: <strong>{pagination?.totalCount || 0}</strong> users
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              Create User
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && userList.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Loading data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Email Status</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userList.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Col 1: User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Contact */}
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-800">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span
                          className="truncate max-w-[180px]"
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center gap-1 text-gray-500 mt-1">
                          <Phone className="w-3 h-3" />
                          {user.phoneNumber}
                        </div>
                      )}
                    </td>

                    {/* Col 3: Role */}
                    <td className="p-4">{renderRoleBadge(user.roleName)}</td>

                    {/* Col 4: Email Verified */}
                    <td className="p-4">
                      {renderEmailBadge(user.emailConfirmed)}
                    </td>

                    {/* Col 5: Status */}
                    <td className="p-4">{renderStatusBadge(user.status)}</td>

                    {/* Col 6: Created At */}
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    {/* Col 7: Actions */}
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition"
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {userList.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Page{" "}
                <strong>
                  {pagination.currentPage} / {pagination.totalPages}
                </strong>{" "}
                — {pagination.totalCount} users total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!pagination.hasPreviousPage}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages),
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
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
