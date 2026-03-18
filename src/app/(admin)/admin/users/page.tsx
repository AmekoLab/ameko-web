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
  Users,
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

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            Admin
          </span>
        );
      case "Shop":
        return (
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            Shop
          </span>
        );
      case "Customer":
        return (
          <span className="text-[10px] bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            Customer
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            {role}
          </span>
        );
    }
  };

  // Helper: render email verified badge
  const renderEmailBadge = (confirmed: boolean) => {
    return confirmed ? (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-400">
        <ShieldCheck className="w-3 h-3" /> Verified
      </span>
    ) : (
      <span className="flex items-center gap-1  text-[10px] font-black uppercase tracking-widest text-yellow-500">
        <Shield className="w-3 h-3" /> Unverified
      </span>
    );
  };

  // Helper: render status
  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            Active
          </span>
        );
      case 1:
        return (
          <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            Banned
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest whitespace-nowrap">
            Unknown
          </span>
        );
    }
  };

 return (
    <div className="p-4 md:p-8 bg-black min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 font-oswald uppercase flex items-center gap-3 tracking-widest">
              <Users className="w-8 h-8 text-[#f5d800]" />
              User Management
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Manage all registered users on the platform.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Total: <strong className="text-white mx-1">{pagination?.totalCount || 0}</strong> users
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f5d800] text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#ffe500] transition shadow-[0_0_10px_rgba(245,216,0,0.2)]"
            >
              <UserPlus className="w-4 h-4" />
              Create User
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#151515] rounded-sm shadow-sm border border-[#1e2126] overflow-hidden">
          {loading && userList.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              Loading data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1c20] text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#1e2126]">
                    <th className="px-2 py-3">User</th>
                    <th className="px-2 py-3">Contact</th>
                    <th className="px-2 py-3">Role</th>
                    <th className="px-2 py-3 whitespace-nowrap">Email Status</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3 whitespace-nowrap">Created At</th>
                    <th className="px-2 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {userList.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#202030] transition-colors group"
                    >
                      {/* Col 1: User Info */}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-sm bg-black relative overflow-hidden shrink-0 border border-[#1e2126] flex items-center justify-center">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[100px] lg:max-w-[140px]">
                              {user.fullName}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Contact */}
                  
                      <td className="px-2 py-2 text-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-300">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span
                            className="truncate max-w-[120px] lg:max-w-[180px]"
                            title={user.email}
                          >
                            {user.email}
                          </span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#f5d800] mt-1">
                            <Phone className="w-3 h-3" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </td>

                      {/* Col 3: Role */}
                      <td className="px-2 py-2">{renderRoleBadge(user.roleName)}</td>

                      {/* Col 4: Email Verified */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {renderEmailBadge(user.emailConfirmed)}
                      </td>

                      {/* Col 5: Status */}
                      <td className="px-2 py-2">{renderStatusBadge(user.status)}</td>

                      {/* Col 6: Created At */}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>

                      {/* Col 7: Actions */}
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] hover:border-[#f5d800]/50 transition-colors"
                          title="Edit user"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {userList.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#1e2126] bg-[#1a1c20]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Page{" "}
                <strong className="text-white px-0.5">
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
                  className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] hover:border-[#f5d800]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] hover:border-[#f5d800]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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