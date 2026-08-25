/** ATLAS TIME — مقارنة المدن: فروق زمنية ووضوح حالة العمل من مصدر وقت واحد حي. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, isDaytime, localStatus, timeString, timezoneLabel } from "@/lib/time";
import { ArrowDownUp, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const defaultIds = ["riyadh", "london", "new-york", "tokyo"];
const compareStorageKey = "atlas-time:compare-cities:v1";

function readSavedCityIds() {
  if (typeof window === "undefined") return defaultIds;
  try {
    const saved = JSON.parse(window.localStorage.getItem(compareStorageKey) ?? "[]");
    const validIds = Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === "string" && cities.some((city) => city.id === id)).slice(0, 6)
      : [];
    return validIds.length >= 2 ? validIds : defaultIds;
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
  const isAr = language === "ar";
  const rows = useMemo(() => selectedIds.map(cityById), [selectedIds]);
  const availableCities = useMemo(() => cities.filter((city) => !selectedIds.includes(city.id)), [selectedIds]);
  const canAdd = selectedIds.length < 6 && availableCities.length > 0;
  useEffect(() => {
    try {
      window.localStorage.setItem(compareStorageKey, JSON.stringify(selectedIds));
    } catch {
      // يبقى الاختيار متاحاً للجلسة الحالية إذا عطّل المتصفح التخزين المحلي.
    }
  }, [selectedIds]);
  const add = () => {
    if (!canAdd || !addId || selectedIds.includes(addId)) return;
    setSelectedIds((items) => [...items, addId]);
    setAddId(availableCities.find((city) => city.id !== addId)?.id ?? "");
  };
  return <AppShell><div className="content-page compare-page"><PageHeading eyebrow={isAr ? "تزامن عالمي" : "GLOBAL SYNCHRONY"} titleAr="قارن الوقت، لا تخمن" titleEn="Compare time, not guesses" descriptionAr="اعرف المدينة التي تبدأ يومها، والمدينة التي تنهيه، قبل أن ترسل الرسالة التالية."><span className="data-badge"><span className="live-dot"/>{isAr ? "يُحدّث كل ثانية" : "UPDATES EACH SECOND"}</span></PageHeading><section className="comparison-table"><div className="compare-table-head"><span>{isAr ? "المدينة" : "City"}</span><span>{isAr ? "الوقت المحلي" : "Local time"}</span><span>{isAr ? "الفارق" : "Difference"}</span><span>{isAr ? "الحالة" : "Status"}</span><span/></div>{rows.map((city) => { const day = isDaytime(now, city); return <div className="compare-row" key={city.id}><span className={`day-state ${day ? "day" : "night"}`}>{day ? "☼" : "☾"}</span><div><b>{cityName(city, language)}</b><small>{timezoneLabel(now, city)}</small></div><strong>{timeString(now, city, language, is24Hour)}</strong><span className="hour-difference"><ArrowDownUp size={12}/>{hourDifference(now, selectedCity.id, city.id)}</span><span className={`status-label ${day ? "open" : "night"}`}>{localStatus(now, city, language)}</span><button className="remove-row" onClick={() => setSelectedIds((items) => items.filter((id) => id !== city.id))} disabled={rows.length <= 2} aria-label={isAr ? "إزالة" : "Remove"}><X size={15}/></button></div>; })}</section><section className="compare-add"><div><span className="eyebrow">{isAr ? "أضف مداراً" : "ADD AN ORBIT"}</span><p>{isAr ? `أضف حتى ست مدن إلى لوحة المقارنة (${selectedIds.length}/6).` : `Add up to six cities (${selectedIds.length}/6).`}</p></div><select value={addId} onChange={(event) => setAddId(event.target.value)} disabled={!canAdd}>{availableCities.map((city) => <option key={city.id} value={city.id}>{cityName(city, language)}</option>)}</select><button className="gold-button" onClick={add} disabled={!canAdd}><Plus size={16}/>{canAdd ? (isAr ? "إضافة مدينة" : "Add city") : (isAr ? "اكتملت المدن الست" : "Six cities selected")}</button></section></div></AppShell>;
}
