/** ATLAS TIME — مستكشف المدن: بيانات IANA في مشهد أطلسي ليلي قابل للفرز والبحث. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, countryName, isDaytime, timeString, timezoneLabel } from "@/lib/time";
import { LocateFixed, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

export default function Cities() {
  const { language, now, selectedCity, selectCity, favorites, toggleFavorite, locateNearestCity, is24Hour } = useAtlasTime();
  const [query, setQuery] = useState("");
  const isAr = language === "ar";
  const filtered = useMemo(() => cities.filter((city) => `${city.nameAr} ${city.nameEn} ${city.countryAr} ${city.countryEn}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <AppShell><div className="content-page cities-page"><PageHeading eyebrow={isAr ? "دليل أطلس" : "ATLAS DIRECTORY"} titleAr="مدن على مدار واحد" titleEn="Cities in one orbit" descriptionAr="التوقيت، التباين الضوئي، والاختلافات الموسمية كما تحدث الآن، لا كما كانت بالأمس."><button className="locate-button" onClick={locateNearestCity}><LocateFixed size={16}/>{isAr ? "اعثر على الأقرب" : "Find nearest"}</button></PageHeading><div className="directory-toolbar"><label className="search-field"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isAr ? "ابحث في 24 مدينة" : "Search 24 cities"}/></label><span>{filtered.length} {isAr ? "مدينة" : "cities"}</span></div><section className="city-grid">{filtered.map((city) => { const day = isDaytime(now, city); const active = selectedCity.id === city.id; return <article className={`atlas-city-card ${active ? "active" : ""}`} key={city.id}><button className="city-card-main" onClick={() => selectCity(city)}><span className={`day-state ${day ? "day" : "night"}`}>{day ? "☼" : "☾"}</span><div><p>{countryName(city, language)}</p><h2>{cityName(city, language)}</h2><small>{timezoneLabel(now, city)}</small></div><div className="city-card-time"><b>{timeString(now, city, language, is24Hour)}</b><span>{day ? (isAr ? "نهار" : "Day") : (isAr ? "ليل" : "Night")}</span></div></button><button className={`card-star ${favorites.includes(city.id) ? "on" : ""}`} onClick={() => toggleFavorite(city.id)} aria-label={isAr ? "تبديل المفضلة" : "Toggle favourite"}><Star size={16}/></button></article>; })}</section></div></AppShell>;
}

