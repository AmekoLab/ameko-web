"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { adminCreateUser } from "@/src/store/slices/adminUsersSlice";
import { toast } from "react-toastify";
import { CreateUserPayload } from "@/src/types/admin.types";

// --- ZOD SCHEMA ---
const createUserSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    username: z
      .string()
      .min(3, t("validation.usernameMin"))
      .max(30, t("validation.usernameMax"))
      .regex(/^[a-zA-Z0-9_]+$/, t("validation.usernamePattern")),
    password: z.string().min(6, t("validation.passwordMin")),
    email: z.string().email(t("validation.emailInvalid")),
    firstName: z.string().min(1, t("validation.firstNameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    role: z.string(),
    status: z.string(),
    gender: z.string(),
    dateOfBirth: z.string().min(1, t("validation.dobRequired")),
    phoneNumber: z
      .string()
      .min(9, t("validation.phoneMin"))
      .max(15, t("validation.phoneMax"))
      .regex(/^[0-9]+$/, t("validation.phonePattern")),
  });

type CreateUserFormValues = z.infer<ReturnType<typeof createUserSchema>>;

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
  const t = useTranslations("CreateUserModal");
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.adminUsers);
  const [showPassword, setShowPassword] = useState(false);
  const schema = useMemo(() => createUserSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
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
      toast.success(t("toast.createSuccess"));
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : t("toast.createFailed");
      toast.error(message);
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
    "text-black w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{t("title")}</h2>
          <button
            onClick={handleClose}
            className="px-2 py-1 text-[11px] font-medium text-gray-500 rounded hover:bg-gray-100 transition"
            disabled={creating}
          >
            {t("close")}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Row: First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("firstName")}</label>
              <input
                {...register("firstName")}
                className={inputClass}
                placeholder={t("firstNamePlaceholder")}
              />
              {errors.firstName && (
                <p className={errorClass}>{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>{t("lastName")}</label>
              <input
                {...register("lastName")}
                className={inputClass}
                placeholder={t("lastNamePlaceholder")}
              />
              {errors.lastName && (
                <p className={errorClass}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className={labelClass}>{t("username")}</label>
            <input
              {...register("username")}
              className={inputClass}
              placeholder={t("usernamePlaceholder")}
            />
            {errors.username && (
              <p className={errorClass}>{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>{t("email")}</label>
            <input
              {...register("email")}
              type="email"
              className={inputClass}
              placeholder={t("emailPlaceholder")}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>{t("password")}</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={inputClass + " pr-10"}
                placeholder={t("passwordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 hover:text-gray-600"
              >
                {showPassword ? t("hidePassword") : t("showPassword")}
              </button>
            </div>
            {errors.password && (
              <p className={errorClass}>{errors.password.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className={labelClass}>{t("phoneNumber")}</label>
            <input
              {...register("phoneNumber")}
              className={inputClass}
              placeholder={t("phoneNumberPlaceholder")}
            />
            {errors.phoneNumber && (
              <p className={errorClass}>{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Row: Role + Status + Gender */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t("role")}</label>
              <select {...register("role")} className={inputClass}>
                <option value="0">{t("roleAdmin")}</option>
                <option value="1">{t("roleCustomer")}</option>
                <option value="2">{t("roleShop")}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("status")}</label>
              <select {...register("status")} className={inputClass}>
                <option value="0">{t("statusActive")}</option>
                <option value="1">{t("statusBanned")}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("gender")}</label>
              <select {...register("gender")} className={inputClass}>
                <option value="0">{t("genderMale")}</option>
                <option value="1">{t("genderFemale")}</option>
                <option value="2">{t("genderOther")}</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className={labelClass}>{t("dateOfBirth")}</label>
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
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-[11px] font-bold text-neutral-50 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? t("creating") : t("createUser")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
