"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchParts,
  fetchPartDetail,
  clearSelectedPart,
} from "@/src/store/slices/partsSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { fetchCategories } from "@/src/store/slices/categoriesSlice";
import { PartItem, PartType } from "@/src/types/part.types";
import Image from "next/image";
import {
  Package,
  Search,
  Keyboard,
  Box,
  Layers,
  ToggleLeft,
  CircleDot,
  Grip,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ClipboardCheck,
} from "lucide-react";
import CreatePartModal from "@/src/components/Shop/CreatePartModal";
import PartDetailModal from "@/src/components/Shop/PartDetailModal";
import EditPartModal from "@/src/components/Shop/EditPartModal";
import DeletePartModal from "@/src/components/Shop/DeletePartModal";
import CheckStockModal from "@/src/components/Shop/CheckStockModal";

const PART_TYPE_CONFIG: Record<
  PartType,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  kit: {
    label: "Kit",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border border-purple-200",
    icon: Keyboard,
  },
  component: {
    label: "Component",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border border-blue-200",
    icon: Box,
  },
  accessory: {
    label: "Accessory",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border border-emerald-200",
    icon: Layers,
  },
};

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: "Active", cls: "bg-neutral-100 text-amazon-text border border-amazon-border" },
  0: { label: "Inactive", cls: "bg-red-50 text-red-600 border border-red-200" },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function ShopPartsPage() {
  const dispatch = useAppDispatch();
  const { parts, total, loading } = useAppSelector((state) => state.parts);
  const { currentShop } = useAppSelector((state) => state.shop);
  const { categories } = useAppSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<PartType | "all">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<PartItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPart, setDeletingPart] = useState<PartItem | null>(null);
  const [isCheckStockOpen, setIsCheckStockOpen] = useState(false);

  useEffect(() => {
    if (!currentShop) {
      dispatch(fetchCurrentShop());
    }
  }, [dispatch, currentShop]);

  useEffect(() => {
    if (currentShop?.id) {
      dispatch(fetchParts(currentShop.id));
      dispatch(fetchCategories(currentShop.id));
    }
  }, [dispatch, currentShop?.id]);

  const handleCreateSuccess = () => {
    if (currentShop?.id) {
      dispatch(fetchParts(currentShop.id));
    }
  };

  const handleViewDetail = (slug: string) => {
    dispatch(fetchPartDetail(slug));
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    dispatch(clearSelectedPart());
  };

  const handleEdit = (slug: string) => {
    // Fetch detail then open edit modal
    dispatch(fetchPartDetail(slug)).then((action) => {
      if (fetchPartDetail.fulfilled.match(action)) {
        setEditingPart(action.payload);
        setIsEditOpen(true);
      }
    });
  };

  const handleEditSuccess = () => {
    if (currentShop?.id) {
      dispatch(fetchParts(currentShop.id));
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingPart(null);
  };

  const handleDelete = (part: PartItem) => {
    setDeletingPart(part);
    setIsDeleteOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (currentShop?.id) {
      dispatch(fetchParts(currentShop.id));
    }
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setDeletingPart(null);
  };

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: parts.length };
    parts.forEach((p) => {
      counts[p.partType] = (counts[p.partType] || 0) + 1;
    });
    return counts;
  }, [parts]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    let result = parts;
    if (activeType !== "all") {
      result = result.filter((p) => p.partType === activeType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [parts, activeType, searchQuery]);

  const typeFilters: (PartType | "all")[] = [
    "all",
    "kit",
    "component",
    "accessory",
  ];

  return (
    <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-5 border-b border-amazon-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text mb-1 flex items-center gap-2">
              {/* <Package className="w-7 h-7 text-amazon-textMuted" /> */}
              Part Management
            </h1>
            <p className="text-[13px] font-medium text-amazon-textMuted">
              Manage your shop&apos;s parts and components.{" "}
              <span className="font-bold text-amazon-text">{total}</span> parts
              total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckStockOpen(true)}
              className="px-5 py-2 bg-white border border-amazon-border text-amazon-textMuted text-[13px] font-medium rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition flex items-center gap-2 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" />
              Check Stock
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2 bg-amazon-btnPrimary border border-amazon-border text-amazon-text text-[13px] font-medium rounded-sm hover:brightness-95 transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Part
            </button>
          </div>
        </div>

        {/* Create Part Modal */}
        <CreatePartModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleCreateSuccess}
          categories={categories}
        />

        {/* Part Detail Modal */}
        <PartDetailModal isOpen={isDetailOpen} onClose={handleCloseDetail} />

        {/* Edit Part Modal */}
        <EditPartModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSuccess={handleEditSuccess}
          categories={categories}
          part={editingPart}
        />

        {/* Delete Part Modal */}
        <DeletePartModal
          isOpen={isDeleteOpen}
          onClose={handleCloseDelete}
          onSuccess={handleDeleteSuccess}
          part={deletingPart}
        />

        {/* Check Stock Modal */}
        <CheckStockModal
          isOpen={isCheckStockOpen}
          onClose={() => setIsCheckStockOpen(false)}
          parts={parts}
        />

        {/* Search + Type filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-textMuted" />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-amazon-border rounded-sm text-[13px] font-medium bg-white text-amazon-text focus:outline-none focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary transition placeholder:text-neutral-400"
            />
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {typeFilters.map((type) => {
              const count = typeCounts[type] || 0;
              const isActive = activeType === type;
              if (type === "all") {
                return (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-4 py-2 text-[13px] font-medium rounded-sm border transition-colors ${
                      isActive
                        ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary shadow-sm"
                        : "bg-white text-amazon-textMuted border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
                    }`}
                  >
                    All
                    <span className="ml-1 bg-white/40 border border-amazon-border/20 px-1 py-0.5 text-[11px] rounded-sm">{count}</span>
                  </button>
                );
              }
              const cfg = PART_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 text-[13px] font-medium rounded-sm border transition-colors flex items-center gap-2 ${
                    isActive
                      ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary shadow-sm"
                      : "bg-white text-amazon-textMuted border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {cfg.label}
                  <span className="bg-white/40 border border-amazon-border/20 px-1 py-0.5 text-[11px] rounded-sm">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-sm border border-amazon-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-[13px] font-medium text-amazon-textMuted">
              Loading parts...
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="p-12 text-center text-[13px] font-medium text-amazon-textMuted">
              No parts found.
            </div>
          ) : (
            <div className="min-w-full overflow-x-auto">
              <table className="w-full text-[13px] font-medium text-left">
                <thead className="bg-neutral-50 text-[11px] font-medium text-amazon-textMuted border-b border-amazon-border">
                  <tr>
                    <th className="px-3 py-3">Part</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-3 py-3 text-right">Price</th>
                    <th className="px-3 py-3 text-right">Stock</th>
                    <th className="px-2 py-2 text-center">Status</th>
                    <th className="px-2 py-2">Recipe</th>
                    <th className="px-2 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border text-[13px]">
                  {filteredParts.map((part) => (
                    <PartRow
                      key={part.id}
                      part={part}
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

// --- Part Row ---
function PartRow({
  part,
  onView,
  onEdit,
  onDelete,
}: {
  part: PartItem;
  onView: (slug: string) => void;
  onEdit: (slug: string) => void;
  onDelete: (part: PartItem) => void;
}) {
  const typeCfg = PART_TYPE_CONFIG[part.partType] ?? {
    label: part.partType,
    color: "text-neutral-700",
    bgColor: "bg-neutral-100 border border-amazon-border",
    icon: Package,
  };
  const TypeIcon = typeCfg.icon;
  const statusInfo = STATUS_MAP[part.status] || {
    label: "Unknown",
    cls: "bg-neutral-100 text-neutral-600 border border-amazon-border",
  };

  const hasRecipe =
    part.recipeSwitchCount > 0 || part.recipeStabilizerCount > 0;

  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      {/* Part info */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-sm bg-neutral-50 border border-amazon-border overflow-hidden shrink-0 flex items-center justify-center p-0.5">
            {part.thumbnailUrl ? (
              <Image
                src={part.thumbnailUrl}
                alt={part.name}
                width={40}
                height={40}
                className="object-cover w-full h-full rounded-[2px]"
                unoptimized
              />
            ) : (
              <Package className="w-4 h-4 text-neutral-300" />
            )}
          </div>
          <div className="min-w-0 max-w-[120px] lg:max-w-[200px]">
            <p className="font-medium text-amazon-text text-[13px] truncate">{part.name}</p>
            <p className="text-[12px] text-amazon-textMuted truncate">{part.slug}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-2 py-2">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-sm ${typeCfg.bgColor} ${typeCfg.color}`}
        >
          <TypeIcon className="w-2.5 h-2.5" />
          {typeCfg.label}
        </span>
      </td>

      {/* Category */}
      <td className="px-2 py-2">
        <span className="text-[13px] font-medium text-amazon-textMuted truncate max-w-[100px] lg:max-w-[140px] block">
          {part.categoryName}
        </span>
      </td>

      {/* Price */}
      <td className="px-3 py-3 text-right">
        <span className="font-bold text-amazon-price text-[13px]">
          {formatPrice(part.price)}
        </span>
      </td>

      {/* Stock */}
      <td className="px-2.5 py-2.5 text-right">
        <span
          className={`font-medium text-[13px] ${
            part.stockQuantity <= 0
              ? "text-red-600"
              : part.stockQuantity < 100
                ? "text-amber-600"
                : "text-amazon-text"
          }`}
        >
          {part.stockQuantity.toLocaleString("vi-VN")}
        </span>
      </td>

      {/* Status */}
      <td className="px-2.5 py-2.5 text-center">
        <span
          className={`text-[11px] px-2 py-0.5 rounded-sm font-medium ${statusInfo.cls}`}
        >
          {statusInfo.label}
        </span>
      </td>

      {/* Recipe (for kit type) */}
      <td className="px-2 py-2">
        {hasRecipe ? (
          <div className="text-[11px] font-medium text-amazon-textMuted space-y-0.5">
            {part.recipeSwitchCount > 0 && (
               <p>
                <span className="text-amazon-text font-medium border border-amazon-border px-1 py-[1px] bg-white rounded-[2px] shadow-sm">
                  {part.recipeSwitchCount}
                </span>{" "}
                switches
              </p>
            )}
            {part.recipeStabilizerCount > 0 && (
              <p>
                <span className="text-amazon-text font-medium border border-amazon-border px-1 py-[1px] bg-white rounded-[2px] shadow-sm">
                  {part.recipeStabilizerCount}
                </span>{" "}
                stabs
              </p>
            )}
          </div>
        ) : (
          <span className="text-neutral-300 font-medium">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onView(part.slug)}
            className="p-1 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 hover:border-amazon-btnPrimary text-amazon-textMuted hover:text-amazon-text transition shrink-0"
            title="View part"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(part.slug)}
            className="p-1 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 hover:border-blue-500 text-amazon-textMuted hover:text-blue-500 transition shrink-0"
            title="Edit part"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(part)}
            className="p-1 rounded-sm border border-amazon-border bg-white hover:bg-red-50 hover:border-red-500 text-amazon-textMuted hover:text-red-500 transition shrink-0"
            title="Delete part"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
