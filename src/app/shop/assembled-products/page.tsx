"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchMyAssembledProducts,
  fetchAssembledProductDetail,
  clearSelectedAssembledProduct,
} from "@/src/store/slices/assembledProductsSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";
import Image from "next/image";
import { Puzzle, Search, Plus, Eye, Pencil, Trash2, Cpu } from "lucide-react";
import CreateAssembledProductModal from "@/src/components/Shop/CreateAssembledProductModal";
import AssembledProductDetailModal from "@/src/components/Shop/AssembledProductDetailModal";
import EditAssembledProductModal from "@/src/components/Shop/EditAssembledProductModal";
import DeleteAssembledProductModal from "@/src/components/Shop/DeleteAssembledProductModal";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function AssembledProductsPage() {
  const dispatch = useAppDispatch();
  const { assembledProducts, total, loading } = useAppSelector(
    (state) => state.assembledProducts,
  );
  const { currentShop } = useAppSelector((state) => state.shop);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AssembledProductItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] =
    useState<AssembledProductItem | null>(null);

  useEffect(() => {
    if (!currentShop) {
      dispatch(fetchCurrentShop());
    }
  }, [dispatch, currentShop]);

  useEffect(() => {
    if (currentShop?.id) {
      dispatch(fetchMyAssembledProducts());
    }
  }, [dispatch, currentShop?.id]);

  const handleCreateSuccess = () => {
    dispatch(fetchMyAssembledProducts());
  };

  const handleViewDetail = (id: string) => {
    dispatch(fetchAssembledProductDetail(id));
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    dispatch(clearSelectedAssembledProduct());
  };

  const handleEdit = (product: AssembledProductItem) => {
    // Fetch detail to ensure full data, then open edit modal
    dispatch(fetchAssembledProductDetail(product.id)).then((action) => {
      if (fetchAssembledProductDetail.fulfilled.match(action)) {
        setEditingProduct(action.payload);
        setIsEditOpen(true);
      }
    });
  };

  const handleEditSuccess = () => {
    dispatch(fetchMyAssembledProducts());
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (product: AssembledProductItem) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteSuccess = () => {
    dispatch(fetchMyAssembledProducts());
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setDeletingProduct(null);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return assembledProducts;
    const q = searchQuery.toLowerCase();
    return assembledProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.layout && p.layout.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [assembledProducts, searchQuery]);

  return (
    <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b border-amazon-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text mb-2 flex items-center gap-3">
              {/* <Puzzle className="w-8 h-8 text-amazon-text" /> */}
              Assembled Products
            </h1>
            <p className="text-[14px] text-amazon-textMuted">
              Manage your shop&apos;s assembled keyboard products.{" "}
              <span className="font-bold text-amazon-text">{total}</span>{" "}
              products total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2 bg-amazon-btnPrimary border border-amazon-border text-[13px] font-medium text-amazon-text rounded-sm hover:brightness-95 transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-amazon-text" />
              Create Product
            </button>
          </div>
        </div>

        {/* Modals */}
        <CreateAssembledProductModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        <AssembledProductDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />

        <EditAssembledProductModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSuccess={handleEditSuccess}
          product={editingProduct}
        />

        <DeleteAssembledProductModal
          isOpen={isDeleteOpen}
          onClose={handleCloseDelete}
          onSuccess={handleDeleteSuccess}
          product={deletingProduct}
        />

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-textMuted" />
            <input
              type="text"
              placeholder="Search assembled products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-amazon-border rounded-sm text-[13px] font-medium bg-white text-amazon-text focus:outline-none focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary transition placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-sm border border-amazon-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-[14px] font-medium text-amazon-textMuted">
              Loading assembled products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-[14px] font-medium text-amazon-textMuted">
              No assembled products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-amazon-border text-left">
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px]">
                      Product
                    </th>
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px]">
                      Layout
                    </th>
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px] text-right">
                      Price
                    </th>
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px] text-right">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px]">
                      Specs
                    </th>
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px] text-center">
                      Components
                    </th>
                    <th className="px-4 py-3 font-medium text-amazon-textMuted text-[12px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border">
                  {filteredProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onView={handleViewDetail}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Product Row ---
function ProductRow({
  product,
  onView,
  onEdit,
  onDelete,
}: {
  product: AssembledProductItem;
  onView: (id: string) => void;
  onEdit: (product: AssembledProductItem) => void;
  onDelete: (product: AssembledProductItem) => void;
}) {
  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      {/* Product info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-sm bg-neutral-50 overflow-hidden shrink-0 flex items-center justify-center">
            {product.image1 ? (
              <Image
                src={product.image1}
                alt={product.name}
                width={50}
                height={50}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <Puzzle className="w-4 h-4 text-neutral-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[14px] text-amazon-text truncate max-w-[200px]">
              {product.name}
            </p>
            <p className="text-[12px] text-amazon-textMuted truncate max-w-[200px] mt-0.5">
              {product.slug || product.id.slice(0, 12) + "..."}
            </p>
          </div>
        </div>
      </td>

      {/* Layout */}
      <td className="px-4 py-3">
        {product.layout ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-sm bg-neutral-50 text-amazon-text border border-amazon-border shadow-sm">
            {product.layout}
          </span>
        ) : (
          <span className="text-[13px] text-amazon-textMuted">—</span>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="font-bold text-amazon-price text-[14px]">
          {formatPrice(product.price)}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-right">
        <span
          className={`font-medium text-[14px] ${
            (product.quantity ?? 0) <= 0
              ? "text-red-600"
              : (product.quantity ?? 0) < 5
                ? "text-amber-600"
                : "text-amazon-text"
          }`}
        >
          {product.quantity ?? 0}
        </span>
      </td>

      {/* Specs */}
      <td className="px-4 py-3">
        <div className="text-[13px] font-medium space-y-0.5 max-w-[180px]">
          {product.mounting && (
            <p>
              <span className="text-amazon-textMuted">
                {product.mounting}
              </span>
            </p>
          )}
          {product.connection && (
            <p>
              <span className="text-amazon-textMuted">
                {product.connection}
              </span>
            </p>
          )}
          {!product.mounting && !product.connection && (
            <span className="text-amazon-textMuted">—</span>
          )}
        </div>
      </td>

      {/* Components count */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center gap-1 text-[13px] font-medium text-amazon-textMuted">
          <Cpu className="w-3.5 h-3.5" />
          {product.details?.length || 0}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onView(product.id)}
            className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 hover:border-amazon-btnPrimary text-amazon-textMuted hover:text-amazon-btnPrimary transition shrink-0 shadow-sm"
            title="View product"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 hover:border-amazon-btnPrimary text-amazon-textMuted hover:text-amazon-btnPrimary transition shrink-0 shadow-sm"
            title="Edit product"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-red-50 hover:border-red-500 text-amazon-textMuted hover:text-red-500 transition shrink-0 shadow-sm"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
