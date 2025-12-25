"use client";

import { useEffect, useState, useMemo, memo } from "react";
import Image from "next/image";
import { BuilderService } from "@/src/services/builder.service";
import { BuilderSession, Category, Product } from "@/src/types/builder";

// --- HELPERS ---
const getZIndex = (categorySlug?: string) => {
  if (!categorySlug) return 5;
  const map: Record<string, number> = {
    case: 10,
    pcb: 20,
    plate: 30,
    switch: 40,
    keycap: 50,
  };
  return map[categorySlug] || 5;
};

// --- SUB-COMPONENTS (Tách nhỏ để tối ưu hiệu năng render) ---

// --- CẤU HÌNH QUY TẮC ẨN LỚP (SMART MASKING) ---
// Định nghĩa: Nếu có [KEY] thì ẩn [VALUE]
// Ví dụ: Nếu có 'keycap' thì ẩn luôn 'switch' cho đỡ rối mắt
const HIDE_RULES: Record<string, string[]> = {
  keycap: ["switch"],
  // Bạn có thể thêm rule khác: ví dụ có 'case' kín thì ẩn 'pcb' nếu muốn
  // 'case': ['pcb'],
};

// --- CẤU HÌNH LAYER CỐ ĐỊNH (Quan trọng) ---
// Định nghĩa thứ tự vẽ: Từ dưới lên trên
const LAYER_ORDER = ["case", "pcb", "plate", "switch", "keycap"];

// Component Visualizer (Phiên bản Fixed Slots - Không bao giờ chớp giật)
const Visualizer = memo(({ images }: { images: Product[] }) => {
  // 1. Chuyển đổi mảng images thành Object để dễ truy xuất theo slug
  // Ví dụ: { case: ProductA, switch: ProductB, ... }
  const layerMap = useMemo(() => {
    const map: Record<string, Product> = {};
    images.forEach((img) => {
      if (img._tempSlug) map[img._tempSlug] = img;
    });
    return map;
  }, [images]);

  // 2. Logic Masking 
  // Tính toán trước xem có Keycap không?
  const hasKeycap = !!layerMap["keycap"];

  return (
    <div className="relative w-full max-w-[1000px] aspect-[4/3] lg:aspect-video">
      {/* Placeholder khi trống */}
      {images.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0">
          <span className="text-4xl opacity-20 mb-2">⌨️</span>
          <p className="text-sm font-medium opacity-50">Chưa có linh kiện</p>
        </div>
      )}

      {/* VẼ TỪNG LỚP THEO THỨ TỰ CỐ ĐỊNH */}
      {LAYER_ORDER.map((slug) => {
        const product = layerMap[slug];

       
        // Nếu đang vẽ lớp 'switch' MÀ đã có 'keycap' -> Ẩn Switch đi (Opacity 0)
        // Lưu ý: Ta dùng Opacity chứ không dùng unmount (null) để giữ ổn định DOM
        const isHidden = slug === "switch" && hasKeycap;

        // Nếu không có sản phẩm ở lớp này thì bỏ qua
        if (!product) return null;

        return (
          <div
            key={slug} 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out"
            style={{
              zIndex: getZIndex(slug),
              opacity: isHidden ? 0 : 1, 
            }}
          >
            <Image
              src={product.layerImageUrl}
              alt={product.name}
              fill
              className="object-contain"
             
              priority={slug === "case"}
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          </div>
        );
      })}
    </div>
  );
});
Visualizer.displayName = "Visualizer";

// 2. Component Product Item 
const ProductItem = memo(
  ({
    product,
    isSelected,
    onClick,
  }: {
    product: Product;
    isSelected: boolean;
    onClick: (p: Product) => void;
  }) => (
    <div
      onClick={() => onClick(product)}
      className={`
      group cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all duration-200 select-none
      ${
        isSelected
          ? "border-yellow-300 bg-black-50/50 shadow-sm"
          : " bg-black-50/50 shadow-sm hover:shadow-md"
      }
    `}
    >
      <div className="w-22 h-22 bg-black rounded-lg  relative shrink-0 overflow-hidden">
        <Image
          src={product.thumbnailUrl}
          alt={product.name}
          fill
          className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
          sizes="64px"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold text-sm truncate ${
            isSelected ? "text-white" : "text-white"
          }`}
        >
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-sm text-white">${product.price}</span>
          {product.attributes &&
            Object.entries(product.attributes)
              .slice(0, 1)
              .map(
                ([k, v]) =>
                  k !== "categoryId" && (
                    <span
                      key={k}
                      className="text-[9px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200"
                    >
                      {String(v)}
                    </span>
                  )
              )}
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
          isSelected
            ? "bg-blue-600 border-blue-600 text-white"
            : "border-gray-300 group-hover:border-slate-400"
        }`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </div>
    </div>
  )
);
ProductItem.displayName = "ProductItem";

