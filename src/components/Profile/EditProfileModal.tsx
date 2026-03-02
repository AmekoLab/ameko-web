"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateUserProfile } from "@/src/store/action/authActions";
import { UpdateProfilePayload } from "@/src/types/auth.types";
import { toast } from "react-toastify";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Định nghĩa kiểu dữ liệu cho lỗi form
interface FormErrors {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
}: EditProfileModalProps) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  // State dữ liệu form
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: 0,
    dateOfBirth: "",
    storeAddress: "",
    storeDescription: "",
    image: "",
    banner: "",
  });

  // 1. STATE MỚI: QUẢN LÝ LỖI CỦA TỪNG TRƯỜNG
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form và lỗi khi mở modal
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender !== undefined ? Number(user.gender) : 0,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        storeAddress: user.storeAddress || "",
        storeDescription: user.storeDescription || "",
        image: user.image || "",
        banner: user.banner || "",
      });
      setErrors({}); // Xóa sạch lỗi cũ khi mở lại form
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Cập nhật giá trị
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gender" ? Number(value) : value,
    }));

    // 2. UX: KHI NGƯỜI DÙNG BẮT ĐẦU NHẬP LẠI -> TỰ ĐỘNG XÓA LỖI ĐỎ
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 3. HÀM VALIDATE CHẶT CHẼ
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "Please enter the first name";
      isValid = false;
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Please enter the last name";
      isValid = false;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Please select date of birth";
      isValid = false;
    }

    if (formData.phoneNumber && !/^\d{9,12}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number invalid";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Gọi hàm validate trước khi gửi
    if (!validate()) {
      return;
    }

    try {
      await dispatch(updateUserProfile(user.id, formData));
      toast.success("Update profile successfull!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Update profile error");
    }
  };

  // Helper để hiển thị style lỗi cho input
  // Nếu có lỗi thì viền đỏ (border-red-500), không thì viền xám (border-gray-300)
  const getInputClass = (fieldName: keyof FormErrors) => {
    return `w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none transition ${
      errors[fieldName]
        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
        : "border-gray-300 focus:ring-gray-300 focus:border-transparent"
    }`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold font-oswald uppercase text-gray-800">
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Input) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-gray-300 outline-none transition"
              placeholder="https://..."
            />
          </div>

          {/* --- FIRST NAME & LAST NAME --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={getInputClass("firstName")}
              />

              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={getInputClass("lastName")}
              />

              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                className={getInputClass("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* --- DATE OF BIRTH  --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
                className={getInputClass("dateOfBirth")}
              />

              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Gender
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="gender"
                  value={0}
                  checked={formData.gender === 0}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-500 focus:ring-gray-300"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="gender"
                  value={1}
                  checked={formData.gender === 1}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-500 focus:ring-gray-300"
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Store/Address
            </label>
            <input
              type="text"
              name="storeAddress"
              value={formData.storeAddress || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description (Bio)
            </label>
            <textarea
              name="storeDescription"
              value={formData.storeDescription || ""}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 outline-none transition resize-none"
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
