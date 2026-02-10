"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { adminCreateUser } from "@/src/store/slices/adminUsersSlice";
import { toast } from "react-toastify";
import { CreateUserPayload } from "@/src/types/admin.types";

// --- ZOD SCHEMA ---
const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.string(),
  status: z.string(),
  gender: z.string(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Only digits allowed"),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.adminUsers);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "0",
      status: "0",
      gender: "0",
      dateOfBirth: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      const payload: CreateUserPayload = {
        ...data,
        role: Number(data.role),
        status: Number(data.status),
        gender: Number(data.gender),
      };
      await dispatch(adminCreateUser(payload)).unwrap();
      toast.success("User created successfully!");
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to create user");
    }
  };

  const handleClose = () => {
    if (!creating) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Create New User</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
            disabled={creating}
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

          {/* Username */}
          <div>
            <label className={labelClass}>Username</label>
            <input
              {...register("username")}
              className={inputClass}
              placeholder="username"
            />
            {errors.username && (
              <p className={errorClass}>{errors.username.message}</p>
            )}
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

          {/* Password */}
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={inputClass + " pr-10"}
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className={errorClass}>{errors.password.message}</p>
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
              <select {...register("role")} className={inputClass}>
                <option value="0">Admin</option>
                <option value="1">Customer</option>
                <option value="2">Shop</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select {...register("status")} className={inputClass}>
                <option value="0">Active</option>
                <option value="1">Banned</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select {...register("gender")} className={inputClass}>
                <option value="0">Male</option>
                <option value="1">Female</option>
                <option value="2">Other</option>
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {creating ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
