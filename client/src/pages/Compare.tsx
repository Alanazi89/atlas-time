/** ATLAS TIME — مقارنة المدن: حفظ محلي وتصدير SVG آمن بتخصيص الورق والعنوان والتذييل. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, isDaytime, localStatus, timeString, timezoneLabel } from "@/lib/time";
import { ArrowDownUp, FileText, ImageDown, Plus, RotateCcw, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const defaultIds = ["riyadh", "london", "new-york", "tokyo"];
const compareStorageKey = "atlas-time:compare-cities:v1";
type ExportTheme = "dark" | "light";
type PaperSize = "a4" | "letter";

function validCityIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((id): id is string => {
    const valid = typeof id === "string" && cities.some((city) => city.id === id) && !seen.has(id);
    if (valid) seen.add(id);
    return valid;
  }).slice(0, 6);
}

function readSavedCityIds() {
  if (typeof window === "undefined") return defaultIds;
  try {
    const saved = validCityIds(JSON.parse(window.localStorage.getItem(compareStorageKey) ?? "[]"));
    return saved.length >= 2 ? saved : defaultIds;
  } catch { return defaultIds; }
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
  const [exportTheme, setExportTheme] = useState<ExportTheme>("light");
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  const [reportTitle, setReportTitle] = useState("");
  const [footerName, setFooterName] = useState("");
  const [footerLogo, setFooterLogo] = useState("");
  const [exportState, setExportState] = useState<"idle" | "working" | "image" | "pdf" | "error">("idle");
  const isAr = language === "ar";
  const rows = useMemo(() => selectedIds.map(cityById), [selectedIds]);
  const availableCities = useMemo(() => cities.filter((city) => !selectedIds.includes(city.id)), [selectedIds]);
  const canAdd = selectedIds.length < 6 && availableCities.length > 0;

  useEffect(() => {
    try { window.localStorage.setItem(compareStorageKey, JSON.stringify(selectedIds)); } catch { /* keep session state */ }
  }, [selectedIds]);

  useEffect(() => {
    if (!availableCities.some((city) => city.id === addId)) setAddId(availableCities[0]?.id ?? "");
  }, [addId, availableCities]);

  const add = () => {
    if (canAdd && addId && !selectedIds.includes(addId)) setSelectedIds((items) => [...items, addId]);
  };

  const reset = () => {
    setSelectedIds(defaultIds);
    setAddId("paris");
    setExportState("idle");
  };

  const loadFooterLogo = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setFooterLogo(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const buildExportSvg = (theme: ExportTheme) => {
    const colors = theme === "light"
      ? { bg: "#f7f3ea", accent: "#ece2cf", panel: "#fffdfa", focus: "#f4ead5", ink: "#1d2525", muted: "#5e665e", border: "#b7a681", gold: "#80602f", goldLight: "#aa8244", day: "#f1dfb7", night: "#dce9ed", iconDay: "#80602f", iconNight: "#2d5868" }
      : { bg: "#071012", accent: "#0d1719", panel: "#0c1517", focus: "#171a16", ink: "#f2eee6", muted: "#a9a79f", border: "#b08d57", gold: "#d4af6a", goldLight: "#f2d08a", day: "#463c22", night: "#112331", iconDay: "#d4af6a", iconNight: "#9ac7d3" };
    const width = 1600, header = 250, rowHeight = 104, footer = 76, height = header + rows.length * rowHeight + footer;
    const dateTime = new Intl.DateTimeFormat(isAr ? "ar-SA" : "en-GB", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: selectedCity.timezone, timeZoneName: "short" }).format(new Date());
    const heading = reportTitle.trim() || (isAr ? "لوحة مقارنة الوقت" : "Time comparison board");
    const summary = isAr ? `${rows.length} مدن · التوقيت المرجعي: ${timeString(now, selectedCity, language, is24Hour)}` : `${rows.length} cities · Reference: ${timeString(now, selectedCity, language, is24Hour)}`;
    const exportNote = isAr ? `تاريخ ووقت التصدير: ${dateTime}` : `Exported: ${dateTime}`;
    const edition = theme === "light" ? (isAr ? "نسخة فاتحة للطباعة" : "LIGHT PRINT EDITION") : (isAr ? "نسخة داكنة للمشاركة" : "DARK SHARE EDITION");
    const labels = isAr ? ["المدينة", "الوقت المحلي", "الفارق", "الحالة"] : ["City", "Local time", "Difference", "Status"];
    const footerBrand = footerName.trim() || "ATLAS TIME";
    const logo = footerLogo ? `<image href="${xmlSafe(footerLogo)}" x="1430" y="${height - 67}" width="38" height="38" preserveAspectRatio="xMidYMid meet"/>` : "";
    const labelRow = `<text x="1460" y="234" text-anchor="end" class="label">${xmlSafe(labels[0])}</text><text x="970" y="234" text-anchor="middle" class="label">${xmlSafe(labels[1])}</text><text x="670" y="234" text-anchor="middle" class="label">${xmlSafe(labels[2])}</text><text x="320" y="234" text-anchor="middle" class="label">${xmlSafe(labels[3])}</text>`;
    const tableRows = rows.map((city, index) => {
      const day = isDaytime(now, city), top = header + index * rowHeight;
      return `<rect x="64" y="${top}" width="1472" height="${rowHeight}" fill="${index === 0 ? colors.focus : colors.panel}"/><rect x="64" y="${top}" width="5" height="${rowHeight}" fill="${colors.gold}" opacity="${index === 0 ? "1" : ".42"}"/><line x1="64" y1="${top + rowHeight}" x2="1536" y2="${top + rowHeight}" stroke="${colors.border}" stroke-opacity=".35"/><text x="1460" y="${top + 45}" text-anchor="end" class="city" direction="rtl">${xmlSafe(cityName(city, language))}</text><text x="1460" y="${top + 72}" text-anchor="end" class="sub">${xmlSafe(timezoneLabel(now, city))}</text><text x="970" y="${top + 61}" text-anchor="middle" class="time">${xmlSafe(timeString(now, city, language, is24Hour))}</text><text x="670" y="${top + 58}" text-anchor="middle" class="difference">${xmlSafe(hourDifference(now, selectedCity.id, city.id))}</text><circle cx="320" cy="${top + 50}" r="20" fill="${day ? colors.day : colors.night}"/><text x="320" y="${top + 58}" text-anchor="middle" class="icon" fill="${day ? colors.iconDay : colors.iconNight}">${day ? "☼" : "☾"}</text><text x="250" y="${top + 58}" text-anchor="middle" class="status" direction="rtl">${xmlSafe(localStatus(now, city, language))}</text>`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="bg" x1="0" x2="1"><stop stop-color="${colors.bg}"/><stop offset=".7" stop-color="${colors.accent}"/><stop offset="1" stop-color="${colors.bg}"/></linearGradient><linearGradient id="gold" x1="0" x2="1"><stop stop-color="${colors.gold}"/><stop offset=".5" stop-color="${colors.goldLight}"/><stop offset="1" stop-color="${colors.gold}"/></linearGradient><style>text{font-family:Arial,sans-serif;fill:${colors.ink}}.brand{font-size:24px;letter-spacing:7px;fill:${colors.gold}}.eyebrow{font-size:18px;letter-spacing:3px;fill:${colors.gold}}.title{font-family:Georgia,'Times New Roman',serif;font-size:46px;font-weight:700}.sub{font-size:17px;fill:${colors.muted}}.label{font-size:18px;fill:${colors.muted}}.city{font-size:26px;font-weight:700}.time{font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:700;fill:url(#gold)}.difference{font-size:24px;fill:${colors.gold}}.status{font-size:18px;fill:${colors.muted}}.icon{font-size:25px}</style></defs><rect width="1600" height="${height}" fill="url(#bg)"/><circle cx="-70" cy="${height / 2}" r="450" fill="none" stroke="${colors.gold}" stroke-opacity=".14" stroke-width="2"/><circle cx="-70" cy="${height / 2}" r="390" fill="none" stroke="${colors.gold}" stroke-opacity=".06" stroke-width="36"/><text x="64" y="66" class="brand">ATLAS TIME</text><text x="1536" y="66" text-anchor="end" class="eyebrow">${isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"}</text><text x="1536" y="124" text-anchor="end" class="title" direction="rtl">${xmlSafe(heading)}</text><text x="64" y="154" class="sub" direction="rtl">${xmlSafe(summary)}</text><text x="64" y="188" class="sub" direction="rtl">${xmlSafe(exportNote)}</text><text x="1536" y="188" text-anchor="end" class="eyebrow">${xmlSafe(edition)}</text><line x1="64" y1="210" x2="1536" y2="210" stroke="${colors.border}" stroke-opacity=".7"/>${labelRow}${tableRows}<line x1="64" y1="${height - 30}" x2="1536" y2="${height - 30}" stroke="${colors.border}" stroke-opacity=".55"/><text x="64" y="${height - 48}" class="sub">atlas time · ${xmlSafe(cityName(selectedCity, "en"))}</text>${logo}<text x="${footerLogo ? "1418" : "1536"}" y="${height - 48}" text-anchor="end" class="sub">${xmlSafe(footerBrand)}</text></svg>`;
  };

  const createExportCanvas = async () => {
    setExportState("working");
    const objectUrl = URL.createObjectURL(new Blob([buildExportSvg(exportTheme)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const next = new Image();
        next.onload = () => resolve(next);
        next.onerror = () => reject(new Error("Could not render export"));
        next.src = objectUrl;
      });
      const canvas = document.createElement("canvas"), scale = 2;
      canvas.width = image.width * scale; canvas.height = image.height * scale;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally { URL.revokeObjectURL(objectUrl); }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 250);
  };

  const downloadImage = async () => {
    try {
      const canvas = await createExportCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((output) => output ? resolve(output) : reject(new Error("Could not create image")), "image/png"));
      downloadBlob(blob, `atlas-time-comparison-${exportTheme}-${new Date().toISOString().slice(0, 10)}.png`);
      setExportState("image");
    } catch (error) { console.error("ATLAS TIME image export failed", error); setExportState("error"); }
  };

  const downloadPdf = async () => {
    try {
      const canvas = await createExportCanvas();
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: paperSize, compress: true });
      const margin = 8, pageWidth = pdf.internal.pageSize.getWidth(), pageHeight = pdf.internal.pageSize.getHeight();
      const scale = Math.min((pageWidth - margin * 2) / canvas.width, (pageHeight - margin * 2) / canvas.height);
      const outputWidth = canvas.width * scale, outputHeight = canvas.height * scale;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", (pageWidth - outputWidth) / 2, (pageHeight - outputHeight) / 2, outputWidth, outputHeight, undefined, "FAST");
      pdf.save(`atlas-time-comparison-${paperSize}-${exportTheme}-${new Date().toISOString().slice(0, 10)}.pdf`);
      setExportState("pdf");
    } catch (error) { console.error("ATLAS TIME PDF export failed", error); setExportState("error"); }
  };

  const exportMessage = exportState === "working" ? (isAr ? "يتم تجهيز الملف…" : "Preparing file…") : exportState === "image" ? (isAr ? "تم تنزيل الصورة." : "Image downloaded.") : exportState === "pdf" ? (isAr ? "تم تنزيل ملف PDF." : "PDF downloaded.") : exportState === "error" ? (isAr ? "تعذر إنشاء الملف. حاول مرة أخرى." : "Could not create the file. Try again.") : "";

  return <AppShell><div className="content-page compare-page"><PageHeading eyebrow={isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"} titleAr="قارن الوقت، لا تخمن" titleEn="Compare time, not guesses" descriptionAr="اعرف المدينة التي تبدأ يومها، والمدينة التي تنهيه، قبل أن ترسل الرسالة التالية."><span className="data-badge"><span className="live-dot"/>{isAr ? "يُحدّث كل ثانية" : "UPDATES EACH SECOND"}</span></PageHeading><section className="comparison-table"><div className="compare-table-head"><span>{isAr ? "المدينة" : "City"}</span><span>{isAr ? "الوقت المحلي" : "Local time"}</span><span>{isAr ? "الفارق" : "Difference"}</span><span>{isAr ? "الحالة" : "Status"}</span><span/></div>{rows.map((city) => { const day = isDaytime(now, city); return <div className="compare-row" key={city.id}><span className={`day-state ${day ? "day" : "night"}`}>{day ? "☼" : "☾"}</span><div><b>{cityName(city, language)}</b><small>{timezoneLabel(now, city)}</small></div><strong>{timeString(now, city, language, is24Hour)}</strong><span className="hour-difference"><ArrowDownUp size={12}/>{hourDifference(now, selectedCity.id, city.id)}</span><span className={`status-label ${day ? "open" : "night"}`}>{localStatus(now, city, language)}</span><button className="remove-row" onClick={() => setSelectedIds((items) => items.filter((id) => id !== city.id))} disabled={rows.length <= 2} aria-label={isAr ? "إزالة" : "Remove"}><X size={15}/></button></div>; })}</section><section className="compare-add"><div><span className="eyebrow">{isAr ? "أضف مداراً" : "ADD AN ORBIT"}</span><p>{isAr ? `أضف حتى ست مدن إلى لوحة المقارنة (${selectedIds.length}/6).` : `Add up to six cities (${selectedIds.length}/6).`}</p></div><select value={addId} onChange={(event) => setAddId(event.target.value)} disabled={!canAdd}>{availableCities.map((city) => <option key={city.id} value={city.id}>{cityName(city, language)}</option>)}</select><button className="gold-button" onClick={add} disabled={!canAdd}><Plus size={16}/>{canAdd ? (isAr ? "إضافة مدينة" : "Add city") : (isAr ? "اكتملت المدن الست" : "Six cities selected")}</button></section><section className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2"><label className="text-xs text-[#dac084]"><span className="mb-2 block">{isAr ? "عنوان التقرير" : "Report title"}</span><input className="w-full border border-[#b08d57]/45 bg-black/20 px-3 py-2 text-sm text-[#f2eee6]" value={reportTitle} onChange={(event) => setReportTitle(event.target.value)} placeholder={isAr ? "لوحة مقارنة فريقي" : "My team comparison"}/></label><label className="text-xs text-[#dac084]"><span className="mb-2 block">{isAr ? "اسم التذييل" : "Footer name"}</span><input className="w-full border border-[#b08d57]/45 bg-black/20 px-3 py-2 text-sm text-[#f2eee6]" value={footerName} onChange={(event) => setFooterName(event.target.value)} placeholder={isAr ? "اسمك أو اسم الشركة" : "Your name or company"}/></label><label className="text-xs text-[#dac084]"><span className="mb-2 block">{isAr ? "حجم ورق PDF" : "PDF paper size"}</span><select className="w-full border border-[#b08d57]/45 bg-black/20 px-3 py-2 text-sm text-[#f2eee6]" value={paperSize} onChange={(event) => setPaperSize(event.target.value as PaperSize)}><option value="a4">A4</option><option value="letter">Letter</option></select></label><label className="text-xs text-[#dac084]"><span className="mb-2 block">{isAr ? "شعار التذييل" : "Footer logo"}</span><span className="flex items-center gap-2 border border-dashed border-[#b08d57]/45 px-3 py-2 text-sm text-[#dac084]"><Upload size={15}/>{footerLogo ? (isAr ? "تم اختيار شعار" : "Logo selected") : (isAr ? "اختر صورة شعار" : "Choose a logo")}<input className="hidden" type="file" accept="image/*" onChange={(event) => loadFooterLogo(event.target.files?.[0])}/></span></label></section><section className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10" onClick={reset}><RotateCcw size={15}/>{isAr ? "إعادة للوضع الافتراضي" : "Reset to default"}</button><div className="inline-flex items-center border border-[#b08d57]/45 bg-black/15 p-1 text-xs text-[#dac084]"><span className="px-2">{isAr ? "نمط الملف" : "Export theme"}</span><button className={`px-3 py-2 ${exportTheme === "light" ? "bg-[#e6d2a2] text-[#241f16]" : "text-[#dac084]"}`} onClick={() => setExportTheme("light")}>{isAr ? "فاتح للطباعة" : "Light print"}</button><button className={`px-3 py-2 ${exportTheme === "dark" ? "bg-[#b08d57] text-[#16130f]" : "text-[#dac084]"}`} onClick={() => setExportTheme("dark")}>{isAr ? "داكن" : "Dark"}</button></div><button className="gold-button inline-flex items-center gap-2" onClick={downloadImage} disabled={exportState === "working"}><ImageDown size={16}/>{isAr ? "تنزيل صورة" : "Download image"}</button><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10 disabled:opacity-50" onClick={downloadPdf} disabled={exportState === "working"}><FileText size={16}/>{isAr ? `تنزيل PDF ${paperSize.toUpperCase()}` : `Download ${paperSize.toUpperCase()} PDF`}</button>{exportMessage && <span className="text-xs text-[#dac084]" role="status">{exportMessage}</span>}</section></div></AppShell>;
}
