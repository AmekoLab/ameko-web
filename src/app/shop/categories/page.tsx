"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchCategories } from "@/src/store/slices/categoriesSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { CategoryItem } from "@/src/types/category.types";
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Globe,
  Lock,
  Tag,
  Layers,
  Package,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import CreateCategoryModal from "@/src/components/Admin/CreateCategoryModal";
import EditCategoryModal from "@/src/components/Admin/EditCategoryModal";
import DeleteCategoryModal from "@/src/components/Admin/DeleteCategoryModal";

export default function ShopCategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);
  const { currentShop } = useAppSelector((state) => state.shop);

  // Tab filter
  const [activeTab, setActiveTab] = useState<"all" | "global" | "private">(
    "all",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );

  useEffect(() => {
    if (!currentShop) {
      dispatch(fetchCurrentShop());
    }
  }, [dispatch, currentShop]);

  useEffect(() => {
    if (currentShop?.id) {
      dispatch(fetchCategories(currentShop.id));
    }
  }, [dispatch, currentShop?.id]);

  // Filter categories by tab
  const filteredCategories = useMemo(() => {
    if (activeTab === "global")
      return categories.filter((c) => c.categoryType === "global");
    if (activeTab === "private")
      return categories.filter((c) => c.categoryType === "private");
    return categories;
  }, [categories, activeTab]);

  // Build tree from filtered list (show children under their global parents)
  const categoryTree = useMemo(() => {
    const allCats = filteredCategories;
    const roots = allCats.filter((c) => !c.parentId);
    const childMap = new Map<string, CategoryItem[]>();

    allCats.forEach((c) => {
      if (c.parentId) {
        const children = childMap.get(c.parentId) || [];
        children.push(c);
        childMap.set(c.parentId, children);
      }
    });

    // When showing "all", also attach private children whose parents are global roots
    if (activeTab === "all" || activeTab === "global") {
      // children already attached via parentId
    }

    return { roots, childMap };
  }, [filteredCategories, activeTab]);

  const globalCount = categories.filter(
    (c) => c.categoryType === "global",
  ).length;
  const privateCount = categories.filter(
    (c) => c.categoryType === "private",
  ).length;

  const tabs = [
    { key: "all" as const, label: "All", count: categories.length },
    { key: "global" as const, label: "Global", count: globalCount },
    { key: "private" as const, label: "My Shop", count: privateCount },
  ];

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-[#f5d800]" />
              Category Management
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Manage your shop categories. Use global categories as parents for
              your private sub-categories.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f5d800] text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#ffe500] transition shrink-0 shadow-[0_0_15px_rgba(245,216,0,0.3)]"
          >
            <Plus className="w-4 h-4 text-black" />
            Add Category
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-sm border transition-colors ${
                activeTab === tab.key
                  ? "bg-[#f5d800] text-black border-[#f5d800] shadow-[0_0_10px_rgba(245,216,0,0.2)]"
                  : "bg-[#151515] text-gray-400 border-[#1e2126] hover:bg-[#202030] hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[10px] tracking-widest opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading categories...
            </div>
          ) : categoryTree.roots.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="divide-y divide-[#1e2126]">
              {categoryTree.roots.map((root) => (
                <CategoryRow
                  key={root.id}
                  category={root}
                  childMap={categoryTree.childMap}
                  depth={0}
                  shopId={currentShop?.id || null}
                  onEdit={(cat) => {
                    setEditingCategory(cat);
                    setShowEditModal(true);
                  }}
                  onDelete={(cat) => {
                    setDeletingCategory(cat);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          if (currentShop?.id) dispatch(fetchCategories(currentShop.id));
        }}
        parentOptions={categories.filter((c) => c.categoryType === "global")}
        mode="shop"
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        category={editingCategory}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          if (currentShop?.id) dispatch(fetchCategories(currentShop.id));
        }}
        parentOptions={categories.filter((c) => c.categoryType === "global")}
        mode="shop"
      />

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={showDeleteModal}
        category={deletingCategory}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingCategory(null);
        }}
        onSuccess={() => {
          if (currentShop?.id) dispatch(fetchCategories(currentShop.id));
        }}
      />
    </div>
  );
}

// --- Recursive Category Row ---
function CategoryRow({
  category,
  childMap,
  depth,
  shopId,
  onEdit,
  onDelete,
}: {
  category: CategoryItem;
  childMap: Map<string, CategoryItem[]>;
  depth: number;
  shopId: string | null;
  onEdit: (cat: CategoryItem) => void;
  onDelete: (cat: CategoryItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = childMap.get(category.id) || [];
  const hasChildren = children.length > 0 || category.subCategoryCount > 0;
  const isPrivate = category.categoryType === "private";
  const isOwn = category.shopId === shopId;

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-5 py-4 hover:bg-[#202030] transition-colors border-b border-[#1e2126] ${
          depth > 0 ? "bg-[#0f0f0f]" : "bg-[#151515]"
        } ${isPrivate ? "border-l-4 border-l-[#f5d800]" : "border-l-4 border-l-transparent"}`}
        style={{ paddingLeft: `${20 + depth * 32}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`p-1 rounded-sm transition-colors ${
            hasChildren
              ? "hover:bg-[#202030] text-gray-400 hover:text-white cursor-pointer"
              : "text-transparent cursor-default"
          }`}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-sm shrink-0 border border-[#1e2126] flex items-center justify-center ${
            isPrivate ? "bg-[#f5d800]/10" : "bg-black"
          }`}
        >
          {depth === 0 ? (
            <Layers
              className={`w-4 h-4 ${isPrivate ? "text-[#f5d800]" : "text-gray-400"}`}
            />
          ) : (
            <Tag
              className={`w-4 h-4 ${isPrivate ? "text-[#f5d800]" : "text-gray-400"}`}
            />
          )}
        </div>

        {/* Name + Slug */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-[13px] text-white uppercase tracking-wider truncate">{category.name}</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{category.slug}</p>
        </div>

        {/* Type badge */}
        {isPrivate ? (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20 px-2 py-0.5 rounded-sm shrink-0">
            <Lock className="w-3 h-3" />
            Private
            {isOwn && (
              <span className="ml-1 text-[10px] opacity-70">(yours)</span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#202030] text-gray-400 border border-[#1e2126] px-2 py-0.5 rounded-sm shrink-0">
            <Globe className="w-3 h-3" />
            Global
          </span>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-gray-500 shrink-0">
          <span className="flex items-center gap-1" title="Sub-categories">
            <Layers className="w-3 h-3" />
            {category.subCategoryCount}
          </span>
          <span className="flex items-center gap-1" title="Parts">
            <Package className="w-3 h-3" />
            {category.partCount}
          </span>
        </div>

        {/* Active status */}
        <span
          className={`text-[10px] px-2 py-0.5 rounded-sm font-black uppercase tracking-widest shrink-0 border ${
            category.isActive
              ? "bg-[#202030] text-white border-white/10"
              : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>

        {/* Edit button — only for own private or if shop can edit */}
        {isOwn && (
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-sm border border-[#1e2126] bg-black hover:bg-[#202030] hover:border-[#f5d800] text-gray-500 hover:text-[#f5d800] transition shrink-0"
            title="Edit category"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete button — only for own private categories */}
        {isOwn && (
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 rounded-sm border border-[#1e2126] bg-black hover:bg-[#202030] hover:border-red-500 text-gray-500 hover:text-red-500 transition shrink-0"
            title="Delete category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Children */}
      {expanded &&
        children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            childMap={childMap}
            depth={depth + 1}
            shopId={shopId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}
