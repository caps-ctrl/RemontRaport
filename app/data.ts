export const sidebarItems = [
  { id: "dashboard", label: "Pulpit", icon: "home", href: "/dashboard" },
  { id: "projects", label: "Projekty", icon: "folder", href: "/projects" },
  { id: "reports", label: "Raporty", icon: "document", href: "/dashboard" },
  { id: "clients", label: "Klienci", icon: "client", href: "/dashboard" },
  { id: "settings", label: "Ustawienia", icon: "settings", href: "/profile" },
  { id: "profile", label: "Profil", icon: "user", href: "/profile" },
] as const;

export const dashboardStats = [
  {
    icon: "folder",
    label: "Liczba projektów",
    value: "12",
    delta: "2 od ostatniego miesiąca",
    tone: "blue",
    positive: true,
  },
  {
    icon: "trend",
    label: "Liczba aktywnych projektów",
    value: "7",
    delta: "1 od ostatniego miesiąca",
    tone: "teal",
    positive: true,
  },
  {
    icon: "alert",
    label: "Liczba otwartych usterek",
    value: "18",
    delta: "3 od ostatniego miesiąca",
    tone: "orange",
    positive: false,
  },
] as const;

export const dashboardEntries = [
  {
    project: "Mieszkanie - Warszawa, Wola",
    address: "ul. Jana Kazimierza 33",
    type: "Zdjęcia",
    icon: "camera",
    date: "Dzisiaj, 09:15",
    author: "Alicja",
    status: "Zakończone",
    statusTone: "green",
    imageTone: "warm",
  },
  {
    project: "Dom - Konstancin",
    address: "ul. Leśna 8",
    type: "Raport",
    icon: "document",
    date: "Wczoraj, 16:42",
    author: "Piotr",
    status: "W trakcie",
    statusTone: "blue",
    imageTone: "light",
  },
  {
    project: "Biuro - Mokotów",
    address: "ul. Domaniewska 45",
    type: "Usterka",
    icon: "alert",
    date: "21.05.2025, 11:08",
    author: "Alicja",
    status: "Nowa",
    statusTone: "orange",
    imageTone: "default",
  },
  {
    project: "Apartamenty - Żoliborz",
    address: "ul. Rydygiera 20",
    type: "Notatka",
    icon: "note",
    date: "20.05.2025, 14:33",
    author: "Marek",
    status: "Zakończone",
    statusTone: "green",
    imageTone: "light",
  },
  {
    project: "Sklep - Galeria Mokotów",
    address: "ul. Wołoska 12",
    type: "Zdjęcia",
    icon: "camera",
    date: "19.05.2025, 09:27",
    author: "Alicja",
    status: "W trakcie",
    statusTone: "blue",
    imageTone: "warm",
  },
] as const;

export const dashboardTasks = [
  ["Przygotować raport miesięczny", "Termin: 23.05.2025", "W trakcie", "blue"],
  ["Zweryfikować usterki - Biuro", "Termin: 24.05.2025", "Pilne", "orange"],
  ["Spotkanie z klientem", "Termin: 26.05.2025", "W trakcie", "blue"],
] as const;

export const quickActions = [
  { label: "Dodaj projekt", icon: "folder", color: "text-blue-600" },
  { label: "Dodaj usterkę", icon: "alert", color: "text-orange-500" },
  { label: "Dodaj notatkę", icon: "note", color: "text-violet-600" },
  { label: "Wygeneruj raport", icon: "document", color: "text-teal-600" },
] as const;

export const profileTeam = [
  [
    "Jan Kowalski",
    "jan.kowalski@example.com",
    "Właściciel",
    "Pełny dostęp",
    "Dzisiaj, 10:30",
    "blue",
  ],
  [
    "Anna Nowak",
    "anna.nowak@example.com",
    "Edytor",
    "Edytowanie projektów",
    "Wczoraj, 15:45",
    "violet",
  ],
  [
    "Piotr Zieliński",
    "piotr.zielinski@example.com",
    "Podgląd",
    "Tylko podgląd",
    "20.05.2024, 09:15",
    "green",
  ],
] as const;
