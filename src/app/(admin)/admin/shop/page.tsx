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
  Store,
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
          <span className="text-[9px] bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
            Pending
          </span>
        );
      case ShopStatus.Active:
        return (
          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
            Active
          </span>
        );
      case ShopStatus.Rejected:
        return (
          <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
            Rejected
          </span>
        );
      case ShopStatus.Inactive:
        return (
          <span className="text-[9px] bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
            Inactive
          </span>
        );
      case ShopStatus.Banned:
        return (
          <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
            Banned
          </span>
        );
      default:
        return (
          <span className="text-[9px] bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header giữ nguyên */}
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Store className="w-8 h-8 text-[#f5d800]" />
              Shop Management
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Review and manage shop applications from users.
            </p>
          </div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Total: <strong className="text-white">{adminPagination?.totalCount || 0}</strong> shops
          </div>
        </div>

        {/* BẢNG DANH SÁCH */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loading && adminShopList.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#1e2126]">
                  <th className="p-4">Shop Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Legal & Bank</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-center w-[100px]">Detail</th>
                  <th className="p-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2126]">
                {adminShopList.map((shop) => (
                  <tr
                    key={shop.id}
                    className="hover:bg-[#202030] transition-colors"
                  >
                    {/* Cột 1: Shop Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-black relative overflow-hidden shrink-0 border border-[#1e2126]">
                          {shop.logoUrl ? (
                            <img
                              src={shop.logoUrl}
                              alt="logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-black uppercase text-gray-600">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[13px] text-white uppercase tracking-wider mb-1">
                            {shop.shopName}
                          </p>
                          {renderStatusBadge(shop.status)}
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Contact */}
                    <td className="p-4">
                      <p
                        className="font-bold text-[11px] text-gray-300 uppercase tracking-widest truncate max-w-[150px] mb-1"
                        title={shop.contactEmail}
                      >
                        {shop.contactEmail}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5d800]">{shop.phoneNumber}</p>
                    </td>

                    {/* Cột 3: Legal */}
                    <td className="p-4 space-y-1.5">
                      <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-300">
                        <CreditCard className="w-3.5 h-3.5 text-gray-500" /> {shop.citizenId}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate max-w-[150px]">
                        {shop.bankName} - {shop.bankAccountNumber}
                      </p>
                    </td>

                    {/* Cột 4: Created At */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    {/* CỘT 5: NÚT VIEW   */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetail(shop)}
                        className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-[#202030] text-gray-500 hover:text-white rounded-sm transition mx-auto block"
                        title="Xem chi tiết hồ sơ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                    {/*  CỘT 6: NÚT DUYỆT/TỪ CHỐI/BAN/UNBAN  */}
                    <td className="p-4 text-right">
                      {shop.status === ShopStatus.PendingApproval ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openActionModal(shop, "approve")}
                            className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-green-500/10 text-gray-500 hover:text-green-500 hover:border-green-500/50 rounded-sm transition shadow-sm"
                            title="Chấp thuận"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openActionModal(shop, "reject")}
                            className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-red-500/10 text-gray-500 hover:text-red-500 hover:border-red-500/50 rounded-sm transition shadow-sm"
                            title="Từ chối"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : shop.status === ShopStatus.Active ? (
                        <button
                          onClick={() => openActionModal(shop, "ban")}
                          className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-red-500/10 text-gray-500 hover:text-red-500 hover:border-red-500/50 rounded-sm transition shadow-sm"
                          title="Ban shop"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : shop.status === ShopStatus.Banned ? (
                        <button
                          onClick={() => openActionModal(shop, "unban")}
                          className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 rounded-sm transition shadow-sm"
                          title="Unban shop"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest italic pr-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#151515] border border-[#1e2126] rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div
              className={`p-6 border-b bg-black/50 ${
                actionType === "approve"
                  ? "border-green-500/30"
                  : actionType === "unban"
                    ? "border-emerald-500/30"
                    : "border-red-500/30"
              }`}
            >
              <h3
                className={`text-[15px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  actionType === "approve"
                    ? "text-green-500"
                    : actionType === "unban"
                      ? "text-emerald-500"
                      : "text-red-500"
                }`}
              >
                {actionType === "approve" && <Check className="w-5 h-5" />}
                {actionType === "reject" && <X className="w-5 h-5" />}
                {actionType === "ban" && <Ban className="w-5 h-5" />}
                {actionType === "unban" && <ShieldOff className="w-5 h-5" />}
                {actionType === "approve" && "Phê duyệt cửa hàng"}
                {actionType === "reject" && "Từ chối yêu cầu"}
                {actionType === "ban" && "Ban cửa hàng"}
                {actionType === "unban" && "Unban cửa hàng"}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                Shop: <span className="text-white">{selectedShop.shopName}</span>
              </p>
            </div>
            <div className="p-6 space-y-4">
              {actionType === "unban" ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed">
                  After unbanning, the shop owner will need to manually
                  reactivate their shop. Are you sure you want to proceed?
                </p>
              ) : (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Ghi chú của Admin
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-black border border-[#1e2126] rounded-sm p-3 text-[11px] font-bold text-white uppercase tracking-widest focus:border-[#f5d800] focus:ring-1 focus:ring-[#f5d800]/50 focus:outline-none min-h-[100px] resize-none placeholder:text-gray-600"
                  />
                </div>
              )}
            </div>
            <div className="p-4 bg-black border-t border-[#1e2126] flex justify-end gap-3">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-5 py-2.5 bg-[#151515] border border-[#1e2126] text-[11px] text-gray-400 font-black uppercase tracking-widest rounded-sm hover:bg-[#202030] hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`px-5 py-2.5 text-black text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors ${
                  actionType === "approve"
                    ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    : actionType === "unban"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "bg-red-500 hover:bg-red-400 text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]"
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
