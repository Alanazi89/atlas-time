/** ATLAS TIME — غلاف ملاحي هادئ: فخامة أدوات السفر، ذهب معتّق، لا بطاقات عامة. */
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName } from "@/lib/time";
import { Compass, Globe2, Menu, MoonStar, Settings2, SunMedium } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";

const mark = "/manus-storage/atlas-logo-mark_891c4470.png";

const navItems = [
  { href: "/", ar: "المرصد", en: "Observatory", icon: Compass },
  { href: "/cities", ar: "المدن", en: "Cities", icon: Globe2 },
  { href: "/compare", ar: "المقارنة", en: "Compare", icon: Globe2 },
  { href: "/meeting", ar: "الاجتماعات", en: "Meetings", icon: Globe2 },
  { href: "/travel", ar: "السفر", en: "Travel", icon: Globe2 },
  { href: "/settings", ar: "الإعدادات", en: "Settings", icon: Settings2 },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { language, setLanguage, lightMode, setLightMode, selectedCity } = useAtlasTime();
  const isAr = language === "ar";
  return (
    <div className="atlas-app">
      <header className="atlas-header">
        <Link href="/" className="brand" aria-label="ATLAS TIME home">
          <img src={mark} alt="" className="brand-mark" />
          <span className="brand-copy"><b>ATLAS</b><i>TIME</i></span>
        </Link>
        <nav className="desktop-nav" aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}>
          {navItems.slice(0, 5).map((item) => {
            const active = location === item.href;
            return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>{isAr ? item.ar : item.en}</Link>;
          })}
        </nav>
        <div className="header-actions">
          <button className="city-status" type="button" title={isAr ? "المدينة الحالية" : "Current city"}><span className="status-orb" />{cityName(selectedCity, language)}</button>
          <button className="icon-button desktop-only" type="button" onClick={() => setLightMode(!lightMode)} aria-label={isAr ? "تبديل السمة" : "Toggle color theme"}>{lightMode ? <MoonStar size={17} /> : <SunMedium size={17} />}</button>
          <button className="language-toggle" type="button" onClick={() => setLanguage(isAr ? "en" : "ar")}>{isAr ? "EN" : "ع"}</button>
          <Link className={`icon-button mobile-only ${location === "/settings" ? "active" : ""}`} href="/settings" aria-label={isAr ? "الإعدادات" : "Settings"}><Menu size={18} /></Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

