"use client";

import { FC, use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";

// 🔥 Import Service thay vì import trực tiếp Mock Data
import { NewsService, NewsArticle } from "@/src/services/news.service";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const NewsDetailPage: FC<PageProps> = ({ params }) => {
  const { slug } = use(params);

  // TODO: [API] Khi chuyển sang fetch data thật, cân nhắc chuyển Component này thành Server Component (async/await)
  // để tối ưu SEO. Nếu giữ Client Component, cần quản lý state loading/error như dưới đây:

  const [article, setArticle] = useState<NewsArticle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // TODO: [UI] Thêm Skeleton Loader khi đang loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Gọi qua Service, không quan tâm bên trong Service lấy data kiểu gì
        const data = await NewsService.getBySlug(slug);
        setArticle(data);
      } catch (err) {
        // TODO: [API] Log lỗi ra hệ thống monitoring (Sentry, Firebase...)
        console.error("Failed to fetch news:", err);
        setError("Có lỗi xảy ra khi tải bài viết.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // --- UI STATES ---

  // 1. Loading State
  if (isLoading) {
    // TODO: [UI] Thay thế text này bằng component <NewsDetailSkeleton /> cho đẹp
    return (
      <div className="min-h-screen pt-32 text-center">Loading article...</div>
    );
  }

  // 2. Not Found / Error State
  if (!article || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-black mb-4 text-black">
          ARTICLE NOT FOUND
        </h1>
        <p className="text-gray-500 mb-8">
          {error ? (
            error
          ) : (
            <>
              Could not find article with slug:{" "}
              <span className="font-bold text-red-600">{slug}</span>
            </>
          )}
        </p>
        <Link
          href="/news"
          className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors"
        >
          Back to News
        </Link>
      </div>
    );
  }

  // 3. Success State
  return (
    <article className="bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-[900px] mx-auto px-4 lg:px-8">
        {/* TODO: [SEO] Cần thêm thẻ <Head> hoặc generateMetadata để Google đọc được tiêu đề/ảnh bài viết */}

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#ce2a32] mb-4">
            {/* TODO: [API] Kiểm tra null check nếu category có thể null */}
            <span>{article.category || "General"}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {/* TODO: [API] Format ngày tháng từ ISO String (2025-09-25T...) sang định dạng đẹp */}
              {article.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight text-black">
            {article.title}
          </h1>
        </motion.div>

        {/* Image */}
        {article.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-video mb-12 bg-gray-100 overflow-hidden rounded-sm shadow-sm"
          >
            {/* TODO: [Performance] Khi có API, nên dùng BlurDataURL để load ảnh mượt hơn */}
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none text-gray-800 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-[#ce2a32] prose-strong:text-black"
        >
          {/* TODO: [Security] Cần sanitize HTML (dùng DOMPurify) trước khi render để tránh XSS attack từ API */}
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </motion.div>

        {/* Share Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Share
          </span>
          <div className="flex gap-4">
            {/* Các nút share (Dummy) */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-[#ce2a32] hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-[#ce2a32] hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsDetailPage;
