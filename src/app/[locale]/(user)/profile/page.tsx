"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logoutUser } from "@/src/store/action/authActions";
import { EditProfileModal } from "@/src/components/Profile/EditProfileModal";
import { ChangePasswordModal } from "@/src/components/Profile/ChangePasswordModal";
import {
  ArrowRight,
  Store,
  ShoppingBag,
  Clock,
  AlertCircle,
  Eye,
  Ban,
  Pencil,
  LogOut,
  KeyRound,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import Link from "next/link";
import { ShopStatus } from "@/src/types/shop.types";
import { ShopApplicationModal } from "@/src/components/Profile/ShopApplicationModal";
import { UpdateShopApplicationModal } from "@/src/components/Profile/UpdateShopApplicationModal";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { useTranslations } from "next-intl";
import {
  reputationService,
  CustomerReputationData,
  ReputationLog,
} from "@/src/services/reputation.service";

export default function ProfilePage() {
  const t = useTranslations("ProfileUserPage");
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const { currentShop } = useAppSelector((state) => state.shop);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isUpdateShopModalOpen, setIsUpdateShopModalOpen] = useState(false);

  // --- Reputation State ---
  const [reputation, setReputation] = useState<CustomerReputationData | null>(
    null,
  );
  const [reputationLogs, setReputationLogs] = useState<ReputationLog[]>([]);
  const [isLoadingReputation, setIsLoadingReputation] = useState(false);

  useEffect(() => {
    if (user && user.role !== "Admin") {
      setIsLoadingReputation(true);
      Promise.all([
        reputationService.getMyReputation(),
        reputationService.getMyReputationLogs(1, 5), // Fetch top 5 recent logs
      ])
        .then(([repRes, logsRes]) => {
          if (repRes.success && repRes.data) setReputation(repRes.data);
          if (logsRes.success && logsRes.data)
            setReputationLogs(logsRes.data.items);
        })
        .catch((err) => console.error("Failed to fetch reputation data", err))
        .finally(() => setIsLoadingReputation(false));
    }
  }, [user?.id]);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    // Gọi fetchCurrentShop cho mọi user (trừ Admin) khi chưa có dữ liệu
    // "User" role cũng cần fetch vì có thể đã nộp đơn đăng ký Shop (PendingApproval/Rejected)
    if (user && user.role !== "Admin" && !currentShop) {
      dispatch(fetchCurrentShop());
    }
  }, [user, currentShop, dispatch]);

  // 1. Loading State
  if (!isInitialized || !user) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-8 flex items-center gap-6">
          <div className="w-32 h-32 bg-neutral-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logic hiển thị dữ liệu
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

  const avatarSrc = user.image
    ? user.image
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName,
      )}&background=random&size=256`;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/login");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900">
        {t("myProfile")}
      </h1>

      <div className="bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-neutral-100 relative">
        {/* Header Background */}
        <div className="h-32 bg-neutral-100 border-b border-neutral-200 relative overflow-hidden">
          {/* Abstract pattern for banner */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-200/60 via-neutral-100/10 to-transparent"></div>
        </div>

        <div className="px-6 sm:px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-14 mb-8">
            {/* Avatar */}
            <div className="relative w-[120px] h-[120px] rounded-full border-4 border-white shadow-md bg-white overflow-hidden shrink-0">
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName,
                  )}&background=random`;
                }}
              />
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white border border-neutral-200 text-neutral-600 px-4 py-2 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors shadow-sm font-medium text-sm flex items-center gap-2 mb-2"
            >
              <Pencil className="w-4 h-4" />
              {t("editProfile")}
            </button>
          </div>

          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">{fullName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-md border border-neutral-200 flex items-center gap-1">
                {user.role}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${user.emailConfirmed ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
              >
                {user.emailConfirmed ? t("verified") : t("unverified")}
              </span>
            </div>
          </div>

          {user.role !== "Admin" && (
            <div className="mt-8 mb-8">
              {/* TRƯỜNG HỢP 1: PENDING */}
              {currentShop &&
                currentShop.status === ShopStatus.PendingApproval && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <div className="w-12 h-12 bg-white text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="font-semibold text-sm text-neutral-900">
                        {t("applicationInReview")}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        {t("applicationInReviewDesc")}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2 bg-white text-neutral-700 font-medium hover:bg-neutral-50 text-sm rounded-lg border border-neutral-200 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-neutral-400" />{" "}
                      {t("viewApplication")}
                    </button>
                  </div>
                )}

              {/* TRƯỜNG HỢP 2: CHƯA CÓ SHOP */}
              {!currentShop && (
                <div className="bg-gradient-to-r from-neutral-50 to-white border border-neutral-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-neutral-100 shadow-sm rounded-full flex items-center justify-center text-neutral-400 shrink-0">
                      <Store className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900">
                        {t("wantToStartSelling")}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {t("upgradeToSeller")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile/register"
                    className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    {t("openAShop")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 2B: REJECTED → CẬP NHẬT LẠI HỒ SƠ */}
              {currentShop && currentShop.status === ShopStatus.Rejected && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full border border-red-100 flex items-center justify-center shadow-sm shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-neutral-900">
                        {t("applicationRejected")}
                      </h3>
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        {currentShop.adminNote
                          ? t("reason", { note: currentShop.adminNote })
                          : t("pleaseReviewAndResubmit")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 text-neutral-400" />{" "}
                      {t("viewOriginal")}
                    </button>
                    <button
                      onClick={() => setIsUpdateShopModalOpen(true)}
                      className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-[0.98]"
                    >
                      {t("resubmit")} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP 3: ACTIVE */}
              {currentShop && currentShop.status === ShopStatus.Active && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-blue-100 shadow-sm rounded-full flex items-center justify-center text-blue-600 shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900">
                        {t("manageYourStore")}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        {t("accessDashboard")}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/shop/dashboard"
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    {t("goToDashboard")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 4: BANNED */}
              {currentShop && currentShop.status === ShopStatus.Banned && (
                <div className="bg-white border border-red-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="font-semibold text-sm text-neutral-900">
                      {t("storeBanned")}
                    </h3>
                    <p className="text-sm text-red-600 font-medium mt-1">
                      {t("storeSuspended")}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="px-4 py-2 bg-red-50 text-red-700 font-medium hover:bg-red-100 border border-red-100 text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> {t("viewDetails")}
                  </button>
                </div>
              )}
            </div>
          )}
          {/* ============================================================== */}

          {/* ================= REPUTATION DASHBOARD ================= */}
          {user.role !== "Admin" && (
            <div className="mb-8">
              {isLoadingReputation ? (
                <div className="h-48 bg-neutral-100 animate-pulse rounded-xl border border-neutral-200"></div>
              ) : reputation ? (
                <div
                  className={`p-6 rounded-xl border relative overflow-hidden shadow-sm ${reputation.gate.isLocked ? "bg-red-50/50 border-red-200" : "bg-white border-neutral-200"}`}
                >
                  {/* Decorative Icon */}
                  <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
                    <Shield className="w-48 h-48" />
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    {/* Left: Score & Progress */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2 mb-6">
                        {reputation.gate.isLocked ? (
                          <ShieldAlert className="w-6 h-6 text-red-500" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-green-500" />
                        )}
                        {t("repu.title")}
                      </h3>

                      <div className="flex items-end gap-3 mb-2">
                        <span className="text-4xl font-black tracking-tighter text-neutral-900">
                          {reputation.currentScore}
                        </span>
                        <span className="text-sm font-medium text-neutral-500 mb-1.5">
                          / 100 {t("repu.points")}
                        </span>

                        <span
                          className={`ml-auto px-3 py-1 text-xs font-bold rounded-full border ${
                            reputation.gate.isLocked
                              ? "bg-red-100 text-red-700 border-red-200"
                              : reputation.gate.tier === "High"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : reputation.gate.tier === "Mid" ||
                                    reputation.gate.tier === "Normal"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-orange-100 text-orange-700 border-orange-200"
                          }`}
                        >
                          {reputation.gate.isLocked
                            ? t("repu.locked")
                            : `${t("repu.tier")}: ${reputation.gate.tier}`}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/60">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${
                            reputation.gate.isLocked
                              ? "bg-red-500"
                              : reputation.gate.tier === "High"
                                ? "bg-green-500"
                                : reputation.gate.tier === "Mid" ||
                                    reputation.gate.tier === "Normal"
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                          }`}
                          style={{
                            width: `${Math.min(Math.max(reputation.currentScore, 0), 100)}%`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                          <p className="text-xs text-neutral-500 font-medium mb-1">
                            {t("repu.monthlyLimit")}
                          </p>
                          <p className="text-sm font-bold text-neutral-800">
                            {reputation.gate.monthlyOrderLimit === 0
                              ? t("repu.unlimited")
                              : `${reputation.gate.monthlyOrderLimit} ${t("repu.orders")}`}
                          </p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                          <p className="text-xs text-neutral-500 font-medium mb-1">
                            {t("repu.autoCancels")}
                          </p>
                          <p className="text-sm font-bold text-neutral-800">
                            {reputation.monthlyAutoCancels}{" "}
                            <span className="text-xs font-normal text-neutral-500">
                              / 10
                            </span>
                          </p>
                        </div>
                      </div>

                      {reputation.gate.isLocked && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-start gap-2">
                          <Info className="w-5 h-5 shrink-0" />
                          <p>{t("repu.lockedWarning")}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Recent Logs */}
                    <div className="flex-1 md:border-l md:border-neutral-100 md:pl-8">
                      <h4 className="font-semibold text-neutral-900 text-sm flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-neutral-400" />
                        {t("repu.recentLogs")}
                      </h4>

                      {reputationLogs.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {reputationLogs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-sm">
                              <div className="mt-0.5 shrink-0">
                                {log.delta > 0 ? (
                                  <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                                    <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-neutral-800 font-medium leading-snug">
                                  {log.reason}
                                </p>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                  {new Date(log.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div
                                className={`font-bold shrink-0 ${log.delta > 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {log.delta > 0 ? "+" : ""}
                                {log.delta}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500 italic bg-neutral-50 p-4 rounded-lg text-center border border-neutral-100">
                          {t("repu.noLogs")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          {/* ============================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="p-6 sm:p-8 bg-neutral-50 rounded-xl border border-neutral-100">
              <h3 className="font-semibold text-neutral-900 mb-6 text-sm flex items-center gap-2 border-b border-neutral-200 pb-3">
                {t("contactInformation")}
              </h3>
              <div className="space-y-4 text-sm mt-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 font-medium">
                    {t("email")}
                  </span>
                  <span className="font-medium text-neutral-800 break-all text-right ml-4">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 font-medium">
                    {t("phone")}
                  </span>
                  <span className="font-medium text-neutral-800">
                    {user.phoneNumber || t("notProvided")}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 font-medium">
                    {t("username")}
                  </span>
                  <span className="font-medium text-neutral-800">
                    @{user.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Details (only show for Seller or when shop data exists) */}
            {(user?.role === "Seller" || currentShop) && (
              <div className="p-6 sm:p-8 bg-neutral-50 rounded-xl border border-neutral-100">
                <h3 className="font-semibold text-neutral-900 mb-6 text-sm flex items-center gap-2 border-b border-neutral-200 pb-3">
                  {t("storeAbstract")}
                </h3>
                <div className="space-y-4 text-sm mt-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                    <span className="text-neutral-500 font-medium">
                      {t("address")}
                    </span>
                    <span className="font-medium text-neutral-800 text-right max-w-[60%] truncate ml-4">
                      {user.storeAddress || t("noAddressProvided")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-neutral-100">
                    <span className="text-neutral-500 font-medium">
                      {t("bio")}
                    </span>
                    <p className="font-medium text-neutral-700 leading-relaxed text-[13px]">
                      {user.storeDescription
                        ? `"${user.storeDescription}"`
                        : t("noDescriptionAvailable")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout & Change Password */}
          <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-wrap justify-end gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50 bg-white border border-neutral-200 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-neutral-400" />
              {t("changePassword")}
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium hover:bg-red-50 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm border border-red-200 bg-white shadow-sm"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              {t("signOut")}
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}

      {/* Modal View Application */}
      <ShopApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        shopData={currentShop}
      />

      {/* Modal Update Shop Application (for rejected) */}
      <UpdateShopApplicationModal
        isOpen={isUpdateShopModalOpen}
        onClose={() => setIsUpdateShopModalOpen(false)}
        shopData={currentShop}
      />
    </div>
  );
}
