import type { NavLink, GalleryItem, Product, FooterColumn, TimelineEntry } from "@/types/content";

export const SITE = {
  title: "Brasilena | La bibita al caffè dei Calabresi",
  description:
    "Brasilena, la storica gassosa al caffè della Calabria. Acqua oligominerale e vero caffè dal 1930, un prodotto di Acqua Calabria.",
  instagram: "https://instagram.com/brasilena",
  email: "info@brasilena.net",
} as const;

export const NAV: NavLink[] = [
  { label: "Le mie bibite", href: "/#prodotti" },
  { label: "La mia gente", href: "/#la-mia-gente" },
  { label: "La mia storia", href: "/storia" },
  { label: "Contatti", href: "/#form" },
];

export const HERO = {
  title: ["La bibita", "preferita", "dai calabresi"],
  intro:
    "Quasi cent'anni negli stessi bar, negli stessi bicchieri. Certe cose non passano di moda perché non sono mai state una moda.",
  cta: "Scopri le mie bibite",
  scroll: "Scorri",
} as const;

/**
 * Opening act — the yellow hero that scrubs a frame-by-frame sequence of the
 * Brasilena bottle popping open (the "stappo" effect) as you scroll. The middle
 * headline word is the red brand accent.
 */
export const HERO_ANIM = {
  kicker: "La gassosa al caffè · dal 1930",
  headline: ["La bibita", "preferita", "dai calabresi"],
  lede:
    "Il momento esatto in cui il tappo salta e l'aroma di caffè esplode — catturato fotogramma per fotogramma.",
  ctaPrimary: "Le mie bibite",
  ctaSecondary: "La mia gente",
  ticker: ["Stappa", "Versa", "Brinda"],
} as const;

export const STORY = {
  paragraph:
    "Non sono fatta per stare chiusa in dispensa. Sono fatta per le tavolate al sole, le chiacchiere senza fine, la buona compagnia e un caffè da bere ghiacciato.",
  cta: "La mia gente",
  videoCaption: "ma mi raccomando, ben fredda",
  vimeoId: "1183339301",
  closing: "A tutto caffè",
} as const;

export const GALLERY: GalleryItem[] = [
  { src: "/images/gallery-amici.png", alt: "Amici al bar versano una Brasilena", caption: "La compagnia" },
  { src: "/images/gallery-carte.png", alt: "Partita a carte con la Brasilena", caption: "La partita" },
  { src: "/images/gallery-aperitivo.png", alt: "Aperitivo con Brasilena, tortilla e olive", caption: "L'aperitivo" },
  { src: "/images/gallery-brindisi.png", alt: "Amici brindano con la Brasilena al bar", caption: "Il brindisi" },
];

/**
 * "La mia storia" — the cronostoria page. The drink narrates its own history
 * (first person, matching the brand voice) across a scroll-driven timeline.
 * Entries with `image: null` render an on-brand placeholder until a real period
 * photo is supplied. Synthesised from the Brasilena / Acqua Calabria history.
 */
