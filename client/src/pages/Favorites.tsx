/** ATLAS TIME — المدن المفضلة: قائمة شخصية محفوظة محلياً وقابلة للحذف والتبديل مباشرة. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, timeString, timezoneLabel } from "@/lib/time";
import { Star } from "lucide-react";
import { Link } from "wouter";

export default function Favorites() {
  const { language, favorites, toggleFavorite, now, is24Hour, selectCity } = useAtlasTime();
  const isAr = language === "ar"; const list = cities.filter((city) => favorites.includes(city.id));
  return <AppShell><div className="content-page favorites-page"><PageHeading eyebrow={isAr ? "مدار شخصي" : "PERSONAL ORBIT"} titleAr="مدنك الأقرب" titleEn="Your closest cities" descriptionAr="مدن تحفظها محلياً الآن، وجاهزة لمقارنة اليوم التالي أو ترتيب المكالمة التالية."/><section className="favorites-list">{list.length ? list.map((city) => <article key={city.id}><button className="favorite-city-main" onClick={() => selectCity(city)}><span>{cityName(city, language).slice(0, 1)}</span><div><h2>{cityName(city, language)}</h2><p>{timezoneLabel(now, city)}</p></div><b>{timeString(now, city, language, is24Hour)}</b></button><button className="card-star on" onClick={() => toggleFavorite(city.id)} aria-label={isAr ? "إزالة من المفضلة" : "Remove favourite"}><Star size={17}/></button></article>) : <div className="empty-orbit"><Star size={23}/><h2>{isAr ? "مدارك ما زالت فارغة" : "Your orbit is still open"}</h2><p>{isAr ? "أضف مدينة من الدليل لتصل إليها بسرعة هنا." : "Add a city from the directory to keep it close."}</p><Link className="gold-button" href="/cities">{isAr ? "استكشف المدن" : "Explore cities"}</Link></div>}</section></div></AppShell>;
}

