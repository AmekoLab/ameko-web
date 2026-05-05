import { useTranslations } from "next-intl";

export default function TermsOfServicePage() {
  const t = useTranslations("FooterPages.Terms");

  return (
    <div className="bg-amazon-bgSecondary min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-amazon-border text-amazon-text">
          <h1 className="text-3xl font-black mb-8 border-b pb-4">{t("title")}</h1>
          
          <div className="space-y-8 leading-relaxed">
            <p className="text-neutral-600">{t("intro1")}</p>

            <section>
              <h2 className="text-xl font-bold mb-4">{t("section1Title")}</h2>
              <ul className="list-disc pl-6 space-y-3 text-neutral-700">
                <li>{t("section1Content1")}</li>
                <li>{t("section1Content2")}</li>
                <li>{t("section1Content3")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">{t("section2Title")}</h2>
              <ul className="list-disc pl-6 space-y-3 text-neutral-700">
                <li>{t("section2Content1")}</li>
                <li>{t("section2Content2")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">{t("section3Title")}</h2>
              <p className="text-neutral-700">{t("section3Content1")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">{t("section4Title")}</h2>
              <p className="text-neutral-700">{t("section4Content1")}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
