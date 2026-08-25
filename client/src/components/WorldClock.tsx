/** ATLAS TIME — الساعة العالمية: حلقات مدن قابلة للتبديل، مؤشر ثابت، وقت IANA حي. */
import { cities } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, gregorianDate, hijriDate, timeParts, timezoneLabel } from "@/lib/time";
import { atlasAssets } from "@/lib/assets";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, GripVertical, MapPin, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CityPicker from "./CityPicker";

const mapDisc = atlasAssets.mapDisc;

function SolarDetails() {
  const { selectedCity, now, language } = useAtlasTime();
  const isAr = language === "ar";
  const [solar, setSolar] = useState<{ sunrise: string; sunset: string } | null>(null);
  useEffect(() => {
    let active = true;
    setSolar(null);
    void fetch(`https://api.sunrise-sunset.org/json?lat=${selectedCity.lat}&lng=${selectedCity.lng}&formatted=0`)
      .then((response) => response.json())
      .then((data) => { if (active) setSolar({ sunrise: data.results.sunrise, sunset: data.results.sunset }); })
      .catch(() => { if (active) setSolar(null); });
    return () => { active = false; };
  }, [selectedCity.id, selectedCity.lat, selectedCity.lng]);
  const format = (value?: string) => value ? new Intl.DateTimeFormat(language === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { timeZone: selectedCity.timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value)) : "--:--";
  return <div className="solar-details"><div className="solar-card"><span className="solar-icon sun-rise">↑</span><div><small>{isAr ? "شروق الشمس" : "Sunrise"}</small><b>{format(solar?.sunrise)}</b></div></div><div className="solar-divider"/><div className="solar-card"><span className="solar-icon sun-set">↓</span><div><small>{isAr ? "غروب الشمس" : "Sunset"}</small><b>{format(solar?.sunset)}</b></div></div><span className="solar-source" aria-label="Live solar data">{solar ? "LIVE" : "SYNC"}</span></div>;
}

export default function WorldClock() {
  const { selectedCity, selectCity, language, now, is24Hour, favorites, toggleFavorite } = useAtlasTime();
  const [pickerOpen, setPickerOpen] = useState(false);
  const isAr = language === "ar";
  const index = cities.findIndex((city) => city.id === selectedCity.id);
  const time = timeParts(now, selectedCity, language, is24Hour);
  const hour = decimalHour(now, selectedCity);
  const shiftCity = (direction: 1 | -1) => selectCity(cities[(index + direction + cities.length) % cities.length]);
  const ticks = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  return <>
    <section className="world-clock-section" aria-label={isAr ? "ساعة عالمية" : "World clock"}>
      <div className="clock-aura" />
      <div className="watch-stage">
        <div className="fixed-indicator" aria-hidden="true"><span /><i /></div>
        <motion.div className="watch-case" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}>
          <div className="bezel-glint" />
          <div className="city-ring" aria-label={isAr ? "حلقة المدن، اسحب للتبديل" : "City ring, drag to change city"}>
            <div className="ring-rail" />
            {cities.map((city, cityIndex) => {
              const angle = ((cityIndex - index + cities.length) % cities.length) * 15;
              const x = 50 + Math.sin(angle * Math.PI / 180) * 46;
              const y = 50 - Math.cos(angle * Math.PI / 180) * 46;
              const active = city.id === selectedCity.id;
              return <motion.button key={city.id} className={`city-ring-label ${active ? "active" : ""}`} animate={{ left: `${x}%`, top: `${y}%`, opacity: angle < 165 || angle > 195 ? 1 : 0.22 }} transition={{ duration: 0.72, ease: [0.77, 0, 0.175, 1] }} onClick={() => selectCity(city)} aria-label={cityName(city, language)}>{cityName(city, language)}</motion.button>;
            })}
          </div>
          <div className="hour-ring" style={{ transform: `rotate(${-hour * 15}deg)` }}><div className="day-night-sweep" />{ticks.map((tick) => <span key={tick} className={`hour-tick ${tick % 3 === 0 ? "major" : ""}`} style={{ transform: `rotate(${tick * 15}deg)` }}><i>{tick === 0 ? "24" : tick}</i></span>)}</div>
          <div className="map-disc"><img src={mapDisc} alt="" /><div className="map-vignette"/><div className="map-longitude"/></div>
          <div className="dial-center">
            <div className="dial-heading"><span className="live-dot"/>{isAr ? "الوقت المحلي" : "LOCAL TIME"}</div>
            <div className="main-time" dir="ltr" aria-live="polite"><AnimatePresence mode="popLayout"><motion.span key={`${time.hour}${time.minute}`} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -9, opacity: 0 }} transition={{ duration: 0.25 }}>{time.hour}:{time.minute}</motion.span></AnimatePresence><AnimatePresence mode="popLayout"><motion.em key={time.second} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.18 }}>{`:${time.second}`}</motion.em></AnimatePresence></div>
            <div className="current-city"><MapPin size={15}/><b>{cityName(selectedCity, language)}</b><span>{timezoneLabel(now, selectedCity)}</span></div>
            <p className="gregorian-date">{gregorianDate(now, selectedCity, language)}</p><p className="hijri-date">{hijriDate(now, selectedCity, language)}</p>
          </div>
        </motion.div>
        <div className="watch-crown left"/><div className="watch-crown right"/>
      </div>
      <div className="clock-controls"><button className="round-control" type="button" onClick={() => shiftCity(-1)} aria-label={isAr ? "المدينة السابقة" : "Previous city"}><ChevronRight size={20}/></button><button className="change-city" type="button" onClick={() => setPickerOpen(true)}><GripVertical size={16}/><span>{isAr ? "تغيير المدينة" : "Change city"}</span><small>{isAr ? "اسحب الحلقة أو اختر من الدليل" : "Drag the ring or browse directory"}</small></button><button className={`round-control favorite-control ${favorites.includes(selectedCity.id) ? "favorited" : ""}`} type="button" onClick={() => toggleFavorite(selectedCity.id)} aria-label={isAr ? "تبديل المفضلة" : "Toggle favourite"}><Star size={18}/></button><button className="round-control" type="button" onClick={() => shiftCity(1)} aria-label={isAr ? "المدينة التالية" : "Next city"}><ChevronLeft size={20}/></button></div>
      <SolarDetails />
    </section>
    <CityPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
  </>;
}
