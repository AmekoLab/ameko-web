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
import {
  Check,
  X,
  Calendar,
  CreditCard,
  Search,
  Eye,
  Ban,
  ShieldOff,
} from "lucide-react";
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
    switch (status) {
      case ShopStatus.PendingApproval:
        return (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold uppercase">
            Pending
          </span>
        );
      case ShopStatus.Active:
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">
            Active
          </span>
        );
      case ShopStatus.Rejected:
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">
            Rejected
          </span>
        );
      case ShopStatus.Inactive:
        return (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
            Inactive
          </span>
        );
      case ShopStatus.Banned:
        return (
          <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded font-bold uppercase">
            Banned
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold uppercase">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header giữ nguyên */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase">
              Shop Management
            </h1>
            <p className="text-gray-500">
              Quản lý danh sách đối tác và duyệt đơn đăng ký.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total: <strong>{adminPagination?.totalCount || 0}</strong> shops
          </div>
        </div>

        {/* BẢNG DANH SÁCH */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && adminShopList.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Loading data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                  <th className="p-4">Shop Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Legal & Bank</th>
                  <th className="p-4">Created At</th>

                  <th className="p-4 text-center w-[100px]">Detail</th>

                  <th className="p-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminShopList.map((shop) => (
                  <tr
                    key={shop.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Cột 1: Shop Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden shrink-0 border border-gray-200">
                          {shop.logoUrl ? (
                            <img
                              src={shop.logoUrl}
                              alt="logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {shop.shopName}
                          </p>
                          {renderStatusBadge(shop.status)}
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Contact */}
                    <td className="p-4 text-sm">
                      <p
                        className="font-bold text-gray-800 truncate max-w-[150px]"
                        title={shop.contactEmail}
                      >
                        {shop.contactEmail}
                      </p>
                      <p className="text-gray-500">{shop.phoneNumber}</p>
                    </td>

                    {/* Cột 3: Legal */}
                    <td className="p-4 text-sm space-y-1">
                      <p className="flex items-center gap-1 text-gray-600">
                        <CreditCard className="w-3 h-3" /> {shop.citizenId}
                      </p>
                      <p className="text-gray-500 text-xs truncate max-w-[150px]">
                        {shop.bankName} - {shop.bankAccountNumber}
                      </p>
                    </td>

                    {/* Cột 4: Created At */}
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    {/* CỘT 5: NÚT VIEW   */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetail(shop)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition tooltip mx-auto block"
                        title="Xem chi tiết hồ sơ"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>

                    {/*  CỘT 6: NÚT DUYỆT/TỪ CHỐI/BAN/UNBAN  */}
                    <td className="p-4 text-right">
                      {shop.status === ShopStatus.PendingApproval ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openActionModal(shop, "approve")}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition tooltip shadow-sm"
                            title="Chấp thuận"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openActionModal(shop, "reject")}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition tooltip shadow-sm"
                            title="Từ chối"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : shop.status === ShopStatus.Active ? (
                        <button
                          onClick={() => openActionModal(shop, "ban")}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition tooltip shadow-sm"
                          title="Ban shop"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      ) : shop.status === ShopStatus.Banned ? (
                        <button
                          onClick={() => openActionModal(shop, "unban")}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition tooltip shadow-sm"
                          title="Unban shop"
                        >
                          <ShieldOff className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs italic pr-2">
                          Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL DUYỆT/TỪ CHỐI/BAN/UNBAN ) --- */}
      {selectedShop && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div
              className={`p-6 border-b ${
                actionType === "approve"
                  ? "bg-green-50 border-green-100"
                  : actionType === "unban"
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-red-50 border-red-100"
              }`}
            >
              <h3
                className={`text-xl font-bold uppercase flex items-center gap-2 ${
                  actionType === "approve"
                    ? "text-green-700"
                    : actionType === "unban"
                      ? "text-emerald-700"
                      : "text-red-700"
                }`}
              >
                {actionType === "approve" && <Check className="w-6 h-6" />}
                {actionType === "reject" && <X className="w-6 h-6" />}
                {actionType === "ban" && <Ban className="w-6 h-6" />}
                {actionType === "unban" && <ShieldOff className="w-6 h-6" />}
                {actionType === "approve" && "Phê duyệt cửa hàng"}
                {actionType === "reject" && "Từ chối yêu cầu"}
                {actionType === "ban" && "Ban cửa hàng"}
                {actionType === "unban" && "Unban cửa hàng"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Shop: <span className="font-bold">{selectedShop.shopName}</span>
              </p>
            </div>
            <div className="p-6 space-y-4">
              {actionType === "unban" ? (
                <p className="text-sm text-gray-600">
                  After unbanning, the shop owner will need to manually
                  reactivate their shop. Are you sure you want to proceed?
                </p>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Ghi chú của Admin
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:outline-none min-h-[100px]"
                  />
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded-lg font-bold ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : actionType === "unban"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing ? "..." : "Xác nhận"}
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
