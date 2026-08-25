/** ATLAS TIME — حالة التطبيق: مدينة، لغة، تفضيلات محلية ومفضلات محفوظة على الجهاز. */
import { cities, cityById, type City } from "@/data/cities";
import type { Language } from "@/lib/time";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type TimeContextValue = {
  selectedCity: City;
  selectCity: (city: City) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  recents: string[];
  language: Language;
  setLanguage: (language: Language) => void;
  is24Hour: boolean;
  setIs24Hour: (value: boolean) => void;
  lightMode: boolean;
  setLightMode: (value: boolean) => void;
  now: Date;
  locateNearestCity: () => void;
};

const TimeContext = createContext<TimeContextValue | null>(null);
const storageKey = "atlas-time-preferences";

export function TimeProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState("riyadh");
  const [favorites, setFavorites] = useState<string[]>(["riyadh", "london", "new-york", "tokyo"]);
  const [recents, setRecents] = useState<string[]>(["riyadh"]);
  const [language, setLanguage] = useState<Language>("ar");
  const [is24Hour, setIs24Hour] = useState(true);
  const [lightMode, setLightMode] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const value = JSON.parse(saved);
      if (typeof value.selectedId === "string" && cities.some((city) => city.id === value.selectedId)) setSelectedId(value.selectedId);
      if (Array.isArray(value.favorites)) setFavorites(value.favorites);
      if (Array.isArray(value.recents)) setRecents(value.recents);
      if (value.language === "ar" || value.language === "en") setLanguage(value.language);
      if (typeof value.is24Hour === "boolean") setIs24Hour(value.is24Hour);
      if (typeof value.lightMode === "boolean") setLightMode(value.lightMode);
    } catch { /* keep safe defaults when storage is malformed */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ selectedId, favorites, recents, language, is24Hour, lightMode }));
    } catch { /* تبقى الإعدادات للجلسة الحالية إذا عطّل المتصفح التخزين المحلي. */ }
    document.documentElement.classList.toggle("atlas-light", lightMode);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [selectedId, favorites, recents, language, is24Hour, lightMode]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectCity = (city: City) => {
    setSelectedId(city.id);
    setRecents((current) => [city.id, ...current.filter((id) => id !== city.id)].slice(0, 6));
  };

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const locateNearestCity = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const nearest = cities.reduce((best, city) => {
        const distance = Math.hypot(city.lat - coords.latitude, city.lng - coords.longitude);
        const bestDistance = Math.hypot(best.lat - coords.latitude, best.lng - coords.longitude);
        return distance < bestDistance ? city : best;
      }, cities[0]);
      selectCity(nearest);
    });
  };

  const value = useMemo(() => ({ selectedCity: cityById(selectedId), selectCity, favorites, toggleFavorite, recents, language, setLanguage, is24Hour, setIs24Hour, lightMode, setLightMode, now, locateNearestCity }), [selectedId, favorites, recents, language, is24Hour, lightMode, now]);
  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

export const useAtlasTime = () => {
  const context = useContext(TimeContext);
  if (!context) throw new Error("useAtlasTime must be used within TimeProvider");
  return context;
};
