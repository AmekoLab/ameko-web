"use client";

import { FC, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Truck,
  Eye,
  Undo2,
  Pencil,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchMyWarrantyRequests,
  withdrawWarranty,
} from "@/src/store/slices/warrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { format, parseISO } from "date-fns";
import CustomerShipModal from "@/src/components/Warranty/CustomerShipModal";
import UpdateWarrantyModal from "@/src/components/Warranty/UpdateWarrantyModal";
import { useTranslations } from "next-intl";

// ─── Constants ─────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
  InProgress: "bg-yellow-50 border-yellow-200 text-yellow-700",
  AwaitingReturn: "bg-blue-50 border-blue-200 text-blue-700",
  ShopAccepted: "bg-teal-50 border-teal-200 text-teal-700",
  Rejected: "bg-red-50 border-red-200 text-red-700",
  AdminReviewing: "bg-purple-50 border-purple-200 text-purple-700",
  Completed: "bg-green-50 border-green-200 text-green-700",
  AutoCancelled: "bg-neutral-100 border-neutral-200 text-neutral-700",
  Returning: "bg-blue-50 border-blue-200 text-blue-700",
  Returned: "bg-blue-50 border-blue-200 text-blue-700",
};

const TYPE_LABELS: Record<string, string> = {
  ReturnRequest: "Return / Refund",
  CancelRequest: "Order Cancellation Request",
};

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

const getStatusStyle = (statusName: string): string =>
  STATUS_STYLES[statusName] || "bg-neutral-50 border-neutral-200 text-neutral-600";

const getTypeLabel = (typeName: string, t: any): string => {
  try {
    return t(typeName) || typeName;
  } catch {
    return typeName;
  }
};

// ─── Loading Skeleton ──────────────────────────────────────
const WarrantySkeleton: FC = () => (
  <div className="bg-neutral-50 min-h-[calc(100vh-4rem)]">
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 lg:py-16 animate-pulse">
      <div className="h-10 w-72 bg-neutral-200 rounded-xl mb-10" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-50">
              <div className="h-6 w-44 bg-neutral-100 rounded-md" />
              <div className="h-8 w-24 bg-neutral-100 rounded-lg" />
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-5 w-60 bg-neutral-100 rounded-md" />
              <div className="h-4 w-40 bg-neutral-100 rounded-md" />
            </div>
            <div className="h-32 w-full bg-neutral-100 rounded-xl mb-6" />
            <div className="flex gap-3 pt-4 border-t border-neutral-50">
              <div className="h-10 w-28 bg-neutral-200 rounded-xl" />
              <div className="h-10 w-32 bg-neutral-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyWarranties: FC = () => {
  const t = useTranslations("MyWarrantyRequests");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-neutral-200 bg-white rounded-2xl shadow-sm">
      <div className="w-20 h-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6">
        <ShieldCheck className="w-10 h-10 text-neutral-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 mb-2">{t("noRequests")}</h2>
      <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
        {t("noRequestsDesc")}
      </p>
    </div>
  );
};

// ─── Warranty Card ─────────────────────────────────────────
interface WarrantyCardProps {
  request: WarrantyRequest;
  onShipClick: (issueId: string) => void;
  onWithdrawClick: (issueId: string) => void;
  onEditClick: (request: WarrantyRequest) => void;
  isWithdrawing: boolean;
}

