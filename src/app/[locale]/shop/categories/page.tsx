"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchCategories } from "@/src/store/slices/categoriesSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { CategoryItem } from "@/src/types/category.types";
import {
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
  const t = useTranslations("ShopCategoriesPage");
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
    { key: "all" as const, label: t("tabAll"), count: categories.length },
    { key: "global" as const, label: t("tabGlobal"), count: globalCount },
    { key: "private" as const, label: t("tabMyShop"), count: privateCount },
  ];

  return (
    <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-5 border-b border-amazon-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text mb-1 flex items-center gap-2">
              {t("pageTitle")}
            </h1>
            <p className="text-[13px] text-amazon-textMuted font-medium">
              {t("pageDesc")}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-amazon-btnPrimary text-amazon-text text-[13px] font-medium rounded-sm border border-amazon-border hover:brightness-95 transition shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("addCategory")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-[13px] font-medium rounded-sm border transition-colors ${
                activeTab === tab.key
                  ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary shadow-sm"
                  : "bg-white text-amazon-textMuted border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[11px] bg-white/40 px-1.5 py-0.5 rounded-sm border border-amazon-border/20">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-sm border border-amazon-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-[13px] font-medium text-amazon-textMuted">
              {t("loadingCategories")}
            </div>
          ) : categoryTree.roots.length === 0 ? (
            <div className="p-12 text-center text-[13px] font-medium text-amazon-textMuted">
              {t("noCategoriesFound")}
            </div>
          ) : (
            <div className="divide-y divide-amazon-border">
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
  const t = useTranslations("ShopCategoriesPage");
  const [expanded, setExpanded] = useState(false);
  const children = childMap.get(category.id) || [];
  const hasChildren = children.length > 0 || category.subCategoryCount > 0;
  const isPrivate = category.categoryType === "private";
  const isOwn = category.shopId === shopId;

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors border-b border-amazon-border ${
          depth > 0 ? "bg-neutral-50/50" : "bg-white"
        } ${isPrivate ? "border-l-4 border-l-amazon-btnPrimary" : "border-l-4 border-l-transparent"}`}
        style={{ paddingLeft: `${20 + depth * 32}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`p-1 rounded-sm transition-colors ${
            hasChildren
              ? "hover:bg-neutral-200 text-amazon-textMuted hover:text-amazon-text cursor-pointer"
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
          className={`w-8 h-8 rounded-sm shrink-0 border border-amazon-border flex items-center justify-center ${
            isPrivate ? "bg-yellow-50" : "bg-neutral-50"
          }`}
        >
          {depth === 0 ? (
            <Layers
              className={`w-4 h-4 ${isPrivate ? "text-amber-500" : "text-neutral-400"}`}
            />
          ) : (
            <Tag
              className={`w-4 h-4 ${isPrivate ? "text-amber-500" : "text-neutral-400"}`}
            />
          )}
        </div>

        {/* Name + Slug */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[13px] text-amazon-text truncate">
            {category.name}
          </p>
          <p className="text-[12px] text-amazon-textMuted truncate">
            {category.slug}
          </p>
        </div>

        {/* Type badge */}
        {isPrivate ? (
          <span className="flex items-center gap-1 text-[11px] font-medium bg-yellow-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-sm shrink-0">
            <Lock className="w-3 h-3" />
            {t("typePrivate")}
            {isOwn && (
              <span className="ml-1 text-[10px] opacity-70">
                ({t("yours")})
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium bg-neutral-100 text-amazon-textMuted border border-amazon-border px-2 py-0.5 rounded-sm shrink-0">
            <Globe className="w-3 h-3" />
            {t("typeGlobal")}
          </span>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-[13px] font-medium text-amazon-textMuted shrink-0">
          <span
            className="flex items-center gap-1"
            title={t("subCategoriesTitle")}
          >
            <Layers className="w-3.5 h-3.5" />
            {category.subCategoryCount}
          </span>
          <span className="flex items-center gap-1" title={t("partsTitle")}>
            <Package className="w-3.5 h-3.5" />
            {category.partCount}
          </span>
        </div>

        {/* Active status */}
        <span
          className={`text-[11px] px-2 py-0.5 rounded-sm font-medium shrink-0 border ${
            category.isActive
              ? "bg-neutral-100 text-amazon-text border-amazon-border"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {category.isActive ? t("statusActive") : t("statusInactive")}
        </span>

        {/* Edit button — only for own private or if shop can edit */}
        {isOwn && (
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 hover:border-amazon-btnPrimary text-amazon-textMuted hover:text-amazon-text transition shrink-0"
            title={t("editCategory")}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete button — only for own private categories */}
        {isOwn && (
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-red-50 hover:border-red-500 text-amazon-textMuted hover:text-red-500 transition shrink-0"
            title={t("deleteCategory")}
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
