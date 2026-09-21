type LanguageInfo = { code: string; name: string; cc: string };

const LANGUAGE_ALIASES: Record<string, string> = {
  eng: "en",
  esp: "es",
  espanol: "es",
  spanish: "es",
  tagalog: "fil",
  ph: "fil",
  br: "pt",
  "pt-br": "pt",
  brazilian: "pt",
  gb: "en",
  us: "en",
  uk: "en",
  srb: "sr",
  ksa: "ar",
  alb: "sq",
  kosovar: "sq",
  kosovan: "sq",
};

const languages = new Map<string, LanguageInfo>();
for (const entry of [
  { code: "en", name: "English", cc: "gb-eng" },
  { code: "sq", name: "Albanian", cc: "al" },
  { code: "ar", name: "Arabic", cc: "sa" },
  { code: "hy", name: "Armenian", cc: "am" },
  { code: "az", name: "Azerbaijani", cc: "az" },
  { code: "bs", name: "Bosnian", cc: "ba" },
  { code: "bg", name: "Bulgarian", cc: "bg" },
  { code: "zh", name: "Chinese", cc: "cn" },
  { code: "hr", name: "Croatian", cc: "hr" },
  { code: "cs", name: "Czech", cc: "cz" },
  { code: "da", name: "Danish", cc: "dk" },
  { code: "nl", name: "Dutch", cc: "nl" },
  { code: "et", name: "Estonian", cc: "ee" },
  { code: "fil", name: "Filipino", cc: "ph" },
  { code: "fi", name: "Finnish", cc: "fi" },
  { code: "fr", name: "French", cc: "fr" },
  { code: "ka", name: "Georgian", cc: "ge" },
  { code: "de", name: "German", cc: "de" },
  { code: "el", name: "Greek", cc: "gr" },
  { code: "he", name: "Hebrew", cc: "il" },
  { code: "hi", name: "Hindi", cc: "in" },
  { code: "hu", name: "Hungarian", cc: "hu" },
  { code: "id", name: "Indonesian", cc: "id" },
  { code: "it", name: "Italian", cc: "it" },
  { code: "ja", name: "Japanese", cc: "jp" },
  { code: "kk", name: "Kazakh", cc: "kz" },
  { code: "ko", name: "Korean", cc: "kr" },
  { code: "lv", name: "Latvian", cc: "lv" },
  { code: "lt", name: "Lithuanian", cc: "lt" },
  { code: "mk", name: "Macedonian", cc: "mk" },
  { code: "ms", name: "Malay", cc: "my" },
  { code: "no", name: "Norwegian", cc: "no" },
  { code: "fa", name: "Persian", cc: "ir" },
  { code: "pl", name: "Polish", cc: "pl" },
  { code: "pt", name: "Portuguese", cc: "pt" },
  { code: "ro", name: "Romanian", cc: "ro" },
  { code: "ru", name: "Russian", cc: "ru" },
  { code: "sr", name: "Serbian", cc: "rs" },
  { code: "sk", name: "Slovak", cc: "sk" },
  { code: "sl", name: "Slovenian", cc: "si" },
  { code: "es", name: "Spanish", cc: "es" },
  { code: "sv", name: "Swedish", cc: "se" },
  { code: "th", name: "Thai", cc: "th" },
  { code: "tr", name: "Turkish", cc: "tr" },
  { code: "uk", name: "Ukrainian", cc: "ua" },
  { code: "ur", name: "Urdu", cc: "pk" },
  { code: "vi", name: "Vietnamese", cc: "vn" },
] as const) {
  languages.set(entry.code, entry);
  languages.set(entry.name.toLowerCase(), entry);
}

const LOCATION_ALIASES: Record<string, string> = {
  "united states": "usa",
  us: "usa",
  america: "usa",
  uk: "united kingdom",
  england: "united kingdom",
  scotland: "united kingdom",
  wales: "united kingdom",
  vancouver: "canada",
  toronto: "canada",
  "czech republic": "czechia",
  bosnia: "bosnia and herzegovina",
  macedonia: "north macedonia",
  korea: "south korea",
  emirates: "uae",
  dubai: "uae",
  "united arab emirates": "uae",
  kosova: "kosovo",
};

