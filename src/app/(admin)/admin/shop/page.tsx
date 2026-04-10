"use client";

import { useState, useEffect } from "react";
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

export default function AdminShopRequestsPage() {
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
        setAdminNote("Đủ điều kiện kinh doanh.");
        break;
      case "reject":
        setAdminNote("Thông tin chưa chính xác.");
        break;
      case "ban":
        setAdminNote("Vi phạm chính sách.");
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
        toast.success(`Shop "${selectedShop.shopName}" has been banned!`);
      } else if (actionType === "unban") {
        await dispatch(adminUnbanShop(selectedShop.id)).unwrap();
        toast.success(`Shop "${selectedShop.shopName}" has been unbanned!`);
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
          `Đã ${actionType === "approve" ? "duyệt" : "từ chối"} shop thành công!`,
        );
      }
      setSelectedShop(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper render status
  const renderStatusBadge = (status: number) => {
    const baseClasses = "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
    switch (status) {
      case ShopStatus.PendingApproval:
        return (
          <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>
            Pending
          </span>
        );
      case ShopStatus.Active:
        return (
          <span className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>
            Active
          </span>
        );
      case ShopStatus.Rejected:
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>
            Rejected
          </span>
        );
      case ShopStatus.Inactive:
        return (
          <span className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}>
            Inactive
          </span>
        );
      case ShopStatus.Banned:
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>
            Banned
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}>
            Unknown
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
            Shop Management
          </h1>
          <p className="text-[11px] text-amazon-textMuted">
            Review and manage shop applications from users.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-[10px] text-amazon-textMuted">
            Total: <strong className="text-amazon-text mx-1">{adminPagination?.totalCount || 0}</strong> shops
          </span>
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white border border-amazon-border shadow-sm rounded-md overflow-hidden flex flex-col">
        {loading && adminShopList.length === 0 ? (
          <div className="p-12 text-center text-[11px] text-amazon-textMuted">
            Loading data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-amazon-border">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">Shop Info</th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">Contact</th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">Legal & Bank</th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">Created At</th>
                  <th className="px-3 py-2 text-center text-[11px] font-medium text-amazon-textMuted whitespace-nowrap w-[100px]">Detail</th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">Decision</th>
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
                              alt="logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-[9px] font-medium text-amazon-textMuted">
                              N/A
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-amazon-text mb-0.5">
                            {shop.shopName}
                          </p>
                          {renderStatusBadge(shop.status)}
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
                      <p className="text-[10px] text-amazon-textMuted">{shop.phoneNumber}</p>
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
                        {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    {/* CỘT 5: NÚT VIEW   */}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleViewDetail(shop)}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors mx-auto block"
                        title="Xem chi tiết hồ sơ"
                      >
                        View
                      </button>
                    </td>

                    {/*  CỘT 6: NÚT DUYỆT/TỪ CHỐI/BAN/UNBAN  */}
                    <td className="px-3 py-2 text-right">
                      {shop.status === ShopStatus.PendingApproval ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openActionModal(shop, "approve")}
                            className="text-[10px] font-medium text-green-600 hover:text-green-800 px-2 py-1 rounded border border-transparent hover:border-green-200 hover:bg-green-50 transition-colors"
                            title="Chấp thuận"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(shop, "reject")}
                            className="text-[10px] font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                            title="Từ chối"
                          >
                            Reject
                          </button>
                        </div>
                      ) : shop.status === ShopStatus.Active ? (
                        <button
                          onClick={() => openActionModal(shop, "ban")}
                          className="text-[10px] font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors inline-block"
                          title="Ban shop"
                        >
                          Ban
                        </button>
                      ) : shop.status === ShopStatus.Banned ? (
                        <button
                          onClick={() => openActionModal(shop, "unban")}
                          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded border border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-colors inline-block"
                          title="Unban shop"
                        >
                          Unban
                        </button>
                      ) : (
                        <span className="text-amazon-textMuted text-[10px] font-medium pr-2">
                          Done
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
            <div className={`p-4 border-b ${
                actionType === 'approve' ? 'border-green-100 bg-green-50' : 
                actionType === 'unban' ? 'border-emerald-100 bg-emerald-50' : 
                'border-red-100 bg-red-50'
              }`}>
              <h3 className={`text-sm font-bold ${
                actionType === 'approve' ? 'text-green-700' : 
                actionType === 'unban' ? 'text-emerald-700' : 
                'text-red-700'
              }`}>
                {actionType === "approve" && "Phê duyệt cửa hàng"}
                {actionType === "reject" && "Từ chối yêu cầu"}
                {actionType === "ban" && "Ban cửa hàng"}
                {actionType === "unban" && "Unban cửa hàng"}
              </h3>
              <p className="text-[11px] text-amazon-text mt-1">
                Shop: <span className="font-medium">{selectedShop.shopName}</span>
              </p>
            </div>
            <div className="p-4 space-y-4">
              {actionType === "unban" ? (
                <p className="text-[11px] text-amazon-text leading-relaxed">
                  After unbanning, the shop owner will need to manually
                  reactivate their shop. Are you sure you want to proceed?
                </p>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-amazon-text mb-1">
                    Ghi chú của Admin
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
                Hủy
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
                {isProcessing ? "Processing..." : "Xác nhận"}
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
    </div>
  );
}
