"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchAssembledProducts,
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
      dispatch(fetchAssembledProducts());
    }
  }, [dispatch, currentShop?.id]);

  const handleCreateSuccess = () => {
    dispatch(fetchAssembledProducts());
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
    dispatch(fetchAssembledProducts());
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
    dispatch(fetchAssembledProducts());
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
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase flex items-center gap-3">
              <Puzzle className="w-8 h-8" />
              Assembled Products
            </h1>
            <p className="text-gray-500">
              Manage your shop&apos;s assembled keyboard products.{" "}
              <span className="font-semibold text-gray-700">{total}</span>{" "}
              products total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assembled products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading assembled products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No assembled products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Product
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Layout
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-right">
                      Price
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-right">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Specs
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-center">
                      Components
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Product info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
            {product.image1 ? (
              <Image
                src={product.image1}
                alt={product.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <Puzzle className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate max-w-[200px]">
              {product.name}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {product.slug || product.id.slice(0, 12) + "..."}
            </p>
          </div>
        </div>
      </td>

      {/* Layout */}
      <td className="px-4 py-3">
        {product.layout ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
            {product.layout}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-gray-900">
          {formatPrice(product.price)}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-right">
        <span
          className={`font-semibold ${
            (product.quantity ?? 0) <= 0
              ? "text-red-600"
              : (product.quantity ?? 0) < 5
                ? "text-amber-600"
                : "text-gray-900"
          }`}
        >
          {product.quantity ?? 0}
        </span>
      </td>

      {/* Specs */}
      <td className="px-4 py-3">
        <div className="text-xs text-gray-500 space-y-0.5 max-w-[180px]">
          {product.mounting && (
            <p>
              <span className="font-semibold text-gray-700">
                {product.mounting}
              </span>
            </p>
          )}
          {product.connection && (
            <p>
              <span className="font-semibold text-gray-700">
                {product.connection}
              </span>
            </p>
          )}
          {!product.mounting && !product.connection && (
            <span className="text-gray-300">—</span>
          )}
        </div>
      </td>

      {/* Components count */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600">
          <Cpu className="w-3 h-3" />
          {product.details?.length || 0}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onView(product.id)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition shrink-0"
            title="View product"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-500 hover:text-amber-600 transition shrink-0"
            title="Edit product"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 text-gray-500 hover:text-red-600 transition shrink-0"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
