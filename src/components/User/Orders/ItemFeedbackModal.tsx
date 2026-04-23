import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "react-toastify";
import { feedbackService } from "@/src/services/feedback.service";
import { format, parseISO } from "date-fns";

interface ItemFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: string | null;
  mode: "create" | "view" | "edit";
  onSuccess: () => void;
}

const ItemFeedbackModal: FC<ItemFeedbackModalProps> = ({
  isOpen,
  onClose,
  orderItemId,
  mode,
  onSuccess,
}) => {
  const t = useTranslations("Feedback");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [viewImageUrls, setViewImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [shopReply, setShopReply] = useState<string | null>(null);
  const [shopRepliedAt, setShopRepliedAt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isViewMode = mode === "view";

  const imagePreviews = useMemo(
    () =>
      images.map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        url: URL.createObjectURL(file),
      })),
    [images],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const resetFormState = () => {
    setRating(5);
    setHoveredRating(0);
    setComment("");
    setImages([]);
    setViewImageUrls([]);
    setShopReply(null);
    setShopRepliedAt(null);
  };

  useEffect(() => {
    if (!isOpen || !orderItemId) return;

    if (mode === "create") {
      resetFormState();
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchMyFeedback = async () => {
      setIsLoading(true);
      try {
        const response: any = await feedbackService.getMyItemFeedback(orderItemId);
        if (!isMounted) return;

        if (response?.success) {
          const data = (response.data || {}) as {
            feedbackId?: string;
            rating?: number;
            comment?: string;
            imageUrls?: string[];
            shopReply?: string;
            shopRepliedAt?: string;
          };
          setFeedbackId(data.feedbackId || null);
          setRating(
            typeof data.rating === "number" &&
              data.rating >= 1 &&
              data.rating <= 5
              ? data.rating
              : 5,
          );
          setComment(data.comment || "");
          setViewImageUrls(Array.isArray(data.imageUrls) ? data.imageUrls : []);
          setImages([]);
          setShopReply(data.shopReply || null);
          setShopRepliedAt(data.shopRepliedAt || null);
        } else {
          toast.error(response?.message || t("fetchError"));
          setViewImageUrls([]);
        }
      } catch (error: any) {
        if (!isMounted) return;
        const message = error?.message || t("fetchError");
        toast.error(message);
        setViewImageUrls([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMyFeedback();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, orderItemId]);

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setImages((prev) => [...prev, ...selectedFiles]);
    event.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (isViewMode || !orderItemId) return;

    const normalizedRating = Math.min(
      5,
      Math.max(1, Math.round(Number(rating))),
    );
    if (!Number.isFinite(normalizedRating)) {
      toast.error(t("invalidRating"));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("Rating", normalizedRating.toString());
      formData.append("Comment", comment.trim());

      images.forEach((file) => {
        formData.append("Images", file);
      });

      const response: any =
        mode === "edit" && feedbackId
          ? await feedbackService.updateAssembledFeedback(feedbackId, formData)
          : await feedbackService.createItemFeedback(orderItemId, formData);

      if (response?.success) {
        toast.success(t("createSuccess"));
        onSuccess();
        resetFormState();
        onClose();
      } else {
        toast.error(response?.message || t("createError"));
      }
    } catch (error: any) {
      const message = error?.message || t("createError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const title = isViewMode 
    ? t("titleViewItem") 
    : (mode === "edit" ? t("titleEditItem") : t("titleCreateItem"));

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-amazon-border rounded-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border bg-neutral-50">
          <h3 className="text-lg font-bold text-amazon-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-sm text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amazon-link" />
          </div>
        ) : (
          <>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold text-amazon-text mb-2 uppercase tracking-wider">
                  {t("yourRating")}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const activeRating = hoveredRating || rating;
                    const isActive = starValue <= activeRating;

                    return (
                      <button
                        key={starValue}
                        type="button"
                        disabled={isViewMode}
                        onMouseEnter={() => !isViewMode && setHoveredRating(starValue)}
                        onMouseLeave={() => !isViewMode && setHoveredRating(0)}
                        onClick={() => !isViewMode && setRating(starValue)}
                        className={`p-1 rounded-sm ${!isViewMode ? "hover:bg-neutral-100 cursor-pointer" : "cursor-default"} transition-colors`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isActive
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="shop-feedback-comment"
                  className="text-xs font-bold text-amazon-text mb-2 uppercase tracking-wider block"
                >
                  {t("comment")}
                </label>
                <textarea
                  id="shop-feedback-comment"
                  rows={4}
                  value={comment}
                  readOnly={isViewMode}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={t("commentPlaceholderItem")}
                  className={`w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-sm text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400 resize-none ${isViewMode ? 'opacity-90 bg-neutral-50' : ''}`}
                />
              </div>

              <div>
                {(isViewMode || viewImageUrls.length > 0) && (
                  <>
                    {viewImageUrls.length > 0 && (
                      <p className="text-xs font-bold text-amazon-text mb-2 uppercase tracking-wider">
                        {t("images")}
                      </p>
                    )}
                    {viewImageUrls.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                        {viewImageUrls.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className="aspect-square border border-amazon-border rounded-sm overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`Feedback image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {!isViewMode && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFilesChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-amazon-text border border-amazon-border rounded-sm hover:bg-neutral-100 transition-colors"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {t("addPhoto")}
                    </button>

                    {images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={preview.id}
                            className="relative aspect-square border border-amazon-border rounded-sm overflow-hidden"
                          >
                            <img
                              src={preview.url}
                              alt={`Feedback preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                              aria-label="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {(mode === "view" || mode === "edit") && shopReply && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-sm mt-4">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    {t("shopReply")}
                  </p>
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">{shopReply}</p>
                  {shopRepliedAt && (
                    <p className="text-[10px] text-blue-500 mt-2 italic">
                      {t("repliedAt")}: {format(parseISO(shopRepliedAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t border-amazon-border bg-neutral-50 flex ${isViewMode ? 'justify-end' : 'justify-end gap-2'}`}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-sm text-xs font-medium text-amazon-textMuted hover:bg-neutral-100 bg-white border border-amazon-border transition-colors disabled:opacity-50"
              >
                {isViewMode ? t("close") : t("cancel")}
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-white bg-amazon-link hover:brightness-95 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "edit" ? t("submitUpdate") : t("submitCreate")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemFeedbackModal;
