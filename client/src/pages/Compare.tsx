/** ATLAS TIME — مقارنة المدن: حفظ محلي، استيراد من رابط مشاركة، وتحكم واضح بالمدارات. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, isDaytime, localStatus, timeString, timezoneLabel } from "@/lib/time";
import { ArrowDownUp, Copy, Link2, Plus, RotateCcw, Share2, X } from "lucide-react";
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

function readInitialCityIds() {
  if (typeof window === "undefined") return defaultIds;
  const sharedValue = new URLSearchParams(window.location.search).get("compare");
  const sharedIds = validCityIds(sharedValue?.split(",") ?? []);
  if (sharedIds.length >= 2) return sharedIds;
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
  const [selectedIds, setSelectedIds] = useState(readInitialCityIds);
  const [addId, setAddId] = useState("paris");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");
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
    setShareStatus("idle");
  };

  const reset = () => {
    setSelectedIds(defaultIds);
    setAddId("paris");
    setShareStatus("idle");
    const url = new URL(window.location.href);
    url.searchParams.delete("compare");
    window.history.replaceState({}, "", url);
  };

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("compare", selectedIds.join(","));
    const shareUrl = url.toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: "ATLAS TIME", text: isAr ? "قائمة مقارنة الوقت" : "Time comparison list", url: shareUrl });
        setShareStatus("shared");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
      } catch {
        setShareStatus("error");
      }
    }
  };

  const shareMessage = shareStatus === "copied"
    ? (isAr ? "نُسخ رابط المقارنة." : "Comparison link copied.")
    : shareStatus === "shared"
      ? (isAr ? "أصبح الرابط جاهزًا للمشاركة." : "Link ready to share.")
      : shareStatus === "error"
        ? (isAr ? "تعذر نسخ الرابط؛ انسخه من شريط العنوان." : "Could not copy the link; use the address bar.")
        : "";

  return <AppShell><div className="content-page compare-page"><PageHeading eyebrow={isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"} titleAr="قارن الوقت، لا تخمن" titleEn="Compare time, not guesses" descriptionAr="اعرف المدينة التي تبدأ يومها، والمدينة التي تنهيه، قبل أن ترسل الرسالة التالية."><span className="data-badge"><span className="live-dot"/>{isAr ? "يُحدّث كل ثانية" : "UPDATES EACH SECOND"}</span></PageHeading><section className="comparison-table"><div className="compare-table-head"><span>{isAr ? "المدينة" : "City"}</span><span>{isAr ? "الوقت المحلي" : "Local time"}</span><span>{isAr ? "الفارق" : "Difference"}</span><span>{isAr ? "الحالة" : "Status"}</span><span/></div>{rows.map((city) => { const day = isDaytime(now, city); return <div className="compare-row" key={city.id}><span className={`day-state ${day ? "day" : "night"}`}>{day ? "☼" : "☾"}</span><div><b>{cityName(city, language)}</b><small>{timezoneLabel(now, city)}</small></div><strong>{timeString(now, city, language, is24Hour)}</strong><span className="hour-difference"><ArrowDownUp size={12}/>{hourDifference(now, selectedCity.id, city.id)}</span><span className={`status-label ${day ? "open" : "night"}`}>{localStatus(now, city, language)}</span><button className="remove-row" onClick={() => { setSelectedIds((items) => items.filter((id) => id !== city.id)); setShareStatus("idle"); }} disabled={rows.length <= 2} aria-label={isAr ? "إزالة" : "Remove"}><X size={15}/></button></div>; })}</section><section className="compare-add"><div><span className="eyebrow">{isAr ? "أضف مداراً" : "ADD AN ORBIT"}</span><p>{isAr ? `أضف حتى ست مدن إلى لوحة المقارنة (${selectedIds.length}/6).` : `Add up to six cities (${selectedIds.length}/6).`}</p></div><select value={addId} onChange={(event) => setAddId(event.target.value)} disabled={!canAdd}>{availableCities.map((city) => <option key={city.id} value={city.id}>{cityName(city, language)}</option>)}</select><button className="gold-button" onClick={add} disabled={!canAdd}><Plus size={16}/>{canAdd ? (isAr ? "إضافة مدينة" : "Add city") : (isAr ? "اكتملت المدن الست" : "Six cities selected")}</button></section><section className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><button className="inline-flex items-center gap-2 border border-[#b08d57]/60 px-4 py-3 text-xs text-[#dac084] transition-colors hover:bg-[#b08d57]/10" onClick={reset}><RotateCcw size={15}/>{isAr ? "إعادة للوضع الافتراضي" : "Reset to default"}</button><button className="gold-button inline-flex items-center gap-2" onClick={share}><Share2 size={15}/>{isAr ? "مشاركة رابط المقارنة" : "Share comparison link"}</button>{shareMessage && <span className="inline-flex items-center gap-2 text-xs text-[#dac084]" role="status"><Link2 size={14}/>{shareMessage}</span>}<span className="sr-only"><Copy size={1}/></span></section></div></AppShell>;
}
