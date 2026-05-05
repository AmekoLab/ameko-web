"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  adminApproveShop,
  adminBanShop,
  adminUnbanShop,
  fetchAdminShopList,
} from "@/src/store/slices/shopSlice";
import { ShopStatus } from "@/src/types/shop.types";
import { toast } from "react-toastify";
import { ShopApplicationModal } from "@/src/components/Profile/ShopApplicationModal";
import { AdjustReputationModal } from "@/src/components/Admin/AdjustReputationModal";

export default function AdminShopRequestsPage() {
  const locale = useLocale();
  const t = useTranslations("AdminShopRequestsPage");
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const dispatch = useAppDispatch();
  const { adminShopList, loading, adminPagination } = useAppSelector(
    (state) => state.shop,
  );

  // State cho Modal Duyệt/Từ chối
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "ban" | "unban" | null
  >(null);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 3. State cho Modal Xem Chi Tiết
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingShop, setViewingShop] = useState<any | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingShop, setAdjustingShop] = useState<any | null>(null);

  const openAdjustModal = (shop: any) => {
    setAdjustingShop(shop);
    setIsAdjustModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchAdminShopList({ page: 1, size: 20 }));
  }, [dispatch]);

  // Hàm mở Modal Xem Chi Tiết
  const handleViewDetail = (shop: any) => {
    setViewingShop(shop);
    setIsViewModalOpen(true);
  };

  // Hàm mở Modal Duyệt/Từ chối/Ban/Unban
  const openActionModal = (
    shop: any,
    type: "approve" | "reject" | "ban" | "unban",
  ) => {
    setSelectedShop(shop);
    setActionType(type);
    switch (type) {
      case "approve":
        setAdminNote(t("defaultNoteApprove"));
        break;
      case "reject":
        setAdminNote(t("defaultNoteReject"));
        break;
      case "ban":
        setAdminNote(t("defaultNoteBan"));
        break;
      case "unban":
        setAdminNote("");
        break;
    }
  };

  const handleSubmit = async () => {
    if (!selectedShop || !actionType) return;
    setIsProcessing(true);
    try {
      if (actionType === "ban") {
        await dispatch(adminBanShop(selectedShop.id)).unwrap();
        toast.success(
          t("toastBanSuccess", { shopName: selectedShop.shopName }),
        );
      } else if (actionType === "unban") {
        await dispatch(adminUnbanShop(selectedShop.id)).unwrap();
        toast.success(
          t("toastUnbanSuccess", { shopName: selectedShop.shopName }),
        );
      } else {
        const statusToSend =
          actionType === "approve" ? ShopStatus.Active : ShopStatus.Rejected;
        await dispatch(
          adminApproveShop({
            shopId: selectedShop.id,
            status: statusToSend,
            adminNote: adminNote,
          }),
        ).unwrap();
        toast.success(
          actionType === "approve"
            ? t("toastApproveSuccess")
            : t("toastRejectSuccess"),
        );
      }
      setSelectedShop(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error.message || t("toastDecisionFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper render status
  const renderStatusBadge = (status: number) => {
    const baseClasses =
      "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
    switch (status) {
      case ShopStatus.PendingApproval:
        return (
          <span
            className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}
          >
            {t("statusPending")}
          </span>
        );
      case ShopStatus.Active:
        return (
          <span
            className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}
          >
            {t("statusActive")}
          </span>
        );
      case ShopStatus.Rejected:
        return (
          <span
            className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}
          >
            {t("statusRejected")}
          </span>
        );
      case ShopStatus.Inactive:
        return (
          <span
            className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}
          >
            {t("statusInactive")}
          </span>
        );
      case ShopStatus.Banned:
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
              {adminPagination?.totalCount || 0}
            </strong>{" "}
            {t("shopsLabel")}
          </span>
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white border border-amazon-border shadow-sm rounded-md overflow-hidden flex flex-col">
        {loading && adminShopList.length === 0 ? (
          <div className="p-12 text-center text-[11px] text-amazon-textMuted">
            {t("loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-amazon-border">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableShopInfo")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableContact")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableLegalBank")}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableCreatedAt")}
                  </th>
                  <th className="px-3 py-2 text-center text-[11px] font-medium text-amazon-textMuted whitespace-nowrap w-[100px]">
                    {t("tableDetail")}
                  </th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">
                    {t("tableDecision")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminShopList.map((shop) => (
                  <tr
                    key={shop.id}
                    className="border-b border-amazon-border hover:bg-neutral-50 transition-colors"
                  >
                    {/* Cột 1: Shop Info */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-sm bg-neutral-100 relative overflow-hidden shrink-0 border border-amazon-border flex items-center justify-center">
                          {shop.logoUrl ? (
                            <img
                              src={shop.logoUrl}
                              alt={t("logoAlt")}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-[9px] font-medium text-amazon-textMuted">
                              {t("notAvailable")}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-amazon-text mb-0.5 truncate max-w-[150px]" title={shop.shopName}>
                            {shop.shopName}
                          </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {/* Nếu Shop đang Active + Báo tạm nghỉ -> Chỉ hiện Tạm nghỉ */}
                            {shop.status === ShopStatus.Active && shop.isActive === false ? (
                              <span 
                                className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold border whitespace-nowrap bg-neutral-200 text-neutral-600 border-neutral-300 uppercase tracking-wide" 
                                title="Đã duyệt nhưng Shop đang tự tạm đóng cửa"
                              >
                                {t("inactiveShop") || "Tạm nghỉ"}
                              </span>
                            ) : (
                              // Còn lại (Pending, Banned, hoặc Active mở cửa bình thường) -> Hiện badge mặc định
                              renderStatusBadge(shop.status)
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Contact */}
                    <td className="px-3 py-2">
                      <p
                        className="text-[11px] text-amazon-text truncate max-w-[150px] mb-0.5"
                        title={shop.contactEmail}
                      >
                        {shop.contactEmail}
                      </p>
                      <p className="text-[10px] text-amazon-textMuted">
                        {shop.phoneNumber}
                      </p>
                    </td>

                    {/* Cột 3: Legal */}
                    <td className="px-3 py-2 space-y-0.5">
                      <p className="text-[11px] text-amazon-text">
                        {shop.citizenId}
                      </p>
                      <p className="text-[10px] text-amazon-textMuted truncate max-w-[150px]">
                        {shop.bankName} - {shop.bankAccountNumber}
                      </p>
                    </td>

                    {/* Cột 4: Created At */}
                    <td className="px-3 py-2">
                      <div className="text-[11px] text-amazon-text whitespace-nowrap">
                        {new Date(shop.createdAt).toLocaleDateString(
                          dateLocale,
                        )}
                      </div>
                    </td>

                    {/* CỘT 5: NÚT VIEW   */}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleViewDetail(shop)}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors mx-auto block"
                        title={t("viewDetailTitle")}
                      >
                        {t("view")}
                      </button>
                    </td>

                    {/*  CỘT 6: NÚT DUYỆT/TỪ CHỐI/BAN/UNBAN  */}
                    <td className="px-3 py-2 text-right">
                      {shop.status === ShopStatus.PendingApproval ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openActionModal(shop, "approve")}
                            className="text-[10px] font-medium text-green-600 hover:text-green-800 px-2 py-1 rounded border border-transparent hover:border-green-200 hover:bg-green-50 transition-colors"
                            title={t("approveTitle")}
                          >
                            {t("approve")}
                          </button>
                          <button
                            onClick={() => openActionModal(shop, "reject")}
                            className="text-[10px] font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                            title={t("rejectTitle")}
                          >
                            {t("reject")}
                          </button>
                        </div>
                      ) : shop.status === ShopStatus.Active ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openAdjustModal(shop)}
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors inline-block"
                            title="Điều chỉnh uy tín"
                          >
                           {t("reputation")}
                          </button>
                          <button
                            onClick={() => openActionModal(shop, "ban")}
                            className="text-[10px] font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors inline-block"
                            title={t("banTitle")}
                          >
                            {t("ban")}
                          </button>
                        </div>
                      ) : shop.status === ShopStatus.Banned ? (
                        <button
                          onClick={() => openActionModal(shop, "unban")}
                          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded border border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-colors inline-block"
                          title={t("unbanTitle")}
                        >
                          {t("unban")}
                        </button>
                      ) : (
                        <span className="text-amazon-textMuted text-[10px] font-medium pr-2">
                          {t("done")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DUYỆT/TỪ CHỐI/BAN/UNBAN ) --- */}
      {selectedShop && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
          <div className="bg-white border border-amazon-border shadow-xl rounded-md w-full max-w-md overflow-hidden">
            <div
              className={`p-4 border-b ${
                actionType === "approve"
                  ? "border-green-100 bg-green-50"
                  : actionType === "unban"
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-red-100 bg-red-50"
              }`}
            >
              <h3
                className={`text-sm font-bold ${
                  actionType === "approve"
                    ? "text-green-700"
                    : actionType === "unban"
                      ? "text-emerald-700"
                      : "text-red-700"
                }`}
              >
                {actionType === "approve" && t("modalTitleApprove")}
                {actionType === "reject" && t("modalTitleReject")}
                {actionType === "ban" && t("modalTitleBan")}
                {actionType === "unban" && t("modalTitleUnban")}
              </h3>
              <p className="text-[11px] text-amazon-text mt-1">
                {t("shopLabel")}{" "}
                <span className="font-medium">{selectedShop.shopName}</span>
              </p>
            </div>
            <div className="p-4 space-y-4">
              {actionType === "unban" ? (
                <p className="text-[11px] text-amazon-text leading-relaxed">
                  {t("unbanWarning")}
                </p>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-amazon-text mb-1">
                    {t("adminNoteLabel")}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-white border border-amazon-border rounded-sm p-2 text-[11px] text-amazon-text focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px] resize-none"
                  />
                </div>
              )}
            </div>
            <div className="p-3 bg-neutral-50 border-t border-amazon-border flex justify-end gap-2">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-3 py-1.5 border border-amazon-border text-[11px] text-amazon-text font-medium rounded-sm hover:bg-gray-100 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-sm transition-colors text-neutral-50 ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : actionType === "unban"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing ? t("processing") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. MODAL XEM CHI TIẾT  --- */}
      {viewingShop && (
        <ShopApplicationModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          shopData={viewingShop}
        />
      )}

      {/* --- MODAL ĐIỀU CHỈNH UY TÍN --- */}
      {adjustingShop && (
        <AdjustReputationModal
          isOpen={isAdjustModalOpen}
          onClose={() => {
            setIsAdjustModalOpen(false);
            setAdjustingShop(null);
          }}
          targetType="Shop"
          targetId={adjustingShop.id}
          targetName={adjustingShop.shopName}
        />
      )}
    </div>
  );
}
