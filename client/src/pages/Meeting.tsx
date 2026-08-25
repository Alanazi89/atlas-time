/** ATLAS TIME — مخطط الاجتماع: يبحث عن ساعة العمل المتقاطعة بمناطق IANA لا بإزاحات ثابتة. */
import AppShell from "@/components/AppShell";
import PageHeading from "@/components/PageHeading";
import { cities, cityById } from "@/data/cities";
import { useAtlasTime } from "@/contexts/TimeContext";
import { cityName, decimalHour, isDaytime, timeString } from "@/lib/time";
import { CalendarClock, Check, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

function closestMeeting(citiesForMeeting: string[], date: Date) {
  const start = new Date(date); start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 1);
  let best = { date: start, score: -1, comfort: -1 };
  for (let hour = 0; hour < 48; hour += 1) {
    const candidate = new Date(start.getTime() + hour * 3_600_000);
    const hours = citiesForMeeting.map((id) => decimalHour(candidate, cityById(id)));
    const score = hours.filter((value) => value >= 9 && value < 17).length;
    const comfort = hours.reduce((total, value) => total + Math.max(0, 1 - Math.abs(13 - value) / 7), 0);
    if (score > best.score || (score === best.score && comfort > best.comfort)) best = { date: candidate, score, comfort };
  }
  return best;
}

export default function Meeting() {
  const { language, now, is24Hour } = useAtlasTime();
  const [participants, setParticipants] = useState(["riyadh", "london", "new-york", "tokyo"]);
  const [addId, setAddId] = useState("paris");
  const isAr = language === "ar";
  const best = useMemo(() => closestMeeting(participants, now), [participants, now.getHours(), now.getDate()]);
  const add = () => { if (!participants.includes(addId)) setParticipants((items) => [...items, addId].slice(0, 6)); };
  return <AppShell><div className="content-page meeting-page"><PageHeading eyebrow={isAr ? "تنسيق بشري" : "HUMAN SYNCHRONY"} titleAr="وقت يناسب الفريق" titleEn="A time that respects the team" descriptionAr="نوازن ساعات العمل المحلية بين المدن ونضع الساعة المتاحة في مركز القرار."/><div className="meeting-layout"><section className="participant-panel"><div className="panel-title"><span className="eyebrow">{isAr ? "مدار الفريق" : "TEAM ORBIT"}</span><h2>{isAr ? "المشاركون" : "Participants"}</h2><p>{isAr ? "ساعات العمل المعتمدة: 09:00—17:00 محلياً." : "Working window: 09:00—17:00 local time."}</p></div><div className="participant-list">{participants.map((id) => { const city = cityById(id); return <div className="participant" key={id}><span className="participant-sigil">{cityName(city, language).slice(0, 1)}</span><div><b>{cityName(city, language)}</b><small>{isDaytime(now, city) ? (isAr ? "نهار محلي" : "Local day") : (isAr ? "ليل محلي" : "Local night")}</small></div><button onClick={() => setParticipants((items) => items.filter((item) => item !== id))} disabled={participants.length <= 2} aria-label={isAr ? "حذف" : "Remove"}><X size={15}/></button></div>; })}</div><div className="add-participant"><select value={addId} onChange={(event) => setAddId(event.target.value)}>{cities.filter((city) => !participants.includes(city.id)).map((city) => <option key={city.id} value={city.id}>{cityName(city, language)}</option>)}</select><button className="icon-button" onClick={add}><Plus size={16}/></button></div></section><section className="recommendation-panel"><div className="recommendation-top"><div><span className="eyebrow">{isAr ? "التوصية الأقرب" : "BEST WINDOW"}</span><h2>{isAr ? "أفضل وقت للاجتماع" : "Best time to meet"}</h2></div><CalendarClock size={24}/></div><div className="best-time"><span>{timeString(best.date, cityById("riyadh"), language, is24Hour)}</span><small>{isAr ? "بتوقيت الرياض" : "Riyadh time"}</small></div><div className="meeting-score"><span>{best.score}/{participants.length}</span><p>{isAr ? "ضمن ساعات العمل الآن" : "within working hours"}</p></div><div className="meeting-times">{participants.map((id) => { const city = cityById(id); const local = decimalHour(best.date, city); const isOpen = local >= 9 && local < 17; return <div key={id}><span className={`meeting-time-dot ${isOpen ? "open" : "late"}`}/><p>{cityName(city, language)}<small>{isOpen ? (isAr ? "متاح" : "Available") : (isAr ? "خارج النافذة" : "Outside window")}</small></p><b>{timeString(best.date, city, language, is24Hour)}</b></div>; })}</div><div className="meeting-note"><Check size={15}/>{isAr ? "تُحتسب فروق التوقيت الموسمية تلقائياً لكل مدينة." : "Seasonal time changes are applied automatically for every city."}</div></section></div></div></AppShell>;
}

