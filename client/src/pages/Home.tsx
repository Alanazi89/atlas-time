/** ATLAS TIME — الصفحة الرئيسية: «أطلس الفلك الدقيق» يجعل الساعة الفعلية قلب المشهد. */
import AppShell from "@/components/AppShell";
import WorldClock from "@/components/WorldClock";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityById } from "@/data/cities";
import { cityName, timeString, timezoneLabel } from "@/lib/time";
import { ArrowUpRight, LocateFixed, Moon, Sunrise } from "lucide-react";
import { Link } from "wouter";
import type { CSSProperties } from "react";

const heroImage = "/manus-storage/atlas-hero-horology_9a41dc3d.jpg";

export default function Home() {
  const { selectedCity, now, language, is24Hour, locateNearestCity } = useAtlasTime();
  const isAr = language === "ar";
  return <AppShell><div className="hero-shell" style={{ "--hero-image": `url(${heroImage})` } as CSSProperties}>
    <div className="hero-noise"/><div className="hero-copy"><p className="eyebrow"><span/> {isAr ? "مرصد الوقت العالمي" : "WORLD TIME OBSERVATORY"}</p><h1>{isAr ? <>كل مدينة<br/><i>على مدارك.</i></> : <>Every city.<br/><i>In your orbit.</i></>}</h1><p>{isAr ? "ساعة عالمية حية تصفّي ضجيج فروق التوقيت، لتصل إلى اللحظة المناسبة أينما كنت." : "A live world clock that turns time zones into a clear next move, wherever you are."}</p><div className="hero-meta"><span><Moon size={15}/>{isAr ? "توقيت حي عبر IANA" : "Live IANA time"}</span><span><Sunrise size={15}/>{isAr ? "ضوء النهار متغير" : "Daylight in motion"}</span></div><button className="locate-button" onClick={locateNearestCity}><LocateFixed size={16}/>{isAr ? "استخدم موقعي عند الاختيار" : "Use my location"}</button></div>
    <WorldClock />
  </div><section className="orbit-strip"><div className="orbit-title"><span className="eyebrow">{isAr ? "على نفس المدار" : "SAME ORBIT"}</span><h2>{isAr ? "ماذا يحدث الآن؟" : "What is happening now?"}</h2></div><div className="orbit-cities">{["london", "new-york", "tokyo"].map((id) => { const city = cityById(id); return <article key={id}><span className="city-orbit-dot"/><p>{cityName(city, language)}<small>{timezoneLabel(now, city)}</small></p><b>{timeString(now, city, language, is24Hour)}</b></article>; })}</div><Link href="/compare" className="orbit-link">{isAr ? "قارن المدن" : "Compare cities"}<ArrowUpRight size={16}/></Link></section></AppShell>;
}
