/** ATLAS TIME — مقارنة المدن: حفظ محلي وتصدير SVG/Canvas مستقل عن الصور الخارجية. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, isDaytime, localStatus, timeString, timezoneLabel } from "@/lib/time";
import { ArrowDownUp, FileText, ImageDown, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

function xmlSafe(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" }[character] ?? character));
}

export default function Compare() {
  const { language, now, is24Hour, selectedCity } = useAtlasTime();
  const [selectedIds, setSelectedIds] = useState(readSavedCityIds);
  const [addId, setAddId] = useState("paris");
  const [exportState, setExportState] = useState<"idle" | "working" | "image" | "pdf" | "error">("idle");
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

  const buildExportSvg = () => {
    const width = 1600;
    const headerHeight = 210;
    const rowHeight = 104;
    const footerHeight = 64;
    const height = headerHeight + rows.length * rowHeight + footerHeight;
    const heading = isAr ? "لوحة مقارنة الوقت" : "Time comparison board";
    const subtitle = isAr ? `${rows.length} مدن · التوقيت المرجعي: ${timeString(now, selectedCity, language, is24Hour)}` : `${rows.length} cities · Reference: ${timeString(now, selectedCity, language, is24Hour)}`;
    const labels = isAr ? ["المدينة", "الوقت المحلي", "الفارق", "الحالة"] : ["City", "Local time", "Difference", "Status"];
    const headerLabels = `<text x="1460" y="178" text-anchor="end" class="label">${xmlSafe(labels[0])}</text><text x="970" y="178" text-anchor="middle" class="label">${xmlSafe(labels[1])}</text><text x="670" y="178" text-anchor="middle" class="label">${xmlSafe(labels[2])}</text><text x="320" y="178" text-anchor="middle" class="label">${xmlSafe(labels[3])}</text>`;
    const lines = rows.map((city, index) => {
      const day = isDaytime(now, city);
      const top = headerHeight + index * rowHeight;
      const localTime = timeString(now, city, language, is24Hour);
      const status = localStatus(now, city, language);
      return `<rect x="64" y="${top}" width="1472" height="${rowHeight}" fill="${index === 0 ? "#171a16" : "#0c1517"}"/><rect x="64" y="${top}" width="5" height="${rowHeight}" fill="${index === 0 ? "#d4af6a" : "#b08d57"}" opacity="${index === 0 ? "1" : ".32"}"/><line x1="64" y1="${top + rowHeight}" x2="1536" y2="${top + rowHeight}" stroke="#b08d57" stroke-opacity=".22"/><text x="1460" y="${top + 45}" text-anchor="end" class="city" direction="rtl">${xmlSafe(cityName(city, language))}</text><text x="1460" y="${top + 72}" text-anchor="end" class="sub" direction="ltr">${xmlSafe(timezoneLabel(now, city))}</text><text x="970" y="${top + 61}" text-anchor="middle" class="time">${xmlSafe(localTime)}</text><text x="670" y="${top + 58}" text-anchor="middle" class="difference">${xmlSafe(hourDifference(now, selectedCity.id, city.id))}</text><circle cx="320" cy="${top + 50}" r="20" fill="${day ? "#463c22" : "#112331"}"/><text x="320" y="${top + 58}" text-anchor="middle" class="icon">${day ? "☼" : "☾"}</text><text x="250" y="${top + 58}" text-anchor="middle" class="status" direction="rtl">${xmlSafe(status)}</text>`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="bg" x1="0" x2="1"><stop stop-color="#071012"/><stop offset=".7" stop-color="#0d1719"/><stop offset="1" stop-color="#080909"/></linearGradient><linearGradient id="gold" x1="0" x2="1"><stop stop-color="#b08d57"/><stop offset=".5" stop-color="#f2d08a"/><stop offset="1" stop-color="#8c6b3b"/></linearGradient><style>text{font-family:Arial,sans-serif;fill:#f2eee6}.brand{font-size:24px;letter-spacing:7px;fill:#d4af6a}.eyebrow{font-size:18px;letter-spacing:3px;fill:#b08d57}.title{font-family:Georgia,'Times New Roman',serif;font-size:46px;font-weight:700}.sub{font-size:17px;fill:#a9a79f}.label{font-size:18px;fill:#b9b6ad}.city{font-size:26px;font-weight:700}.time{font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:700;fill:url(#gold)}.difference{font-size:24px;fill:#d4af6a}.status{font-size:18px;fill:#c8c4bc}.icon{font-size:25px;fill:#d4af6a}</style></defs><rect width="1600" height="${height}" fill="url(#bg)"/><circle cx="-70" cy="${height / 2}" r="450" fill="none" stroke="#b08d57" stroke-opacity=".12" stroke-width="2"/><circle cx="-70" cy="${height / 2}" r="390" fill="none" stroke="#b08d57" stroke-opacity=".06" stroke-width="36"/><text x="64" y="66" class="brand">ATLAS TIME</text><text x="1536" y="66" text-anchor="end" class="eyebrow">${isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"}</text><text x="1536" y="124" text-anchor="end" class="title" direction="rtl">${xmlSafe(heading)}</text><text x="64" y="124" class="sub" direction="rtl">${xmlSafe(subtitle)}</text><line x1="64" y1="150" x2="1536" y2="150" stroke="#b08d57" stroke-opacity=".6"/>${headerLabels}${lines}<line x1="64" y1="${height - 26}" x2="1536" y2="${height - 26}" stroke="#b08d57" stroke-opacity=".5"/><text x="64" y="${height - 42}" class="sub">atlas time · ${new Date().toLocaleDateString("en-CA")}</text></svg>`;
  };

  const createExportCanvas = async () => {
    setExportState("working");
    const svg = buildExportSvg();
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(svgBlob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Could not render export"));
        nextImage.src = objectUrl;
      });
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 250);
  };

  const downloadImage = async () => {
    try {
      const canvas = await createExportCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((output) => output ? resolve(output) : reject(new Error("Could not create image")), "image/png"));
      downloadBlob(blob, `atlas-time-comparison-${new Date().toISOString().slice(0, 10)}.png`);
      setExportState("image");
    } catch (error) {
      console.error("ATLAS TIME image export failed", error);
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
    } catch (error) {
      console.error("ATLAS TIME PDF export failed", error);
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

  return <AppShell><div className="content-page compare-page"><PageHeading eyebrow={isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"} titleAr="قارن الوقت، لا تخمن" titleEn="Compare time, not guesses" descriptionAr="اعرف المدينة التي تبدأ يومها، والمدينة التي تنهيه، قبل أن ترسل الرسالة التالية."><span className="data-badge"><span className="live-dot"/>{isAr ? "يُحدّث كل ثانية" : "UPDATES EACH SECOND"}</span></PageHeading><section className="comparison-table"><div className="compare-table-head"><span>{isAr ? "المدينة" : "City"}</span><span>{isAr ? "الوقت المحلي" : "Local time"}</span><span>{isAr ? "الفارق" : "Difference"}</span><span>{isAr ? "الحالة" : "Status"}</span><span/></div>{rows.map((city) => { const day = isDaytime(now, city); return <div className="compare-row" key={city.id}><span className={`day-state ${day ? "day" : "night"}`}>{day ? "☼" : "☾"}</span><div><b>{cityName(city, language)}</b><small>{timezoneLabel(now, city)}</small></div><strong>{timeString(now, city, language, is24Hour)}</strong><span className="hour-difference"><ArrowDownUp size={12}/>{hourDifference(now, selectedCity.id, city.id)}</span><span className={`status-label ${day ? "open" : "night"}`}>{localStatus(now, city, language)}</span><button className="remove-row" onClick={() => setSelectedIds((items) => items.filter((id) => id !== city.id))} disabled={rows.length <= 2} aria-label={isAr ? "إزالة" : "Remove"}><X size={15}/></button></div>; })}</section><section className="compare-add"><div><span className="eyebrow">{isAr ? "أضف مداراً" : "ADD AN ORBIT"}</span><p>{isAr ? `أضف حتى ست مدن إلى لوحة المقارنة (${selectedIds.length}/6).` : `Add up to six cities (${selectedIds.length}/6).`}</p></div><select value={addId} onChange={(event) => setAddId(event.target.value)} disabled={!canAdd}>{availableCities.map((city) => <option key={city.id} value={city.id}>{cityName(city, language)}</option>)}</select><button className="gold-button" onClick={add} disabled={!canAdd}><Plus size={16}/>{canAdd ? (isAr ? "إضافة مدينة" : "Add city") : (isAr ? "اكتملت المدن الست" : "Six cities selected")}</button></section><section className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10" onClick={reset}><RotateCcw size={15}/>{isAr ? "إعادة للوضع الافتراضي" : "Reset to default"}</button><button className="gold-button inline-flex items-center gap-2" onClick={downloadImage} disabled={exportState === "working"}><ImageDown size={16}/>{isAr ? "تنزيل صورة" : "Download image"}</button><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10 disabled:opacity-50" onClick={downloadPdf} disabled={exportState === "working"}><FileText size={16}/>{isAr ? "تنزيل PDF" : "Download PDF"}</button>{exportMessage && <span className="text-xs text-[#dac084]" role="status">{exportMessage}</span>}</section></div></AppShell>;
}
