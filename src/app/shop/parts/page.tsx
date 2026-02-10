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
    bgColor: "bg-purple-100",
    icon: Keyboard,
  },
  case: {
    label: "Case",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Box,
  },
  plate: {
    label: "Plate",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
    icon: Layers,
  },
  switch: {
    label: "Switch",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: ToggleLeft,
  },
  keycap: {
    label: "Keycap",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: CircleDot,
  },
  stabilizer: {
    label: "Stabilizer",
    color: "text-rose-700",
    bgColor: "bg-rose-100",
    icon: Grip,
  },
};

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: "Active", cls: "bg-green-100 text-green-700" },
  0: { label: "Inactive", cls: "bg-red-100 text-red-700" },
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
    "case",
    "plate",
    "switch",
    "keycap",
    "stabilizer",
  ];

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase flex items-center gap-3">
              <Package className="w-8 h-8" />
              Part Management
            </h1>
            <p className="text-gray-500">
              Manage your shop&apos;s parts and components.{" "}
              <span className="font-semibold text-gray-700">{total}</span> parts
              total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckStockOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" />
              Check Stock
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cfg.label}
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading parts...
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No parts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Part
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Type
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Category
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-right">
                      Price
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-right">
                      Stock
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-center">
                      Status
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs">
                      Recipe
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-xs text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Part info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
            {part.thumbnailUrl ? (
              <Image
                src={part.thumbnailUrl}
                alt={part.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <Package className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{part.name}</p>
            <p className="text-xs text-gray-400 truncate">{part.slug}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded uppercase ${typeCfg.bgColor} ${typeCfg.color}`}
        >
          <TypeIcon className="w-3 h-3" />
          {typeCfg.label}
        </span>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700 capitalize">
          {part.categoryName}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-gray-900">
          {formatPrice(part.price)}
        </span>
      </td>

      {/* Stock */}
      <td className="px-4 py-3 text-right">
        <span
          className={`font-semibold ${
            part.stockQuantity <= 0
              ? "text-red-600"
              : part.stockQuantity < 100
                ? "text-amber-600"
                : "text-gray-900"
          }`}
        >
          {part.stockQuantity.toLocaleString("vi-VN")}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-center">
        <span
          className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${statusInfo.cls}`}
        >
          {statusInfo.label}
        </span>
      </td>

      {/* Recipe (for kit type) */}
      <td className="px-4 py-3">
        {hasRecipe ? (
          <div className="text-xs text-gray-500 space-y-0.5">
            {part.recipeSwitchCount > 0 && (
              <p>
                <span className="font-semibold text-gray-700">
                  {part.recipeSwitchCount}
                </span>{" "}
                switches
              </p>
            )}
            {part.recipeStabilizerCount > 0 && (
              <p>
                <span className="font-semibold text-gray-700">
                  {part.recipeStabilizerCount}
                </span>{" "}
                stabs
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onView(part.slug)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition shrink-0"
            title="View part"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(part.slug)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-500 hover:text-amber-600 transition shrink-0"
            title="Edit part"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(part)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 text-gray-500 hover:text-red-600 transition shrink-0"
            title="Delete part"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