const countries = new Map<string, { name: string; cc: string }>(
  [
    { name: "Albania", cc: "al" },
    { name: "Argentina", cc: "ar" },
    { name: "Armenia", cc: "am" },
    { name: "Australia", cc: "au" },
    { name: "Austria", cc: "at" },
    { name: "Azerbaijan", cc: "az" },
    { name: "Bahamas", cc: "bs" },
    { name: "Belarus", cc: "by" },
    { name: "Belgium", cc: "be" },
    { name: "Bosnia and Herzegovina", cc: "ba" },
    { name: "Brazil", cc: "br" },
    { name: "Bulgaria", cc: "bg" },
    { name: "Canada", cc: "ca" },
    { name: "Chile", cc: "cl" },
    { name: "China", cc: "cn" },
    { name: "Colombia", cc: "co" },
    { name: "Croatia", cc: "hr" },
    { name: "Cyprus", cc: "cy" },
    { name: "Czechia", cc: "cz" },
    { name: "Denmark", cc: "dk" },
    { name: "Egypt", cc: "eg" },
    { name: "Estonia", cc: "ee" },
    { name: "Finland", cc: "fi" },
    { name: "France", cc: "fr" },
    { name: "Georgia", cc: "ge" },
    { name: "Germany", cc: "de" },
    { name: "Greece", cc: "gr" },
    { name: "Hungary", cc: "hu" },
    { name: "Iceland", cc: "is" },
    { name: "India", cc: "in" },
    { name: "Indonesia", cc: "id" },
    { name: "Ireland", cc: "ie" },
    { name: "Israel", cc: "il" },
    { name: "Italy", cc: "it" },
    { name: "Japan", cc: "jp" },
    { name: "Jordan", cc: "jo" },
    { name: "Kazakhstan", cc: "kz" },
    { name: "Kosovo", cc: "xk" },
    { name: "Latvia", cc: "lv" },
    { name: "Lithuania", cc: "lt" },
    { name: "Malaysia", cc: "my" },
    { name: "Malta", cc: "mt" },
    { name: "Mexico", cc: "mx" },
    { name: "Montenegro", cc: "me" },
    { name: "Morocco", cc: "ma" },
    { name: "Netherlands", cc: "nl" },
    { name: "New Zealand", cc: "nz" },
    { name: "North Macedonia", cc: "mk" },
    { name: "Norway", cc: "no" },
    { name: "Peru", cc: "pe" },
    { name: "Philippines", cc: "ph" },
    { name: "Poland", cc: "pl" },
    { name: "Portugal", cc: "pt" },
    { name: "Qatar", cc: "qa" },
    { name: "Romania", cc: "ro" },
    { name: "Russia", cc: "ru" },
    { name: "Saudi Arabia", cc: "sa" },
    { name: "Serbia", cc: "rs" },
    { name: "Singapore", cc: "sg" },
    { name: "Slovakia", cc: "sk" },
    { name: "Slovenia", cc: "si" },
    { name: "Somalia", cc: "so" },
    { name: "South Africa", cc: "za" },
    { name: "South Korea", cc: "kr" },
    { name: "Spain", cc: "es" },
    { name: "Sweden", cc: "se" },
    { name: "Switzerland", cc: "ch" },
    { name: "Thailand", cc: "th" },
    { name: "Turkey", cc: "tr" },
    { name: "UAE", cc: "ae" },
    { name: "Ukraine", cc: "ua" },
    { name: "United Kingdom", cc: "gb" },
    { name: "USA", cc: "us" },
    { name: "Vietnam", cc: "vn" },
  ].map((entry) => [entry.name.toLowerCase(), entry]),
);

export function flagUrl(cc: string): string {
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.x/flags/4x3/${cc}.svg`;
}

export function resolveCountry(location: string | null | undefined): {
  name: string;
  cc: string;
} | null {
  const cleaned = (location ?? "")
    .replace(/[?]/g, "")
    .split("/")[0]
    .trim()
    .toLowerCase();
  if (!cleaned) return null;
  const key = LOCATION_ALIASES[cleaned] ?? cleaned;
  return countries.get(key) ?? null;
}

export function resolveLanguage(
  language: string | null | undefined,
): LanguageInfo | null {
  const raw = (language ?? "").trim().toLowerCase();
  if (!raw) return null;
  const code = LANGUAGE_ALIASES[raw] ?? raw;
  return languages.get(code) ?? null;
}
