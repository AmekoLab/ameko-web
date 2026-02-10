"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchCategories } from "@/src/store/slices/categoriesSlice";
import { CategoryItem } from "@/src/types/category.types";
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Globe,
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

export default function AdminCategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);
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
    // Admin: no shopId → only returns global categories
    dispatch(fetchCategories(undefined));
  }, [dispatch]);

  // --- Build tree structure from flat list ---
  const categoryTree = useMemo(() => {
    // Admin only sees global categories
    const globalCats = categories.filter((c) => c.categoryType === "global");
    const roots = globalCats.filter((c) => !c.parentId);
    const childMap = new Map<string, CategoryItem[]>();

    globalCats.forEach((c) => {
      if (c.parentId) {
        const children = childMap.get(c.parentId) || [];
        children.push(c);
        childMap.set(c.parentId, children);
      }
    });

    return { roots, childMap };
  }, [categories]);

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase flex items-center gap-3">
              <FolderTree className="w-8 h-8" />
              Category Management
            </h1>
            <p className="text-gray-500">
              Manage global categories available to all shops on the platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Total:{" "}
              <strong>
                {categories.filter((c) => c.categoryType === "global").length}
              </strong>{" "}
              global categories
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading categories...
            </div>
          ) : categoryTree.roots.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No global categories found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categoryTree.roots.map((root) => (
                <CategoryRow
                  key={root.id}
                  category={root}
                  childMap={categoryTree.childMap}
                  depth={0}
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
        onSuccess={() => dispatch(fetchCategories(undefined))}
        parentOptions={categories.filter((c) => c.categoryType === "global")}
        mode="admin"
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        category={editingCategory}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        onSuccess={() => dispatch(fetchCategories(undefined))}
        parentOptions={categories.filter((c) => c.categoryType === "global")}
        mode="admin"
      />

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={showDeleteModal}
        category={deletingCategory}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingCategory(null);
        }}
        onSuccess={() => dispatch(fetchCategories(undefined))}
      />
    </div>
  );
}

// --- Recursive Category Row ---
function CategoryRow({
  category,
  childMap,
  depth,
  onEdit,
  onDelete,
}: {
  category: CategoryItem;
  childMap: Map<string, CategoryItem[]>;
  depth: number;
  onEdit: (cat: CategoryItem) => void;
  onDelete: (cat: CategoryItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = childMap.get(category.id) || [];
  const hasChildren = children.length > 0 || category.subCategoryCount > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${
          depth > 0 ? "bg-gray-50/50" : ""
        }`}
        style={{ paddingLeft: `${20 + depth * 32}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`p-1 rounded transition ${
            hasChildren
              ? "hover:bg-gray-200 text-gray-600 cursor-pointer"
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
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          {depth === 0 ? (
            <Layers className="w-4 h-4 text-blue-600" />
          ) : (
            <Tag className="w-4 h-4 text-blue-400" />
          )}
        </div>

        {/* Name + Slug */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{category.name}</p>
          <p className="text-xs text-gray-400 truncate">{category.slug}</p>
        </div>

        {/* Type badge */}
        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase shrink-0">
          <Globe className="w-3 h-3" />
          Global
        </span>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
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
          className={`text-xs px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
            category.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>

        {/* Edit button */}
        <button
          onClick={() => onEdit(category)}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition shrink-0"
          title="Edit category"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(category)}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 text-gray-500 hover:text-red-600 transition shrink-0"
          title="Delete category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Children */}
      {expanded &&
        children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            childMap={childMap}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}
