import { useTranslations } from "next-intl";

export default function ReturnPolicyPage() {
  const t = useTranslations("FooterPages.ReturnPolicy");

  return (
    <div className="bg-amazon-bgSecondary min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-amazon-border text-amazon-text">
          {/* Header */}
          <h1 className="text-3xl font-black mb-2 border-b pb-4">
            {t("title")}
          </h1>
          <p className="text-xs text-amazon-textMuted mb-10 font-medium">
            {t("lastUpdated")}
          </p>

          <div className="space-y-10 leading-relaxed">
            {/* Section 1: One-for-One */}
            <section>
              <h2 className="text-xl font-bold mb-3 text-amazon-text">
                {t("section1Title")}
              </h2>
              <p className="text-neutral-600 mb-3">{t("section1Desc")}</p>
              <ul className="list-disc pl-6 space-y-2.5 text-neutral-700">
                <li>{t("section1Cond1")}</li>
                <li>{t("section1Cond2")}</li>
                <li>
                  {t("section1Cond3")}
                  <p className="mt-1.5 ml-2 text-sm text-neutral-500 border-l-2 border-amazon-btnSecondary pl-3">
                    {t("section1Time")}
                  </p>
                </li>
              </ul>
            </section>

            {/* Section 2: Equivalent Exchange */}
            <section>
              <h2 className="text-xl font-bold mb-1 text-amazon-text">
                {t("section2Title")}
              </h2>
              <p className="text-sm text-amazon-textMuted mb-3 italic">
                {t("section2Subtitle")}
              </p>
              <p className="text-neutral-600 mb-3">{t("section2Desc")}</p>
              <ul className="list-disc pl-6 space-y-2.5 text-neutral-700">
                <li>{t("section2Cond1")}</li>
                <li>
                  {t("section2Cond2")}
                  <p className="mt-1.5 ml-2 text-sm text-neutral-500 border-l-2 border-red-300 pl-3">
                    {t("section2Time")}
                  </p>
                </li>
              </ul>
            </section>

            {/* Section 3: Non-Returnable Categories — Table */}
            <section>
              <h2 className="text-xl font-bold mb-1 text-amazon-text">
                {t("section3Title")}
              </h2>
              <p className="text-sm text-amazon-textMuted mb-4 italic">
                {t("section3Subtitle")}
              </p>
              <div className="overflow-hidden rounded-md border border-amazon-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="text-left px-5 py-3 font-bold text-amazon-text border-b border-amazon-border">
                        {t("section3ColCategory")}
                      </th>
                      <th className="text-left px-5 py-3 font-bold text-amazon-text border-b border-amazon-border">
                        {t("section3ColReason")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 text-neutral-700 font-medium">
                        {t("section3Row1Category")}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {t("section3Row1Reason")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Return & Refund Process */}
            <section>
              <h2 className="text-xl font-bold mb-3 text-amazon-text">
                {t("section4Title")}
              </h2>
              <ul className="space-y-3">
                {(["section4Step1", "section4Step2", "section4Step3"] as const).map(
                  (key, idx) => (
                    <li key={key} className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-amazon-btnSecondary text-amazon-text flex items-center justify-center text-xs font-black mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-neutral-700">{t(key)}</span>
                    </li>
                  ),
                )}
              </ul>

              {/* Note */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ {t("section4Note")}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
