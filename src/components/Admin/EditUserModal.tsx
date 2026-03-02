"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { adminUpdateUser } from "@/src/store/slices/adminUsersSlice";
import { toast } from "react-toastify";
import { AdminUserItem, UpdateUserPayload } from "@/src/types/admin.types";

// --- ZOD SCHEMA ---
const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.number().min(0).max(2),
  status: z.number().min(0).max(1),
  gender: z.number().min(0).max(2),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  emailConfirmed: z.boolean(),
  phoneNumberConfirmed: z.boolean(),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// Map roleName string → numeric value
const roleNameToNumber = (roleName: string): number => {
  switch (roleName) {
    case "Customer":
      return 0;
    case "Shop":
      return 1;
    case "Admin":
      return 2;
    default:
      return 0;
  }
};

// Map gender string → numeric value
const genderToNumber = (gender: string | null): number => {
  switch (gender) {
    case "Male":
      return 0;
    case "Female":
      return 1;
    case "Other":
      return 2;
    default:
      return 0;
  }
};

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUserItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.adminUsers);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
  });

  // Pre-fill form when user changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleNameToNumber(user.roleName),
        status: user.status,
        gender: genderToNumber(user.gender),
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        phoneNumber: user.phoneNumber || "",
        emailConfirmed: user.emailConfirmed,
        phoneNumberConfirmed: false,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormValues) => {
    if (!user) return;
    try {
      const payload: UpdateUserPayload = {
        ...data,
        role: Number(data.role),
        status: Number(data.status),
        gender: Number(data.gender),
      };
      await dispatch(adminUpdateUser({ userId: user.id, payload })).unwrap();
      toast.success("User updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to update user");
    }
  };

  const handleClose = () => {
    if (!updating) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
            disabled={updating}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Row: First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                {...register("firstName")}
                className={inputClass}
                placeholder="First name"
              />
              {errors.firstName && (
                <p className={errorClass}>{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                {...register("lastName")}
                className={inputClass}
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className={errorClass}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              {...register("email")}
              type="email"
              className={inputClass}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              {...register("phoneNumber")}
              className={inputClass}
              placeholder="0909090000"
            />
            {errors.phoneNumber && (
              <p className={errorClass}>{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Row: Role + Status + Gender */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Role</label>
              <select
                {...register("role", { valueAsNumber: true })}
                className={inputClass}
              >
                <option value={0}>Customer</option>
                <option value={1}>Shop</option>
                <option value={2}>Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                {...register("status", { valueAsNumber: true })}
                className={inputClass}
              >
                <option value={0}>Active</option>
                <option value={1}>Banned</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                {...register("gender", { valueAsNumber: true })}
                className={inputClass}
              >
                <option value={0}>Male</option>
                <option value={1}>Female</option>
                <option value={2}>Other</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              {...register("dateOfBirth")}
              type="date"
              className={inputClass}
            />
            {errors.dateOfBirth && (
              <p className={errorClass}>{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Row: Email Confirmed + Phone Confirmed */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                {...register("emailConfirmed")}
                type="checkbox"
                id="emailConfirmed"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="emailConfirmed"
                className="text-sm font-semibold text-gray-700"
              >
                Email Confirmed
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                {...register("phoneNumberConfirmed")}
                type="checkbox"
                id="phoneNumberConfirmed"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="phoneNumberConfirmed"
                className="text-sm font-semibold text-gray-700"
              >
                Phone Confirmed
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={updating}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
