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
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Puzzle className="w-8 h-8 text-[#f5d800]" />
              Assembled Products
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Manage your shop&apos;s assembled keyboard products.{" "}
              <span className="font-black text-[#f5d800]">{total}</span>{" "}
              products total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-[#f5d800] text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#ffe500] transition flex items-center gap-2 shadow-[0_0_15px_rgba(245,216,0,0.3)]"
            >
              <Plus className="w-4 h-4 text-black" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search assembled products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#1e2126] rounded-sm text-[11px] font-bold uppercase tracking-widest bg-[#151515] text-white focus:outline-none focus:border-[#f5d800] focus:ring-1 focus:ring-[#f5d800]/30 transition placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading assembled products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              No assembled products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black border-b border-[#1e2126] text-left">
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px]">
                      Product
                    </th>
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px]">
                      Layout
                    </th>
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px] text-right">
                      Price
                    </th>
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px] text-right">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px]">
                      Specs
                    </th>
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px] text-center">
                      Components
                    </th>
                    <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-[10px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
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
    <tr className="hover:bg-[#202030] transition-colors">
      {/* Product info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-black border border-[#1e2126] overflow-hidden shrink-0 flex items-center justify-center">
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
              <Puzzle className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-black text-[11px] text-white uppercase tracking-wider truncate max-w-[200px]">
              {product.name}
            </p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[200px]">
              {product.slug || product.id.slice(0, 12) + "..."}
            </p>
          </div>
        </div>
      </td>

      {/* Layout */}
      <td className="px-4 py-3">
        {product.layout ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#202030] text-[#f5d800] border border-[#f5d800]/20">
            {product.layout}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-gray-600">—</span>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="font-black text-[#f5d800] text-[11px] uppercase tracking-widest">
          {formatPrice(product.price)}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-right">
        <span
          className={`font-black text-[11px] uppercase tracking-widest ${
            (product.quantity ?? 0) <= 0
              ? "text-red-500"
              : (product.quantity ?? 0) < 5
                ? "text-[#f5d800]"
                : "text-white"
          }`}
        >
          {product.quantity ?? 0}
        </span>
      </td>

      {/* Specs */}
      <td className="px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-widest space-y-0.5 max-w-[180px]">
          {product.mounting && (
            <p>
              <span className="text-gray-400">
                {product.mounting}
              </span>
            </p>
          )}
          {product.connection && (
            <p>
              <span className="text-gray-400">
                {product.connection}
              </span>
            </p>
          )}
          {!product.mounting && !product.connection && (
            <span className="text-gray-600">—</span>
          )}
        </div>
      </td>

      {/* Components count */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center gap-1 text-[11px] font-black text-gray-400">
          <Cpu className="w-3.5 h-3.5" />
          {product.details?.length || 0}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onView(product.id)}
            className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] hover:border-[#f5d800] text-gray-500 hover:text-[#f5d800] transition shrink-0"
            title="View product"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] hover:border-[#f5d800] text-gray-500 hover:text-[#f5d800] transition shrink-0"
            title="Edit product"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] hover:border-red-500 text-gray-500 hover:text-red-500 transition shrink-0"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