// 3. Component None Item
const NoneItem = memo(
  ({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) => (
    <div
      onClick={onClick}
      className={`
    group cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all duration-200 select-none
    ${
      isSelected
        ? "border-yellow-300 bg-black shadow-sm"
        : "border-gray-200 hover:border-red-300 bg-black hover:shadow-md"
    }
  `}
    >
      {/* Container của ảnh */}
      <div
        className={`
      w-16 h-16 rounded-lg flex items-center justify-center border shrink-0 transition-colors relative overflow-hidden
      ${
        isSelected
          ? "border-yellow-300 bg-gray-900" 
          : "border-gray-100 bg-gray-50 group-hover:bg-red-50" 
      }
    `}
      >
       
        <Image
          src="https://res.cloudinary.com/doezwafgz/image/upload/v1766678625/None-removebg-preview_bnlaih.png"
          alt="None"
          fill
          className="object-contain p-3" 
          sizes="64px"
        />
      </div>

      <div className="flex-1">
        <h4
          className={`font-bold text-sm uppercase ${
            isSelected ? "text-white" : "text-white"
          }`}
        >
          None (Skip)
        </h4>
        <div className="text-[10px] text-gray-400 mt-1">
          Không sử dụng linh kiện này
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
          isSelected
            ? "bg-red-500 border-red-500 text-white"
            : "border-gray-300"
        }`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </div>
    </div>
  )
);
NoneItem.displayName = "NoneItem";

// --- MAIN PAGE ---
export default function BuilderPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [session, setSession] = useState<BuilderSession | null>(null);
  const [steps, setSteps] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("");
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [selectedImages, setSelectedImages] = useState<Product[]>([]);

  // Init Data
  useEffect(() => {
    const init = async () => {
      try {
        const savedId = localStorage.getItem("builderSessionId") || undefined;
        const [sessionData, stepsData] = await Promise.all([
          BuilderService.initSession(savedId),
          BuilderService.getAllSteps(),
        ]);

        localStorage.setItem("builderSessionId", sessionData.session.id);
        setSession(sessionData.session);

        if (sessionData.selectedDetails) {
          const imagesWithSlug = sessionData.selectedDetails.map(
            (p: Product) => ({
              ...p,
              _tempSlug: p.category ? p.category.slug : "unknown",
            })
          );
          setSelectedImages(imagesWithSlug);
        }

        setSteps(stepsData);
        if (stepsData.length > 0) {
          fetchStepData(stepsData[0].slug);
        }
      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /
  // Khi danh sách sản phẩm (currentProducts) thay đổi, ta ngầm tải trước ảnh layer của chúng
  useEffect(() => {
    if (currentProducts.length > 0) {
      currentProducts.forEach((product) => {
        const img = new window.Image();
        img.src = product.layerImageUrl; 
      });
    }
  }, [currentProducts]);

  const fetchStepData = async (slug: string) => {
    
    if (slug === activeSlug) return;

    setProcessing(true);
    setActiveSlug(slug);
    try {
      const data = await BuilderService.getStepProducts(slug);
      setCurrentProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleSelect = async (product: Product | null) => {
    if (!session) return;

    // 1. Optimistic Update (Cập nhật UI ngay lập tức)
    setSelectedImages((prev) => {
      const others = prev.filter((img) => img._tempSlug !== activeSlug);
      if (product) {
        return [...others, { ...product, _tempSlug: activeSlug }];
      } else {
        return others;
      }
    });

    // 2. Cập nhật Session State tạm thời (để hiện tick xanh ngay)
    const newSelection = { ...session.selection };
    if (product) {
      newSelection[activeSlug] = product.id;
    } else {
      delete newSelection[activeSlug];
    }
   
    setSession({ ...session, selection: newSelection });

    // 3. Gọi API Background
    try {
      const productIdToSend = product ? product.id : -1;
      const data = await BuilderService.selectProduct(
        session.id,
        activeSlug,
        productIdToSend
      );
      setSession(data.session); 
    } catch (error) {
      console.error("Lỗi lưu sản phẩm", error);
    }
  };

  const handleReset = () => {
    if (confirm("Reset toàn bộ cấu hình?")) {
      localStorage.removeItem("builderSessionId");
      window.location.reload();
    }
  };

  // Tính toán Nav Items để tránh render lại trong vòng lặp
  const navItems = useMemo(
    () =>
      steps.map((step, index) => ({
        ...step,
        index: index + 1,
        isActive: activeSlug === step.slug,
        isCompleted: session?.selection
          ? !!session.selection[step.slug]
          : false,
      })),
    [steps, activeSlug, session?.selection]
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-black rounded-full"></div>
      </div>
    );

  return (
    <div className="h-screen flex flex-col font-sans bg-gray-50 overflow-hidden text-slate-800">
      {/* HEADER */}
      <div className="h-16 bg-black flex items-center justify-between px-4 lg:px-8 shadow-lg z-50 shrink-0 text-white">
        <div className="font-black text-xl tracking-tighter uppercase mr-4 lg:mr-10 flex items-center gap-2">
          <span>Ameko</span>
          <span className="text-blue-500">Lab</span>
        </div>

        {/* Navigation Bar */}
        <div className="flex-1 flex items-center justify-start lg:justify-center gap-0 h-full overflow-x-auto custom-scrollbar">
          {navItems.map((step) => (
            <button
              key={step.id}
              onClick={() => fetchStepData(step.slug)}
              className={`
                    relative h-full px-4 lg:px-6 flex items-center justify-center gap-2 uppercase font-bold text-[10px] lg:text-xs tracking-wider transition-all whitespace-nowrap
                    ${
                      step.isActive
                        ? "text-yellow-400 border-b-4 border-yellow-400 bg-white/5"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border-b-4 border-transparent"
                    }
                  `}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                  step.isActive
                    ? "border-yellow-400 text-yellow-400"
                    : "border-gray-500 text-gray-500"
                }`}
              >
                {step.index}
              </span>
              {step.name}
              {step.isCompleted && !step.isActive && (
                <span className="text-green-500 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase font-bold">
              Total Est.
            </div>
            <div className="text-white font-bold text-lg leading-none">
              ${session?.totalPrice || 0}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded hover:bg-red-900/40 transition-all"
          >
            RESET
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: VISUALIZER */}
        <div
          className="w-full lg:w-2/3 bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/doezwafgz/image/upload/v1766677524/background_teui0y.png')",
            backgroundColor: "#1a1a1a", 
          }}
        >
          <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>

          <div className="absolute top-4 left-4 text-xs font-bold text-gray-300 uppercase tracking-widest z-10">
            Visualizer Preview
          </div>

          
          <Visualizer images={selectedImages} />
        </div>

        {/* RIGHT COLUMN: CONFIGURATOR */}
        <div className="hidden lg:flex w-1/3 bg-black  flex-col z-10 shadow-2xl">
          <div className="p-6  shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded uppercase">
                Step {steps.findIndex((s) => s.slug === activeSlug) + 1}
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">
              {steps.find((s) => s.slug === activeSlug)?.name ||
                "Select Component"}
            </h2>
          </div>

          {/* Grid Products */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-black">
            {processing ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full" />
                <span className="text-xs text-gray-400 font-medium">
                  Đang tải dữ liệu...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {/* None Item */}
                <NoneItem
                  isSelected={!session?.selection[activeSlug]}
                  onClick={() => handleSelect(null)}
                />

                {/* Product Items */}
                {currentProducts.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isSelected={session?.selection[activeSlug] === product.id}
                    onClick={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER NAVIGATION */}
          <div className="p-4 bg-black shrink-0 border-t border-gray-800 flex items-center gap-3">
            {/* NÚT BACK */}
            <button
              onClick={() => {
                const currIdx = steps.findIndex((s) => s.slug === activeSlug);
                if (currIdx > 0) fetchStepData(steps[currIdx - 1].slug);
              }}
              
              disabled={steps.findIndex((s) => s.slug === activeSlug) === 0}
              className={`
                flex-1 py-3.5 font-bold uppercase text-sm rounded-lg transition-all shadow-lg active:translate-y-[1px] border
                ${
                  steps.findIndex((s) => s.slug === activeSlug) === 0
                    ? "bg-black text-gray-600 border-gray-800 cursor-not-allowed" 
                    : "bg-black text-white border-gray-600 hover:bg-gray-800 hover:border-gray-500" 
                }
              `}
            >
              &larr; Back
            </button>

            {/* NÚT NEXT */}
            <button
              onClick={() => {
                const currIdx = steps.findIndex((s) => s.slug === activeSlug);
                if (currIdx < steps.length - 1)
                  fetchStepData(steps[currIdx + 1].slug);
                else alert("Hoàn tất! Bạn có thể thêm vào giỏ hàng ngay.");
              }}
              className="flex-1 py-3.5 bg-yellow-400 text-black font-bold uppercase text-sm rounded-lg hover:bg-yellow-300 transition-all shadow-lg active:translate-y-[1px]"
            >
              
              {steps.findIndex((s) => s.slug === activeSlug) ===
              steps.length - 1
                ? "Finish"
                : "Next Step"}{" "}
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
