"use client";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Smile,
  X,
  Loader2,
  Lock,
  ChevronDown,
  ShoppingCart,
  MapPin,
  Gift,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { uploadImage } from "@/src/utils/uploadImage";
import { socialService } from "@/src/services/social.service";
import { CreatePostPayload } from "@/src/types/social.types";
import { assembledProductService } from "@/src/services/assembledProduct.service";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";
import { useAppSelector } from "@/src/store/hook";
import { useTranslations } from "next-intl";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg";

export const CreatePost: FC = () => {
  // Get authenticated user from Redux store
  const authUser = useAppSelector((state) => state.auth.user);

  const userAvatar = authUser?.image || DEFAULT_AVATAR;
  const userName = authUser?.username || "User";

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Post data
  const [title, setTitle] = useState("");
  const [assembledProductId, setAssembledProductId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopProducts, setShopProducts] = useState<AssembledProductItem[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentShop = useAppSelector((state) => state.shop.currentShop);
  const t = useTranslations("CreatePost");

  // Focus textarea when modal opens
  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const newPreviewUrls = selected.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...selected]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const removedUrl = previewUrls[index];
    if (removedUrl) {
      URL.revokeObjectURL(removedUrl);
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!title.trim()) {
      setError(t("errorEmptyContent"));
      return;
    }

    try {
      setIsPosting(true);
      setError(null);

      const attachmentUrls = await Promise.all(
        files.map((file) => uploadImage(file)),
      );

      const payload: CreatePostPayload = {
        title: title.trim(),
        attachmentUrls,
      };

      if (assembledProductId.trim()) {
        payload.assembledProductId = assembledProductId.trim();
      }

      const response = await socialService.createPost(payload);

      window.dispatchEvent(
        new CustomEvent("social-post-created", { detail: response.data }),
      );

      // Reset & close
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setTitle("");
      setAssembledProductId("");
      setFiles([]);
      setPreviewUrls([]);
      setSelectedProductName("");
      setShowProductPicker(false);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(t("errorPost"));
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const getCurrentShopId = (): string | null => {
    if (typeof window === "undefined") return null;

    if (currentShop?.id) {
      return currentShop.id;
    }

    const currentShopStr = localStorage.getItem("currentShop");
    if (currentShopStr) {
      try {
        const currentShopObj = JSON.parse(currentShopStr) as { id?: string };
        if (currentShopObj.id) {
          return currentShopObj.id;
        }
      } catch {
        // no-op
      }
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr) as { id?: string; shopId?: string };
      return user.shopId || null;
    } catch {
      return null;
    }
  };

  const handleTagProductsClick = async () => {
    const shopId = getCurrentShopId();
    if (!shopId) {
      setProductError(t("errorShopId"));
      setShowProductPicker(true);
      return;
    }

    try {
      setIsLoadingProducts(true);
      setProductError(null);
      setShowProductPicker(true);

      const response =
        await assembledProductService.getAssembledProductsByShop(shopId);

      setShopProducts(response.data || []);
    } catch (err) {
      console.error(err);
      setProductError(t("errorLoadProducts"));
      setShopProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSelectProduct = (product: AssembledProductItem) => {
    setAssembledProductId(product.id);
    setSelectedProductName(product.name);
    setShowProductPicker(false);
  };

  const handleCloseModal = () => {
    if (isPosting) return;
    setIsModalOpen(false);
  };

  const hasContent = title.trim().length > 0 || files.length > 0;

  return (
    <>
      {/* ================================================
          1. COMPACT INPUT BAR (Initial State)
      ================================================ */}
      <div className="bg-white rounded-xl border border-amazon-border p-3 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-neutral-200">
            <Image
              src={userAvatar}
              alt="My Avatar"
              fill
              className="object-cover"
            />
          </div>

          {/* Fake input trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left bg-neutral-100 hover:bg-neutral-200 rounded-full px-4 py-2.5 text-sm text-amazon-textMuted transition-colors cursor-pointer"
          >
            {t("placeholderTrigger", { userName })}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-amazon-border mt-3 pt-3">
          <div className="flex items-center justify-around">
            {/* <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-[#3a3b3c] transition-colors text-sm text-gray-300 font-medium"
            >
              <Video className="w-5 h-5 text-red-500" />
              <span className="hidden sm:inline">Video trực tiếp</span>
            </button> */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                setTimeout(() => fileInputRef.current?.click(), 200);
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors text-sm text-amazon-textMuted font-medium"
            >
              <ImageIcon className="w-5 h-5 text-green-500" />
              <span className="hidden sm:inline">{t("photoVideo")}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors text-sm text-amazon-textMuted font-medium"
            >
              <Smile className="w-5 h-5 text-yellow-500" />
              <span className="hidden sm:inline">{t("feelingActivity")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input (shared) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ================================================
          2. POST CREATION MODAL
      ================================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-amazon-border rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* ---- Header ---- */}
              <div className="flex items-center justify-between p-4 border-b border-amazon-border">
                <div className="w-9" /> {/* Spacer for centering */}
                <h2 className="text-lg font-bold text-amazon-text">{t("createPost")}</h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-amazon-textMuted" />
                </button>
              </div>

              {/* ---- User Info Row ---- */}
              <div className="p-4 flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-neutral-200">
                  <Image
                    src={userAvatar}
                    alt="My Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-amazon-text">
                    {userName}
                  </span>
                  <div
                    className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 border border-amazon-border transition-colors text-xs text-amazon-textMuted"
                  >
                    <Lock className="w-3 h-3" />
                    <p>{t("public")}</p>
                    {/* <ChevronDown className="w-3 h-3" /> */}
                  </div>
                </div>
              </div>

              {/* ---- Content Area (scrollable) ---- */}
              <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-[160px]">
                <textarea
                  ref={textareaRef}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  placeholder={`What are you thinking?`}
                  className="w-full bg-transparent text-amazon-text placeholder-gray-400 text-lg focus:outline-none resize-none min-h-[120px]"
                  rows={4}
                />

                {/* Tagged product badge */}
                {selectedProductName && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amazon-bgSecondary border border-amazon-border rounded-lg">
                    <ShoppingCart className="w-4 h-4 text-amazon-btnSecondary" />
                    <span className="text-xs text-amazon-textMuted">
                      {t("taggedProduct", { productName: selectedProductName })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAssembledProductId("");
                        setSelectedProductName("");
                      }}
                      className="ml-auto text-amazon-textMuted hover:text-amazon-text transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Image previews */}
                {previewUrls.length > 0 && (
                  <div className="mb-3 rounded-lg border border-amazon-border overflow-hidden">
                    <div
                      className={`grid gap-0.5 ${
                        previewUrls.length === 1
                          ? "grid-cols-1"
                          : previewUrls.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                      }`}
                    >
                      {previewUrls.map((url, index) => (
                        <div
                          key={url}
                          className="relative aspect-square bg-neutral-100 group"
                        >
                          <Image
                            src={url}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Picker inside modal */}
                {showProductPicker && (
                  <div className="mb-3 border border-amazon-border rounded-lg p-3 bg-amazon-bgSecondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-amazon-textMuted">
                        {t("selectProduct")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowProductPicker(false)}
                        className="text-amazon-textMuted hover:text-amazon-text transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {isLoadingProducts && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 text-amazon-btnSecondary animate-spin" />
                      </div>
                    )}

                    {productError && (
                      <p className="text-xs text-red-400">{productError}</p>
                    )}

                    {!isLoadingProducts &&
                      !productError &&
                      shopProducts.length === 0 && (
                        <p className="text-xs text-gray-500 py-2">
                          {t("noProductsFound")}
                        </p>
                      )}

                    {!isLoadingProducts &&
                      !productError &&
                      shopProducts.length > 0 && (
                        <div className="max-h-40 overflow-auto space-y-1.5">
                          {shopProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product)}
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 border border-amazon-border transition-colors"
                            >
                              <p className="text-sm font-medium text-amazon-text">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-amazon-textMuted">
                                {t("productId", { productId: product.id })}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {/* Error */}
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>

              {/* ---- Addons Row ---- */}
              <div className="p-4 mx-4 mb-3 border border-amazon-border rounded-lg flex items-center justify-between gap-3 bg-white shadow-sm">
                <span className="text-sm text-amazon-text font-medium whitespace-nowrap">
                  {t("addToPost")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title={t("photoVideo")}
                  >
                    <ImageIcon className="w-5 h-5 text-green-500" />
                  </button>
                  <button
                    type="button"
                    onClick={handleTagProductsClick}
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title={t("actionTag")}
                  >
                    <UserPlus className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title={t("feelingActivity")}
                  >
                    <Smile className="w-5 h-5 text-yellow-500" />
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title={t("actionCheckIn")}
                  >
                    <MapPin className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title={t("actionGif")}
                  >
                    <Gift className="w-5 h-5 text-teal-400" />
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title={t("actionMore")}
                  >
                    <MoreHorizontal className="w-5 h-5 text-amazon-textMuted" />
                  </button>
                </div>
              </div>

              {/* ---- Submit Button ---- */}
              <div className="mx-4 mb-4">
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={!hasContent || isPosting}
                  className={`w-full font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    hasContent && !isPosting
                      ? "bg-amazon-btnPrimary hover:brightness-95 text-amazon-text cursor-pointer"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {isPosting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPosting ? t("posting") : t("postBtn")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
