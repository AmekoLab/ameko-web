"use client";
import { ProductSpecs as SpecsType } from "@/src/types/product";
import { useTranslations } from "next-intl";

interface ProductSpecsProps {
  specs: SpecsType;
}

export const ProductSpecs = ({ specs }: ProductSpecsProps) => {
  const t = useTranslations("ProductSpecs");

  const allRows = [
    { label: t("layoutSize"), value: specs.layout },
    { label: t("mountingStyle"), value: specs.mounting },
    { label: t("pcbTech"), value: specs.pcb },
    { label: t("connection"), value: specs.connection },
    { label: t("batteryCapacity"), value: specs.battery },
    { label: t("pollingRate"), value: specs.pollingRate },
    { label: t("antiGhosting"), value: specs.antiGhosting },
    { label: t("caseMaterial"), value: specs.caseMaterial },
    { label: t("plateMaterial"), value: specs.plateMaterial },
    { label: t("weight"), value: specs.weight },
    { label: t("warranty"), value: specs.warranty },
  ];

  const rows = allRows.filter((row) => row.value);

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 py-3.5 border-b border-amazon-border gap-2 md:gap-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="md:col-span-5 text-[10px] font-black uppercase tracking-widest text-amazon-textMuted">
              {row.label}
            </div>
            <div className="md:col-span-7 text-sm text-amazon-text font-medium">
              {row.value || t("na")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
