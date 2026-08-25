/** ATLAS TIME — مقارنة المدن: حفظ محلي وتصدير لوحة المقارنة كصورة أو PDF قابل للمشاركة. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, isDaytime, localStatus, timeString, timezoneLabel } from "@/lib/time";
import { ArrowDownUp, FileText, ImageDown, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const defaultIds = ["riyadh", "london", "new-york", "tokyo"];
const compareStorageKey = "atlas-time:compare-cities:v1";

function validCityIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  const uniqueIds = new Set<string>();
  return value.filter((id): id is string => {
    const isValid = typeof id === "string" && cities.some((city) => city.id === id) && !uniqueIds.has(id);
    if (isValid) uniqueIds.add(id);
    return isValid;
  }).slice(0, 6);
}

function readSavedCityIds() {
  if (typeof window === "undefined") return defaultIds;
  try {
    const savedIds = validCityIds(JSON.parse(window.localStorage.getItem(compareStorageKey) ?? "[]"));
    return savedIds.length >= 2 ? savedIds : defaultIds;
  } catch {
    return defaultIds;
  }
}

function hourDifference(now: Date, baseId: string, currentId: string) {
  const diff = decimalHour(now, cityById(currentId)) - decimalHour(now, cityById(baseId));
  const normalized = diff > 12 ? diff - 24 : diff < -12 ? diff + 24 : diff;
  return `${normalized > 0 ? "+" : ""}${Number.isInteger(normalized) ? normalized : normalized.toFixed(1)}h`;
}

export default function Compare() {
  const { language, now, is24Hour, selectedCity } = useAtlasTime();
  const [selectedIds, setSelectedIds] = useState(readSavedCityIds);
  const [addId, setAddId] = useState("paris");
  const [exportState, setExportState] = useState<"idle" | "working" | "image" | "pdf" | "error">("idle");
  const exportRef = useRef<HTMLDivElement>(null);
  const isAr = language === "ar";
  const rows = useMemo(() => selectedIds.map(cityById), [selectedIds]);
  const availableCities = useMemo(() => cities.filter((city) => !selectedIds.includes(city.id)), [selectedIds]);
  const canAdd = selectedIds.length < 6 && availableCities.length > 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(compareStorageKey, JSON.stringify(selectedIds));
    } catch {
      // تبقى المدن نشطة خلال الجلسة إذا عطّل المتصفح التخزين المحلي.
    }
  }, [selectedIds]);

  useEffect(() => {
    if (!availableCities.some((city) => city.id === addId)) setAddId(availableCities[0]?.id ?? "");
  }, [addId, availableCities]);

  const add = () => {
    if (!canAdd || !addId || selectedIds.includes(addId)) return;
    setSelectedIds((items) => [...items, addId]);
  };

  const reset = () => {
    setSelectedIds(defaultIds);
    setAddId("paris");
    setExportState("idle");
  };

  const createExportCanvas = async () => {
    if (!exportRef.current) throw new Error("Comparison panel unavailable");
    setExportState("working");
    const [{ default: html2canvas }] = await Promise.all([import("html2canvas")]);
    await document.fonts?.ready;
    return html2canvas(exportRef.current, {
      backgroundColor: "#091012",
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: exportRef.current.scrollWidth,
    });
  };

  const downloadImage = async () => {
    try {
      const canvas = await createExportCanvas();
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `atlas-time-comparison-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      setExportState("image");
    } catch {
      setExportState("error");
    }
  };

  const downloadPdf = async () => {
    try {
      const canvas = await createExportCanvas();
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height], compress: true });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
      pdf.save(`atlas-time-comparison-${new Date().toISOString().slice(0, 10)}.pdf`);
      setExportState("pdf");
    } catch {
      setExportState("error");
    }
  };

  const exportMessage = exportState === "working"
    ? (isAr ? "يتم تجهيز الملف…" : "Preparing file…")
    : exportState === "image"
      ? (isAr ? "تم تنزيل الصورة." : "Image downloaded.")
      : exportState === "pdf"
        ? (isAr ? "تم تنزيل ملف PDF." : "PDF downloaded.")
        : exportState === "error"
          ? (isAr ? "تعذر إنشاء الملف. حاول مرة أخرى." : "Could not create the file. Try again.")
          : "";

  return <AppShell><div className="content-page compare-page"><PageHeading eyebrow={isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"} titleAr="قارن الوقت، لا تخمن" titleEn="Compare time, not guesses" descriptionAr="اعرف المدينة التي تبدأ يومها، والمدينة التي تنهيه، قبل أن ترسل الرسالة التالية."><span className="data-badge"><span className="live-dot"/>{isAr ? "يُحدّث كل ثانية" : "UPDATES EACH SECOND"}</span></PageHeading><div ref={exportRef} className="comparison-export-surface bg-[#091012] p-3"><div className="mb-3 flex items-end justify-between border-b border-[#b08d57]/35 pb-3"><div><p className="eyebrow">{isAr ? "ATLAS TIME · مقارنة المدن" : "ATLAS TIME · CITY COMPARISON"}</p><h2 className="mt-1 font-serif text-2xl text-[#f2eee6]">{isAr ? "لوحة مقارنة الوقت" : "Time comparison board"}</h2></div><p className="text-xs text-[#c8c4bc]">{isAr ? `${rows.length} مدن · ${timeString(now, selectedCity, language, is24Hour)}` : `${rows.length} cities · ${timeString(now, selectedCity, language, is24Hour)}`}</p></div><section className="comparison-table"><div className="compare-table-head"><span>{isAr ? "المدينة" : "City"}</span><span>{isAr ? "الوقت المحلي" : "Local time"}</span><span>{isAr ? "الفارق" : "Difference"}</span><span>{isAr ? "الحالة" : "Status"}</span><span/></div>{rows.map((city) => { const day = isDaytime(now, city); return <div className="compare-row" key={city.id}><span className={`day-state ${day ? "day" : "night"}`}>{day ? "☼" : "☾"}</span><div><b>{cityName(city, language)}</b><small>{timezoneLabel(now, city)}</small></div><strong>{timeString(now, city, language, is24Hour)}</strong><span className="hour-difference"><ArrowDownUp size={12}/>{hourDifference(now, selectedCity.id, city.id)}</span><span className={`status-label ${day ? "open" : "night"}`}>{localStatus(now, city, language)}</span><button data-html2canvas-ignore="true" className="remove-row" onClick={() => setSelectedIds((items) => items.filter((id) => id !== city.id))} disabled={rows.length <= 2} aria-label={isAr ? "إزالة" : "Remove"}><X size={15}/></button></div>; })}</section></div><section className="compare-add"><div><span className="eyebrow">{isAr ? "أضف مداراً" : "ADD AN ORBIT"}</span><p>{isAr ? `أضف حتى ست مدن إلى لوحة المقارنة (${selectedIds.length}/6).` : `Add up to six cities (${selectedIds.length}/6).`}</p></div><select value={addId} onChange={(event) => setAddId(event.target.value)} disabled={!canAdd}>{availableCities.map((city) => <option key={city.id} value={city.id}>{cityName(city, language)}</option>)}</select><button className="gold-button" onClick={add} disabled={!canAdd}><Plus size={16}/>{canAdd ? (isAr ? "إضافة مدينة" : "Add city") : (isAr ? "اكتملت المدن الست" : "Six cities selected")}</button></section><section className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10" onClick={reset}><RotateCcw size={15}/>{isAr ? "إعادة للوضع الافتراضي" : "Reset to default"}</button><button className="gold-button inline-flex items-center gap-2" onClick={downloadImage} disabled={exportState === "working"}><ImageDown size={16}/>{isAr ? "تنزيل صورة" : "Download image"}</button><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10 disabled:opacity-50" onClick={downloadPdf} disabled={exportState === "working"}><FileText size={16}/>{isAr ? "تنزيل PDF" : "Download PDF"}</button>{exportMessage && <span className="text-xs text-[#dac084]" role="status">{exportMessage}</span>}</section></div></AppShell>;
}