export const STORIA = {
  kicker: "La mia storia · dal 1930",
  title: "La mia storia",
  lede:
    "Quasi cent'anni in un sorso. Dalla bottega con la pallina di vetro ai cartelloni anni '60, fino ai tavolini di mezzo mondo: ecco come sono diventata la gassosa al caffè dei calabresi.",
  scroll: "Scorri la cronostoria",
  timeline: [
    {
      year: "Anni '30",
      title: "La gassosa al caffè",
      text: "In una piccola bottega di Girifalco, tra le colline del catanzarese, nonno Cristofaro prova a infondere il caffè tostato nell'acqua frizzante. Nasce così la gassosa al caffè. Non esistono ancora i tappi a corona: a chiudere la bottiglia è una pallina di vetro, spinta fino al collo dall'anidride carbonica. Si vende sfusa, senza nome e senza marchio.",
      image: "/images/brasilena/bottega-anni30.webp",
      imageAlt: "Antica bottega calabrese con la bottiglia di gassosa al caffè",
      fit: "cover",
    },
    {
      year: "Dopoguerra",
      title: "Un nome sull'etichetta",
      text: "Finita la Seconda Guerra Mondiale, ottenere una licenza diventa più facile: un aiuto alle attività colpite dal conflitto. In cambio, una regola nuova — sull'etichetta devono comparire gli ingredienti e il nome di chi produce. Quello che oggi diamo per scontato, allora era una piccola rivoluzione.",
      image: "/images/brasilena/dopoguerra-etichetta.webp",
      imageAlt: "Dopoguerra: si esaminano le bottiglie con ingredienti e nome sull'etichetta",
      fit: "cover",
    },
    {
      year: "Anni '60",
      title: "Nasce Brasilena",
      text: "Con un impianto nuovo e tanta caparbietà, la famiglia Cristofaro apre uno stabilimento dedicato all'imbottigliamento. Salvatore Cristofaro battezza la bibita: BRASILENA. Il marchio viene registrato per la prima volta e le città calabresi si riempiono di cartelloni colorati. Quel logo caldo, vintage, è ancora oggi la mia firma.",
      image: "/images/brasilena/bottiglia-brasilena-92cl.png",
      imageAlt: "Bottiglia Brasilena col marchio e il logo storico",
      fit: "contain",
    },
    {
      year: "Anni '70",
      title: "L'acqua della Calabria",
      text: "Circa dieci anni dopo arriva la svolta: l'acqua oligominerale della Calabria. Un'idea vincente, che dà alla Brasilena il suo sapore inconfondibile e fa crescere l'azienda — fino a dare vita anche alle gassose al limone, sorelle minori della gassosa al caffè.",
      image: "/images/brasilena/sorgente-monte-covello.webp",
      imageAlt: "Acqua oligominerale che sgorga dalla sorgente in Calabria",
      fit: "cover",
    },
    {
      year: "1982",
      title: "Casa: Monte Covello",
      text: "La produzione trova casa negli stabilimenti di Monte Covello, vicino Girifalco, sotto il marchio Acqua Calabria. Prima la Calabria, poi la Puglia, la Campania, la Sicilia: la gassosa al caffè conquista il Sud, un bicchiere alla volta.",
      image: "/images/brasilena/monte-covello-1982.webp",
      imageAlt: "Brasilena in una piazza calabrese assolata, su un tavolino del bar",
      fit: "cover",
    },
    {
      year: "Oggi",
      title: "In tutto il mondo",
      text: "Oggi viaggio ben oltre il Sud: Albania, Canada, Stati Uniti, Cina, Australia. Mi trovi in bottiglia di vetro da 18, 25 e 92 cl e in lattina slim da 25 cl. L'80% della produzione è in vetro riutilizzabile, perché le cose buone vanno restituite — anche alla terra.",
      image: "/images/brasilena/oggi-formati.webp",
      imageAlt: "La famiglia Brasilena: bottiglie e lattina slim, dal 1930",
      fit: "cover",
    },
  ] satisfies TimelineEntry[],
  closing: {
    quote: "«Vediamoci per una Brasilena»",
    text: "In Calabria, quando è troppo tardi per un caffè e troppo presto per qualcosa di più forte, ci si dà appuntamento così. Non sono fatta da una grande multinazionale, ma da una piccola azienda calabrese — e da quasi cent'anni di sorsi condivisi.",
    cta: "Scopri le mie bibite",
    ctaHref: "/#prodotti",
  },
} as const;

export const PRODUCTS_INTRO = {
  title: "Le mie bibite",
  text: "In bottiglia di vetro o in lattina, da gustare da soli o da condividere. Cambia il formato, non cambia il caffè.",
  cta: "Scopri tutti i formati",
} as const;

