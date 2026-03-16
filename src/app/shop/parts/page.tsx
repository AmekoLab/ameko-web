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
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border border-purple-500/20",
    icon: Keyboard,
  },
  component: {
    label: "Component",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border border-blue-500/20",
    icon: Box,
  },
  accessory: {
    label: "Accessory",
    color: "text-green-400",
    bgColor: "bg-green-500/10 border border-green-500/20",
    icon: Layers,
  },
};

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: "Active", cls: "bg-[#202030] text-white border border-white/10" },
  0: { label: "Inactive", cls: "bg-red-500/10 text-red-500 border border-red-500/20" },
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
    <div className="py-6 px-2 md:px-6 relative bg-black min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Package className="w-8 h-8 text-[#f5d800]" />
              Part Management
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Manage your shop&apos;s parts and components.{" "}
              <span className="font-black text-[#f5d800]">{total}</span> parts
              total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckStockOpen(true)}
              className="px-5 py-2.5 bg-[#202030] border border-[#1e2126] text-white text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#303040] hover:text-[#f5d800] hover:border-[#f5d800] transition flex items-center gap-2 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" />
              Check Stock
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-[#f5d800] text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#ffe500] transition flex items-center gap-2 shadow-[0_0_15px_rgba(245,216,0,0.3)]"
            >
              <Plus className="w-4 h-4 text-black" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#1e2126] rounded-sm text-[11px] font-bold uppercase tracking-widest bg-[#151515] text-white focus:outline-none focus:border-[#f5d800] focus:ring-1 focus:ring-[#f5d800]/30 transition placeholder:text-gray-600"
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
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-colors ${
                      isActive
                        ? "bg-[#f5d800] text-black border-[#f5d800] shadow-[0_0_10px_rgba(245,216,0,0.2)]"
                        : "bg-[#151515] text-gray-400 border-[#1e2126] hover:bg-[#202030] hover:text-white"
                    }`}
                  >
                    All
                    <span className="ml-1 opacity-70">({count})</span>
                  </button>
                );
              }
              const cfg = PART_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-colors flex items-center gap-2 ${
                    isActive
                      ? "bg-[#f5d800] text-black border-[#f5d800] shadow-[0_0_10px_rgba(245,216,0,0.2)]"
                      : "bg-[#151515] text-gray-400 border-[#1e2126] hover:bg-[#202030] hover:text-white"
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {cfg.label}
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading parts...
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              No parts found.
            </div>
          ) : (
            <div className="min-w-full">
              <table className="w-full text-xs uppercase tracking-widest text-left">
                <thead>
                  <tr className="bg-black border-b border-[#1e2126] text-gray-400">
                    <th className="px-3 py-3 font-black">Part</th>
                    <th className="px-2 py-2 font-black">Type</th>
                    <th className="px-2 py-2 font-black">Category</th>
                    <th className="px-3 py-3 font-black text-right">Price</th>
                    <th className="px-3 py-3 font-black text-right">Stock</th>
                    <th className="px-2 py-2 font-black text-center">Status</th>
                    <th className="px-2 py-2 font-black">Recipe</th>
                    <th className="px-2 py-2 font-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
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
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Package,
  };
  const TypeIcon = typeCfg.icon;
  const statusInfo = STATUS_MAP[part.status] || {
    label: "Unknown",
    cls: "bg-gray-100 text-gray-600",
  };

  const hasRecipe =
    part.recipeSwitchCount > 0 || part.recipeStabilizerCount > 0;

  return (
    <tr className="hover:bg-[#202030] transition-colors">
      {/* Part info */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-sm bg-black border border-[#1e2126] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
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
              <Package className="w-3 h-3 text-gray-500" />
            )}
          </div>
          <div className="min-w-0 max-w-[120px] lg:max-w-[200px]">
            <p className="font-black text-white text-[11px] tracking-wider truncate">{part.name}</p>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{part.slug}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-2 py-2">
        <span
          className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest ${typeCfg.bgColor} ${typeCfg.color}`}
        >
          <TypeIcon className="w-2.5 h-2.5" />
          {typeCfg.label}
        </span>
      </td>

      {/* Category */}
      <td className="px-2 py-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[100px] lg:max-w-[140px] block">
          {part.categoryName}
        </span>
      </td>

      {/* Price */}
      <td className="px-3 py-3 text-right">
        <span className="font-bold text-[#f5d800] text-[11px] tracking-wider">
          {formatPrice(part.price)}
        </span>
      </td>

      {/* Stock */}
      <td className="px-2.5 py-2.5 text-right">
        <span
          className={`font-black text-[11px] tracking-wider ${
            part.stockQuantity <= 0
              ? "text-red-500"
              : part.stockQuantity < 100
                ? "text-orange-500"
                : "text-white"
          }`}
        >
          {part.stockQuantity.toLocaleString("vi-VN")}
        </span>
      </td>

      {/* Status */}
      <td className="px-2.5 py-2.5 text-center">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-widest ${statusInfo.cls}`}
        >
          {statusInfo.label}
        </span>
      </td>

      {/* Recipe (for kit type) */}
      <td className="px-2 py-2">
        {hasRecipe ? (
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 space-y-0.5">
            {part.recipeSwitchCount > 0 && (
              <p>
                <span className="font-black text-white">
                  {part.recipeSwitchCount}
                </span>{" "}
                switches
              </p>
            )}
            {part.recipeStabilizerCount > 0 && (
              <p>
                <span className="font-black text-white">
                  {part.recipeStabilizerCount}
                </span>{" "}
                stabs
              </p>
            )}
          </div>
        ) : (
          <span className="text-gray-600">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onView(part.slug)}
            className="p-1 rounded-sm border border-[#1e2126] bg-black hover:bg-[#202030] hover:border-[#f5d800] text-gray-500 hover:text-[#f5d800] transition shrink-0"
            title="View part"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => onEdit(part.slug)}
            className="p-1 rounded-sm border border-[#1e2126] bg-black hover:bg-[#202030] hover:border-blue-500 text-gray-500 hover:text-blue-500 transition shrink-0"
            title="Edit part"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(part)}
            className="p-1 rounded-sm border border-[#1e2126] bg-black hover:bg-[#202030] hover:border-red-500 text-gray-500 hover:text-red-500 transition shrink-0"
            title="Delete part"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}
