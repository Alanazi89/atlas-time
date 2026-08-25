/** ATLAS TIME — مقدمة صفحات متناسقة تحفظ اللغة الفلكية للمنتج من دون واجهات عامة. */
import { useAtlasTime } from "@/contexts/TimeContext";
import type { ReactNode } from "react";

export default function PageHeading({ eyebrow, titleAr, titleEn, descriptionAr, descriptionEn, children }: { eyebrow: string; titleAr: string; titleEn: string; descriptionAr: string; descriptionEn?: string; children?: ReactNode }) {
  const { language } = useAtlasTime();
  const isAr = language === "ar";
  return <div className="page-heading"><div><p className="eyebrow"><span/>{eyebrow}</p><h1>{isAr ? titleAr : titleEn}</h1><p>{isAr ? descriptionAr : descriptionEn ?? descriptionAr}</p></div>{children && <div className="page-heading-action">{children}</div>}</div>;
}
