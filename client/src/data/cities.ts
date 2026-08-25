/** ATLAS TIME — طبقة البيانات: مدن فعلية وإحداثيات ومناطق IANA، لا فروقات UTC ثابتة. */
export type City = {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  timezone: string;
  lat: number;
  lng: number;
};

export const cities: City[] = [
  { id: "riyadh", nameAr: "الرياض", nameEn: "Riyadh", countryAr: "السعودية", countryEn: "Saudi Arabia", timezone: "Asia/Riyadh", lat: 24.7136, lng: 46.6753 },
  { id: "dubai", nameAr: "دبي", nameEn: "Dubai", countryAr: "الإمارات", countryEn: "United Arab Emirates", timezone: "Asia/Dubai", lat: 25.2048, lng: 55.2708 },
  { id: "karachi", nameAr: "كراتشي", nameEn: "Karachi", countryAr: "باكستان", countryEn: "Pakistan", timezone: "Asia/Karachi", lat: 24.8607, lng: 67.0011 },
  { id: "dhaka", nameAr: "دكا", nameEn: "Dhaka", countryAr: "بنغلاديش", countryEn: "Bangladesh", timezone: "Asia/Dhaka", lat: 23.8103, lng: 90.4125 },
  { id: "bangkok", nameAr: "بانكوك", nameEn: "Bangkok", countryAr: "تايلاند", countryEn: "Thailand", timezone: "Asia/Bangkok", lat: 13.7563, lng: 100.5018 },
  { id: "hong-kong", nameAr: "هونغ كونغ", nameEn: "Hong Kong", countryAr: "هونغ كونغ", countryEn: "Hong Kong", timezone: "Asia/Hong_Kong", lat: 22.3193, lng: 114.1694 },
  { id: "tokyo", nameAr: "طوكيو", nameEn: "Tokyo", countryAr: "اليابان", countryEn: "Japan", timezone: "Asia/Tokyo", lat: 35.6762, lng: 139.6503 },
  { id: "sydney", nameAr: "سيدني", nameEn: "Sydney", countryAr: "أستراليا", countryEn: "Australia", timezone: "Australia/Sydney", lat: -33.8688, lng: 151.2093 },
  { id: "auckland", nameAr: "أوكلاند", nameEn: "Auckland", countryAr: "نيوزيلندا", countryEn: "New Zealand", timezone: "Pacific/Auckland", lat: -36.8509, lng: 174.7645 },
  { id: "midway", nameAr: "ميدواي", nameEn: "Midway", countryAr: "جزر ميدواي", countryEn: "Midway Islands", timezone: "Pacific/Midway", lat: 28.2072, lng: -177.3735 },
  { id: "honolulu", nameAr: "هونولولو", nameEn: "Honolulu", countryAr: "الولايات المتحدة", countryEn: "United States", timezone: "Pacific/Honolulu", lat: 21.3069, lng: -157.8583 },
  { id: "anchorage", nameAr: "أنكوراج", nameEn: "Anchorage", countryAr: "الولايات المتحدة", countryEn: "United States", timezone: "America/Anchorage", lat: 61.2181, lng: -149.9003 },
  { id: "los-angeles", nameAr: "لوس أنجلوس", nameEn: "Los Angeles", countryAr: "الولايات المتحدة", countryEn: "United States", timezone: "America/Los_Angeles", lat: 34.0522, lng: -118.2437 },
  { id: "denver", nameAr: "دنفر", nameEn: "Denver", countryAr: "الولايات المتحدة", countryEn: "United States", timezone: "America/Denver", lat: 39.7392, lng: -104.9903 },
  { id: "mexico-city", nameAr: "مكسيكو سيتي", nameEn: "Mexico City", countryAr: "المكسيك", countryEn: "Mexico", timezone: "America/Mexico_City", lat: 19.4326, lng: -99.1332 },
  { id: "new-york", nameAr: "نيويورك", nameEn: "New York", countryAr: "الولايات المتحدة", countryEn: "United States", timezone: "America/New_York", lat: 40.7128, lng: -74.006 },
  { id: "buenos-aires", nameAr: "بوينس آيرس", nameEn: "Buenos Aires", countryAr: "الأرجنتين", countryEn: "Argentina", timezone: "America/Argentina/Buenos_Aires", lat: -34.6037, lng: -58.3816 },
  { id: "sao-paulo", nameAr: "ساو باولو", nameEn: "São Paulo", countryAr: "البرازيل", countryEn: "Brazil", timezone: "America/Sao_Paulo", lat: -23.5558, lng: -46.6396 },
  { id: "london", nameAr: "لندن", nameEn: "London", countryAr: "المملكة المتحدة", countryEn: "United Kingdom", timezone: "Europe/London", lat: 51.5072, lng: -0.1276 },
  { id: "geneva", nameAr: "جنيف", nameEn: "Geneva", countryAr: "سويسرا", countryEn: "Switzerland", timezone: "Europe/Zurich", lat: 46.2044, lng: 6.1432 },
  { id: "paris", nameAr: "باريس", nameEn: "Paris", countryAr: "فرنسا", countryEn: "France", timezone: "Europe/Paris", lat: 48.8566, lng: 2.3522 },
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", countryAr: "مصر", countryEn: "Egypt", timezone: "Africa/Cairo", lat: 30.0444, lng: 31.2357 },
  { id: "moscow", nameAr: "موسكو", nameEn: "Moscow", countryAr: "روسيا", countryEn: "Russia", timezone: "Europe/Moscow", lat: 55.7558, lng: 37.6173 },
  { id: "reykjavik", nameAr: "ريكيافيك", nameEn: "Reykjavík", countryAr: "آيسلندا", countryEn: "Iceland", timezone: "Atlantic/Reykjavik", lat: 64.1466, lng: -21.9426 },
];

export const cityById = (id: string) => cities.find((city) => city.id === id) ?? cities[0];

