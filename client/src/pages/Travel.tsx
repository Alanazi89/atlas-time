/** ATLAS TIME — وضع السفر: وقت وصول حقيقي محسوب بين مناطق IANA ومدة رحلة يحددها المستخدم. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, countryName, isDaytime, shortDateTime, timeString, zonedTimeToUtc } from "@/lib/time";
import { atlasAssets } from "@/lib/assets";
import { ArrowLeft, ArrowRight, CircleDot, Plane, Sunrise } from "lucide-react";
import { useMemo, useState } from "react";

const travelImage = atlasAssets.travelAtmosphere;

export default function Travel() {
  const { language, selectedCity, now } = useAtlasTime();
  const [fromId, setFromId] = useState(selectedCity.id);
  const [toId, setToId] = useState("london");
  const [duration, setDuration] = useState("7");
  const [departure, setDeparture] = useState(() => { const value = new Date(); value.setMinutes(0, 0, 0); value.setHours(value.getHours() + 2); return value.toISOString().slice(0, 16); });
  const isAr = language === "ar";
  const from = cityById(fromId); const to = cityById(toId);
  const calculations = useMemo(() => { const departureUtc = zonedTimeToUtc(departure, from); const arrival = new Date(departureUtc.getTime() + Number(duration || 0) * 3_600_000); return { departureUtc, arrival }; }, [departure, duration, fromId]);
  const swap = () => { setFromId(toId); setToId(fromId); };
  return <AppShell><div className="content-page travel-page"><PageHeading eyebrow={isAr ? "وضع السفر" : "TRAVEL MODE"} titleAr="اعرف يومك قبل الهبوط" titleEn="Know the day before you land" descriptionAr="خطة وصول بسيطة، تحترم وقت المدينة التي تغادرها والمدينة التي تنتظرك."><span className="data-badge"><Plane size={13}/>{isAr ? "محرك رحلة حي" : "LIVE TRIP ENGINE"}</span></PageHeading><div className="travel-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(6,9,10,.95), rgba(6,9,10,.36)), url(${travelImage})` }}><section className="travel-form"><div className="route-select"><label><span>{isAr ? "من" : "From"}</span><select value={fromId} onChange={(event) => setFromId(event.target.value)}>{cities.map((city) => <option value={city.id} key={city.id}>{cityName(city, language)}</option>)}</select></label><button className="swap-button" onClick={swap} aria-label={isAr ? "تبديل المسار" : "Swap route"}>{isAr ? <ArrowLeft size={17}/> : <ArrowRight size={17}/>}</button><label><span>{isAr ? "إلى" : "To"}</span><select value={toId} onChange={(event) => setToId(event.target.value)}>{cities.map((city) => <option value={city.id} key={city.id}>{cityName(city, language)}</option>)}</select></label></div><div className="travel-inputs"><label><span>{isAr ? "المغادرة المحلية" : "Local departure"}</span><input type="datetime-local" value={departure} onChange={(event) => setDeparture(event.target.value)}/></label><label><span>{isAr ? "مدة الرحلة (ساعات)" : "Flight duration (hours)"}</span><input type="number" min="0.5" step="0.5" value={duration} onChange={(event) => setDuration(event.target.value)}/></label></div></section><section className="arrival-panel"><span className="eyebrow">{isAr ? "نتيجة الرحلة" : "ARRIVAL READING"}</span><p>{isAr ? "الوقت المحلي عند الوصول إلى" : "Local time on arrival in"} <b>{cityName(to, language)}</b></p><h2>{timeString(calculations.arrival, to, language, true)}</h2><span className={`arrival-state ${isDaytime(calculations.arrival, to) ? "day" : "night"}`}>{isDaytime(calculations.arrival, to) ? <Sunrise size={15}/> : <CircleDot size={15}/>}{isDaytime(calculations.arrival, to) ? (isAr ? "ضوء النهار عند الوصول" : "Daylight on arrival") : (isAr ? "ليل محلي عند الوصول" : "Local night on arrival")}</span></section></div><section className="travel-readout"><article><span>{isAr ? "الإقلاع" : "Departure"}</span><b>{timeString(calculations.departureUtc, from, language, true)}</b><p>{cityName(from, language)} · {countryName(from, language)}</p></article><span className="route-line"><Plane size={17}/></span><article><span>{isAr ? "الوصول" : "Arrival"}</span><b>{shortDateTime(calculations.arrival, to, language)}</b><p>{cityName(to, language)} · {countryName(to, language)}</p></article><article><span>{isAr ? "المدة" : "Duration"}</span><b>{duration} {isAr ? "ساعة" : "hrs"}</b><p>{isAr ? "محسوبة من وقت الإقلاع" : "from local departure"}</p></article></section></div></AppShell>;
}