const WarrantyCard: FC<WarrantyCardProps> = ({
  request,
  onShipClick,
  onWithdrawClick,
  onEditClick,
  isWithdrawing,
}) => {
  const t = useTranslations("MyWarrantyRequests");
  const showWithdraw = request.status === 0 || request.status === 1;
  const showEdit = request.status === 0 || request.status === 1;
  const showReturnShipping =
    request.requiresReturn && request.statusName === "AwaitingReturn";

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden transition-shadow shadow-sm hover:shadow-md hover:border-neutral-300 duration-300 flex flex-col group">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
             {request.typeName === "ReturnRequest" ? (
               <PackageOpen className="w-5 h-5 text-neutral-600" />
             ) : (
               <ShieldCheck className="w-5 h-5 text-neutral-600" />
             )}
          </div>
          <span className="text-sm font-bold text-neutral-900">
            {getTypeLabel(request.typeName, t)}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1.5 box-border rounded-md border shadow-sm whitespace-nowrap ${getStatusStyle(request.statusName)}`}
        >
          {t(`status.${request.statusName}`)}
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-6 flex-1">
        {/* Reason + Date */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">{t("requestDetails")}</span>
          <p className="text-base font-semibold text-neutral-900 leading-relaxed border-l-2 border-neutral-300 pl-3">{request.reason}</p>
          <div className="flex items-center gap-2 mt-3">
             <span className="bg-neutral-100 text-neutral-600 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-neutral-200 flex items-center gap-1.5 w-fit">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(request.createdAt)}
             </span>
          </div>
        </div>

        {/* Refund Amount */}
        {request.refundAmount > 0 && (
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
             <span className="text-sm font-semibold text-green-800">{t("refundAmount")}</span>
             <span className="text-base text-green-700 font-bold bg-white px-3 py-1 rounded-lg border border-green-200 shadow-sm">
              {formatCurrency(request.refundAmount)}
            </span>
          </div>
        )}

        {/* Evidence */}
        {request.evidenceUrl && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">{t("evidenceImage")}</span>
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 group-hover:border-neutral-300 transition-colors">
              <Image
                src={request.evidenceUrl}
                alt="Evidence"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Shop Response */}
        {request.shopResponse && (
          <div className="flex flex-col gap-2 p-5 rounded-xl bg-blue-50/50 border border-blue-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 opacity-60"></div>
            <div className="flex items-center gap-2 text-blue-700 mb-1">
               <Info className="w-4 h-4 flex-shrink-0" />
               <p className="text-xs font-bold uppercase tracking-widest">
                 {t("shopResponse")}
               </p>
            </div>
            <p className="text-sm font-medium text-blue-900 leading-relaxed ml-6">
              {request.shopResponse}
            </p>
          </div>
        )}

        {/* Admin Note */}
        {request.adminNote && (
          <div className="flex flex-col gap-2 p-5 rounded-xl bg-purple-50/50 border border-purple-100 relative overflow-hidden mt-4">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 opacity-60"></div>
             <div className="flex items-center gap-2 text-purple-700 mb-1">
               <Info className="w-4 h-4 flex-shrink-0" />
               <p className="text-xs font-bold uppercase tracking-widest">
                 {t("adminNote")}
               </p>
             </div>
             <p className="text-sm font-medium text-purple-900 leading-relaxed ml-6">
               {request.adminNote}
             </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 px-6 py-5 border-t border-neutral-50 bg-neutral-50/50">
        {/* <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 px-5 py-2.5 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm active:scale-[0.98]">
          <Eye className="w-4 h-4" />
          {t("viewDetails")}
        </button> */}

        <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
          {showWithdraw && (
            <button
              onClick={() => onWithdrawClick(request.id)}
              disabled={isWithdrawing}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 shadow-sm active:scale-[0.98]"
            >
              <Undo2 className="w-4 h-4" />
              {t("withdraw")}
            </button>
          )}

          {showEdit && (
            <button
              onClick={() => onEditClick(request)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 px-5 py-2.5 rounded-xl hover:bg-neutral-50 transition-all shadow-sm active:scale-[0.98]"
            >
              <Pencil className="w-4 h-4" />
              {t("editRequest")}
            </button>
          )}

          {showReturnShipping && (
            <button
              onClick={() => onShipClick(request.id)}
              className="flex-1 md:flex-none w-full md:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 border border-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]"
            >
              <Truck className="w-4 h-4" />
              {t("sendReturnDetails")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ────────────────────────────────────────────
interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ current, total, onChange }) => {
  const t = useTranslations("MyWarrantyRequests");
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-10">
      <button
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium text-neutral-500 px-2">
        {t.rich("pageIndicator", {
          current,
          total,
          bold: (chunks) => <span className="text-neutral-900 font-bold">{chunks}</span>,
          semibold: (chunks) => <span className="font-semibold">{chunks}</span>
        })}
      </span>
      <button
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────
const MyWarrantiesPage: FC = () => {
  const t = useTranslations("MyWarrantyRequests");
  const dispatch = useAppDispatch();
  const { warrantyList, pagination, loadingWarranties } =
    useAppSelector((state) => state.warranty);

  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUpdateIssue, setSelectedUpdateIssue] =
    useState<WarrantyRequest | null>(null);

  // Modal State Management for Withdrawal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawingIssueId, setWithdrawingIssueId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(fetchMyWarrantyRequests({ page, pageSize: PAGE_SIZE }));
    },
    [dispatch],
  );

  const handleShipClick = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setShipModalOpen(true);
  }, []);

  const handleShipSuccess = useCallback(() => {
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleEditClick = useCallback((request: WarrantyRequest) => {
    setSelectedUpdateIssue(request);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleWithdrawClick = useCallback((issueId: string) => {
    setWithdrawingIssueId(issueId);
    setIsWithdrawModalOpen(true);
  }, []);

  const handleConfirmWithdraw = useCallback(async () => {
    if (!withdrawingIssueId) return;
    setIsWithdrawing(true);
    try {
      await dispatch(withdrawWarranty(withdrawingIssueId)).unwrap();
      dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
      setIsWithdrawModalOpen(false);
      setWithdrawingIssueId(null);
    } catch {
      // error toast handled by thunk
    } finally {
      setIsWithdrawing(false);
    }
  }, [dispatch, withdrawingIssueId]);

  const handleCancelWithdraw = useCallback(() => {
    setIsWithdrawModalOpen(false);
    setWithdrawingIssueId(null);
  }, []);

  if (loadingWarranties) return <WarrantySkeleton />;

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] text-neutral-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 lg:py-12">
        <div className="mb-10 pb-6 border-b border-neutral-200">
           <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hidden sm:block shadow-sm border border-blue-100">
               <ShieldCheck className="w-6 h-6" />
             </div>
             {t("pageTitle")}
           </h1>
           <p className="mt-3 text-sm text-neutral-500 max-w-2xl leading-relaxed">
             {t("pageDesc")}
           </p>
        </div>

      {warrantyList.length === 0 ? (
        <EmptyWarranties />
      ) : (
        <>
          <div className="space-y-6">
            {warrantyList.map((req) => (
              <WarrantyCard
                key={req.id}
                request={req}
                onShipClick={handleShipClick}
                onWithdrawClick={handleWithdrawClick}
                onEditClick={handleEditClick}
                isWithdrawing={isWithdrawing}
              />
            ))}
          </div>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            onChange={handlePageChange}
          />
        </>
      )}

      {selectedIssueId && (
        <CustomerShipModal
          isOpen={shipModalOpen}
          onClose={() => setShipModalOpen(false)}
          issueId={selectedIssueId}
          onSuccess={handleShipSuccess}
        />
      )}

      <UpdateWarrantyModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        issue={selectedUpdateIssue}
        onSuccess={handleUpdateSuccess}
      />

      {/* Withdraw Confirmation Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-[420px] w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-8">
              <div className="flex items-center justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 text-center mb-3">
                {t("confirmWithdrawal")}
              </h3>
              <p className="text-sm text-neutral-500 text-center leading-relaxed">
                {t("withdrawWarning")}
              </p>
            </div>
            
            <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-100 flex items-center gap-3">
              <button
                onClick={handleCancelWithdraw}
                disabled={isWithdrawing}
                className="flex-1 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                {t("cancelBtn")}
              </button>
              <button
                onClick={handleConfirmWithdraw}
                disabled={isWithdrawing}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm active:scale-[0.98]"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  t("withdrawClaimBtn")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MyWarrantiesPage;
