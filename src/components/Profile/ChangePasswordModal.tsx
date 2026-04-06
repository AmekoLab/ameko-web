"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { changeUserPassword } from "@/src/store/action/authActions";
import { ChangePasswordPayload } from "@/src/types/auth.types";
import { toast } from "react-toastify";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordPayload>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate khớp mật khẩu
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("Confirmation password does not match!");
      return;
    }

    // 2. Validate độ dài (Optional)
    if (formData.newPassword.length < 6) {
      toast.error("The new password must have at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await dispatch(changeUserPassword(user.id, formData));
      toast.success("Password changed successfully!");

      // Reset form và đóng modal
      setFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      onClose();
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Password change failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold font-oswald uppercase text-gray-800">
            Change Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="text-black w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 outline-none transition"
              placeholder="••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="text-black w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 outline-none transition"
              placeholder="••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="text-black w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 outline-none transition"
              placeholder="••••••"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-300 disabled:opacity-70 flex items-center gap-2 transition-colors"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