export const PRODUCTS: Product[] = [
  {
    name: "Bottiglia",
    slug: "vetro-18cl",
    size: "18 cl",
    format: "Linea vetro",
    titleColor: "#6a3f40",
    background: "/images/brasilena/bg-18cl.svg",
    bottle: "/images/brasilena/cut-18cl.png",
    bottleAlt: "Brasilena, bottiglia di vetro da 18 cl",
  },
  {
    name: "Bottiglia",
    slug: "vetro-25cl",
    size: "25 cl",
    format: "Linea vetro",
    titleColor: "#6a3f40",
    background: "/images/brasilena/bg-25cl.svg",
    bottle: "/images/brasilena/cut-25cl.png",
    bottleAlt: "Brasilena, bottiglia di vetro da 25 cl",
  },
  {
    name: "Bottiglione",
    slug: "vetro-92cl",
    size: "92 cl",
    format: "Linea vetro",
    titleColor: "#ece1e5",
    background: "/images/brasilena/bg-92cl.svg",
    bottle: "/images/brasilena/cut-92cl.png",
    bottleAlt: "Brasilena, bottiglia di vetro da 92 cl",
  },
  {
    name: "Lattina",
    slug: "lattina-25cl",
    size: "25 cl",
    format: "Alluminio",
    titleColor: "#ece1e5",
    background: "/images/brasilena/bg-lattina.svg",
    bottle: "/images/brasilena/cut-lattina.png",
    bottleAlt: "Brasilena, lattina di alluminio da 25 cl",
  },
];

export const MARQUEE_PHRASES = ["Anima brasiliana", "Cuore calabrese"];

export const FORM = {
  title: "Cosa ti porta da queste parti?",
  subtitle: "Dimmi di cosa hai bisogno e vediamo come posso aiutarti, caro.",
  tabs: ["Voglio contattarvi", "Voglio collaborare"],
  steps: {
    name: {
      label: "Come ti chiami?",
      help: "Niente formalità, ma mi piace sapere con chi parlo.",
      error: "Il nome è obbligatorio",
    },
    email: {
      label: "E la tua email?",
      help: "Così posso risponderti senza perdermi per strada.",
      error: "Inserisci un'email valida",
    },
    message: {
      label: "Qualcos'altro?",
      help: "Dimmi tutto, qui ti ascolto.",
      error: "Il messaggio è obbligatorio",
    },
  },
  privacy: "Ho letto e accetto la politica sulla privacy",
  privacyError: "Devi accettare la politica sulla privacy",
  recaptcha:
    "Questo sito è protetto da reCAPTCHA e si applicano le Norme sulla privacy e i Termini di servizio di Google.",
  back: "Indietro",
  submit: "Invia",
  successTitle: "Fatto, caro.",
  successText: "Ti rispondo appena posso. Intanto, fatti un giro da queste parti.",
} as const;

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Navigazione",
    links: [
      { label: "Home", href: "/" },
      { label: "Prodotti", href: "/#prodotti" },
      { label: "Storia", href: "/storia" },
      { label: "Calabresi", href: "/#la-mia-gente" },
      { label: "Contatti", href: "/#form" },
    ],
  },
  {
    heading: "Note legali",
    links: [
      { label: "Note legali", href: "/note-legali" },
      { label: "Politica sulla privacy", href: "/politica-privacy" },
      { label: "Politica sui cookie", href: "/politica-cookie" },
      { label: "Gestisci i cookie", href: "#" },
    ],
  },
];

export const FOOTER_META = {
  contactHeading: "Contatti",
  email: SITE.email,
  copyright:
    "2026 © Brasilena. Tutti i diritti riservati. Un prodotto di Acqua Calabria.",
  design: "Design by Lorenzo Dastoli.",
} as const;

export const COOKIE = {
  title: "Cookie, che ci vuoi fare",
  text: "Cookie, che ci vuoi fare. Li uso per migliorare la tua esperienza e capire come navighi da queste parti. Scegli quali tenere.",
  policy: "Informativa Cookie",
  accept: "Accetta",
  reject: "Rifiuta",
  customize: "Personalizza",
} as const;
