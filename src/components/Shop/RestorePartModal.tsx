import { FC, useState } from "react";
import { useAppDispatch } from "@/src/store/hook";
import { restorePart } from "@/src/store/slices/partsSlice";
import { PartItem } from "@/src/types/part.types";
import { X, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

interface RestorePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  part: PartItem | null;
}

const RestorePartModal: FC<RestorePartModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  part,
}) => {
  const t = useTranslations("ShopPartsPage"); // Or your preferred namespace
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !part) return null;

  const handleRestore = async () => {
    setLoading(true);
    try {
      const action = await dispatch(restorePart(part.id));
      if (restorePart.fulfilled.match(action)) {
        toast.success(t("restoreSuccess") || "Khôi phục sản phẩm thành công!");
        onSuccess();
        onClose();
      } else {
        toast.error((action.payload as string) || "Khôi phục thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white border border-amazon-border rounded-sm w-full max-w-md p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amazon-textMuted hover:text-amazon-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-amazon-text">
            {t("restorePartTitle") || "Khôi phục sản phẩm"}
          </h2>
        </div>

        <p className="text-sm text-amazon-textMuted mb-6">
          {t("restorePartConfirm") ||
            "Bạn có chắc chắn muốn khôi phục sản phẩm này?"}{" "}
          <br />
          <span className="font-bold text-amazon-text mt-1 block">
            {part.name}
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white border border-amazon-border text-amazon-text font-medium rounded-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {t("cancel") || "Hủy"}
          </button>
          <button
            onClick={handleRestore}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("confirmRestore") || "Khôi phục"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestorePartModal;
