/** ATLAS TIME — لوحة اختيار مدينة عملية وسريعة مع بحث ومفضلات حقيقية محلية. */
import { cities, type City } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, countryName, timezoneLabel } from "@/lib/time";
import { Search, Star, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function CityPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { language, now, selectedCity, selectCity, favorites, toggleFavorite, recents } = useAtlasTime();
  const isAr = language === "ar";
  const filtered = useMemo(() => cities.filter((city) => `${city.nameAr} ${city.nameEn} ${city.countryAr} ${city.countryEn}`.toLowerCase().includes(query.toLowerCase())), [query]);
  if (!open) return null;
  const select = (city: City) => { selectCity(city); onClose(); };
  return <div className="city-picker-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="city-picker" role="dialog" aria-modal="true" aria-label={isAr ? "تغيير المدينة" : "Change city"} onMouseDown={(event) => event.stopPropagation()}>
      <div className="picker-topline"><div><span className="eyebrow">{isAr ? "ATLAS DIRECTORY" : "ATLAS DIRECTORY"}</span><h2>{isAr ? "اختر مدينة" : "Choose a city"}</h2></div><button className="icon-button" onClick={onClose} aria-label={isAr ? "إغلاق" : "Close"}><X size={19}/></button></div>
      <label className="search-field"><Search size={17}/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isAr ? "ابحث باسم مدينة أو دولة" : "Search city or country"}/></label>
      {!query && <div className="picker-pills"><span>{isAr ? "الأخيرة:" : "RECENT:"}</span>{recents.map((id) => { const city = cities.find((item) => item.id === id); return city ? <button key={id} onClick={() => select(city)}>{cityName(city, language)}</button> : null; })}</div>}
      <div className="city-list">{filtered.map((city) => <button key={city.id} className={`city-row ${city.id === selectedCity.id ? "selected" : ""}`} onClick={() => select(city)}>
        <span className="city-initial">{cityName(city, language).slice(0, 1)}</span><span className="city-row-name"><b>{cityName(city, language)}</b><small>{countryName(city, language)} · {timezoneLabel(now, city)}</small></span>
        <span className="city-row-actions"><span>{city.id === selectedCity.id && (isAr ? "الحالية" : "Current")}</span><button className={`star-toggle ${favorites.includes(city.id) ? "on" : ""}`} type="button" onClick={(event) => { event.stopPropagation(); toggleFavorite(city.id); }} aria-label={isAr ? "تبديل المفضلة" : "Toggle favourite"}><Star size={15}/></button></span>
      </button>)}</div>
    </section>
  </div>;
}

