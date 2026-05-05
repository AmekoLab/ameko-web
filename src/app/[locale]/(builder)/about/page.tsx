import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("FooterPages.About");

  return (
    <div className="bg-amazon-bgSecondary min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-amazon-border text-amazon-text">
          <h1 className="text-3xl font-black mb-8 border-b pb-4">{t("title")}</h1>
          
          <div className="space-y-6 leading-relaxed text-lg">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
