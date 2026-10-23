export type Shot = {
  src: string;
  alt: string;
  /** "desktop" = 16:9-ish browser capture, "mobile" = phone capture */
  kind: "desktop" | "mobile" | "panel";
  caption?: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  client: string;
  year: string;
  role: string;
  summary: string;
  /** One line shown on the home card */
  hook: string;
  stack: readonly string[];
  facts: readonly { value: string; label: string }[];
  /** What came of it — only things that can be shown or verified. */
  outcome?: { title: string; points: readonly string[] };
  live?: { label: string; href: string };
  status?: string;
  cover: Shot;
  /** Extra images layered around the cover on the home card (parallax) */
  preview: readonly Shot[];
  /** Accent sampled from the project's own UI, used for its card and case study */
  accent: string;
  problem: string;
  sections: readonly { title: string; body: string; shots?: readonly Shot[] }[];
  /** In his own words; the case study leaves the closing quote out when this is empty. */
  learned?: string;
};

export const projects: readonly Project[] = [
  {
    slug: "webkeun-invitations",
    index: "01",
    title: "Webkeun Digital Invitations",
    client: "Webkeun.id — my web development platform",
    year: "2026",
    role: "Founder · design, full-stack, deploy",
    summary:
      "Wedding invitations that greet every guest by name, collect RSVPs and wishes, and carry a digital envelope, with an admin dashboard for the couple.",
    hook: "Invitations that know each guest's name, and a dashboard that knows who's coming.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL RLS", "Vercel"],
    facts: [
      { value: "11", label: "themes, from Javanese to Chinese peony" },
      { value: "3", label: "packages, Rp99k to Rp349k" },
      { value: "xlsx", label: "guest list import, then links sent over WhatsApp" },
    ],
    live: { label: "Browse the themes", href: "https://webkeun.id/template/undangan" },
    cover: {
      src: "/work/webkeun-invitation/theme-pranata-jawa.webp",
      alt: "Pranata Jawa invitation theme on a phone: Laras & Bima, Javanese wedding attire",
      kind: "mobile",
    },
    preview: [
      { src: "/work/webkeun-invitation/theme-oriental-peony.webp", alt: "Oriental Peony invitation theme", kind: "mobile" },
      { src: "/work/webkeun-invitation/theme-biru-porselen.webp", alt: "Biru Porselen invitation theme", kind: "mobile" },
    ],
    accent: "#b8955a",
    problem:
      "In Indonesia, wedding invitations travel through WhatsApp. Most digital ones are one link for everybody: \"Dear Guest\", an RSVP that happens in the chat, and a bank number someone has to copy by hand. The couple ends up with a spreadsheet, a hundred chats, and no idea who's actually coming.",
    sections: [
      {
        title: "One link per guest",
        body: "Every guest gets a personal link, so the cover says their name instead of \"Tamu Undangan\". The couple imports the guest list from Excel and sends each link from the dashboard through WhatsApp, with the message already written.",
        shots: [
          { src: "/work/webkeun-invitation/theme-biru-porselen.webp", alt: "Biru Porselen theme cover with a personalised guest greeting", kind: "mobile", caption: "Biru Porselen" },
          { src: "/work/webkeun-invitation/theme-oriental-peony.webp", alt: "Oriental Peony theme cover with red lanterns", kind: "mobile", caption: "Oriental Peony" },
          { src: "/work/webkeun-invitation/theme-art-sunda.webp", alt: "Art Sunda theme cover in an arched frame", kind: "mobile", caption: "Art Sunda" },
          { src: "/work/webkeun-invitation/theme-luxury.webp", alt: "Luxury theme cover with a black-tie couple portrait", kind: "mobile", caption: "Luxury" },
        ],
      },
      {
        title: "RSVP, wishes and the envelope in the invitation itself",
        body: "Guests confirm attendance and leave a wish in the same form; wishes appear on a wall for everyone to read. The digital envelope keeps bank and e-wallet details one tap from being copied, so nobody has to ask in the family group.",
        shots: [
          { src: "/work/webkeun-invitation/rsvp-wishes.webp", alt: "RSVP form with attend / not attend buttons and a wall of guest wishes", kind: "mobile", caption: "RSVP + wishes" },
          { src: "/work/webkeun-invitation/digital-envelope.webp", alt: "Wedding gift section with a digital envelope button", kind: "mobile", caption: "Digital envelope" },
        ],
      },
      {
        title: "Who sees what: Row-Level Security",
        body: "Guest data lives in Supabase PostgreSQL. Row-Level Security policies decide what each request may read, so invited guests with an assigned seat only see their own row, general guests see the shared invitation, and only the couple's authenticated dashboard can list or edit the guest book. The rule lives in the database, not in whichever page happens to be asking.",
      },
      {
        title: "A catalogue people can actually try",
        body: "Every theme has a full live demo, grouped by culture and style, so couples can scroll the real thing on their own phone before ordering.",
        shots: [
          { src: "/work/webkeun-invitation/theme-catalog.webp", alt: "Webkeun theme catalogue grouped into Adat & Budaya, Islami and more", kind: "desktop", caption: "Theme catalogue" },
          { src: "/work/webkeun-invitation/webkeun-home.webp", alt: "Webkeun.id home page", kind: "desktop", caption: "webkeun.id" },
        ],
      },
    ],
    learned:
      "Running it as a business taught me as much as building it. Consultation, pricing, domains and launch day are part of the product too, and the client only ever sees those.",
  },
  {
    slug: "ocean-young-guards",
    index: "02",
    title: "Ocean Young Guards",
    client: "Ocean Young Guards — marine conservation NGO",
    year: "Jan — Jul 2026",
    role: "Full-stack developer intern",
    summary:
      "A volunteer platform for a marine conservation NGO, from browsing an event to an issued certificate, with an admin side that verifies every payment.",
    hook: "From \"I want to join\" to a certificate, without a single Google Form.",
    stack: ["React", "Vite", "Tailwind CSS", "Express", "Sequelize", "PostgreSQL", "JWT"],
    facts: [
      { value: "2", label: "sides built: volunteer and admin" },
      { value: "5", label: "steps from sign-up to certificate" },
      { value: "6", label: "admin modules, from events to user management" },
    ],
    status: "Not launched yet: screens are from the development build, with demo data.",
    outcome: {
      title: "Where it ended up",
      points: [
        "The whole volunteer journey works end to end on the development build: browse, eligibility check, payment, admin approval, certificate.",
        "Payment review moved out of chat screenshots and into one admin table with approve, reject, bulk approve and export.",
        "Recognised with a Certificate of Appreciation from Ocean Young Guards at the end of the internship (No. 03/CA/OYG/VIII/26).",
      ],
    },
    cover: {
      src: "/work/oyg/landing-desktop.webp",
      alt: "Ocean Young Guards landing page: volunteers standing in the sea holding flags",
      kind: "desktop",
    },
    preview: [{ src: "/work/oyg/landing-mobile.webp", alt: "Ocean Young Guards landing page on a phone", kind: "mobile" }],
    accent: "#1fb6d5",
    problem:
      "Voluntrips were run on forms, transfer screenshots in chat, and a spreadsheet someone had to reconcile by hand. Nobody could tell at a glance who had paid, who had sent their documents, or who was still waiting for a certificate.",
    sections: [
      {
        title: "The volunteer's path",
        body: "Browse an event, pass the eligibility checklist (ID card and a signed consent form, with a downloadable template), pay, and follow the status from a personal dashboard until the certificate arrives.",
        shots: [
          { src: "/work/oyg/event-detail.webp", alt: "Event detail page for Earth Therapy beach clean-up with date, location, capacity and price", kind: "desktop", caption: "Event detail" },
          { src: "/work/oyg/enrollment-checklist.webp", alt: "Two-step enrollment portal asking for an ID card and consent form upload", kind: "panel", caption: "Eligibility checklist" },
        ],
      },
      {
        title: "The admin's side",
        body: "Admins manage events, coupons, enrollments and users. Payment proofs land in a review table with bulk approve and export, and the volunteer sees the result on their own dashboard. Behind it: an Express REST API with JWT auth, Sequelize models on PostgreSQL, file uploads, search and pagination.",
        shots: [
          { src: "/work/oyg/payment-verification.webp", alt: "Admin payment verification table with view proof, approve and reject actions", kind: "desktop", caption: "Payment verification" },
        ],
      },
      {
        title: "Small things on purpose",
        body: "The dashboard greets you differently each visit (\"The tide is calling…\", \"Welcome to the Ocean Front…\"), there's a dark mode, and the mobile layout was redesigned rather than shrunk: the headline breaks into four lines and the CTAs go full width.",
        shots: [
          { src: "/work/oyg/landing-mobile.webp", alt: "Ocean Young Guards landing page on a phone", kind: "mobile", caption: "Mobile landing" },
        ],
      },
    ],
    learned:
      "My first time building inside a team's codebase: working on Git branches, keeping the API and the UI in step, and testing routes in Postman before wiring them to a screen.",
  },
  {
    slug: "mylife",
    index: "03",
    title: "MyLife",
    client: "Personal project — life management web app",
    year: "2026",
    role: "Full-stack · Next.js front end, Express API",
    summary:
      "One account for the parts of a student's life that usually live in separate apps: money, tasks, calendar, journal, memories, goals and grades. In Bahasa Indonesia or English, light or dark.",
    hook: "Money, tasks, memories and GPA in one calm space, and they work together.",
    stack: ["Next.js", "Express"],
    facts: [
      { value: "7", label: "modules: finance, to-do, calendar, journal, memories, goals, grades" },
      { value: "2", label: "languages, switchable anytime: Bahasa Indonesia and English" },
      { value: "2", label: "themes, light and dark, on laptop, tablet and phone" },
    ],
    live: { label: "Open MyLife", href: "https://mylife-web-eta.vercel.app/" },
    cover: {
      src: "/work/mylife/landing-desktop.webp",
      alt: "MyLife landing page: 'Your life, beautifully organized.' above a preview of the dashboard",
      kind: "desktop",
    },
    preview: [{ src: "/work/mylife/landing-mobile.webp", alt: "MyLife landing page on a phone", kind: "mobile" }],
    accent: "#5755d4",
    problem:
      "Money that comes and goes, tasks that keep piling up, moments worth keeping, goals worth chasing. Usually each of them lives in a different app, and none of those apps know about the others.",
    sections: [
      {
        title: "Seven spaces, one account",
        body: "Finance tracks income and expenses month by month. To-Do keeps work, college and errands in one list, and Calendar puts events next to task deadlines. Journal is for the day's story and mood, Memories keeps photos in albums, and Grades logs each semester's courses and works the GPA out for you.",
        shots: [{ src: "/work/mylife/features.webp", alt: "MyLife features section: Finance with a monthly balance chart and a To-Do list", kind: "desktop", caption: "Features" }],
      },
      {
        title: "Goals that are tied to the rest",
        body: "A financial goal fills up as you save, and each saving is recorded in Finance automatically. A life goal, like graduating, breaks into steps you tick off one by one, with the progress shown as you go.",
        shots: [{ src: "/work/mylife/goals.webp", alt: "Goals section: a MacBook savings goal at 68% and a graduation goal broken into steps", kind: "desktop", caption: "Goals" }],
      },
      {
        title: "Indonesian or English, light or dark",
        body: "Language and theme switch from the navbar at any time, and the layout works on a laptop, a tablet or a phone.",
        shots: [
          { src: "/work/mylife/bahasa-indonesia.webp", alt: "MyLife landing page in Bahasa Indonesia: 'Hidupmu, tertata indah.'", kind: "desktop", caption: "Bahasa Indonesia" },
          { src: "/work/mylife/dark-mode.webp", alt: "MyLife landing page in dark mode", kind: "desktop", caption: "Dark mode" },
        ],
      },
    ],
  },
  {
    slug: "webkeun-templates",
    index: "04",
    title: "Webkeun Business Templates",
    client: "Webkeun.id — templates for small businesses",
    year: "2026",
    role: "Design & build",
    summary:
      "Five small-business websites, each with its own voice. A rental that plans your trip, a laundry that prices itself, a coffee shop, a logistics company and a photographer.",
    hook: "Five businesses, five personalities, and every one ends in a WhatsApp order.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    facts: [
      { value: "5", label: "industries: rental, coffee, logistics, photo, laundry" },
      { value: "1", label: "trip planner with fleet filter and price estimate" },
      { value: "0", label: "lorem ipsum: real copy in local Indonesian voice" },
    ],
    live: { label: "See all templates", href: "https://webkeun.id/template" },
    cover: {
      src: "/work/webkeun-templates/laju-jogja.webp",
      alt: "Laju Jogja rental template hero: 'Jogja, sesukamu.' with a Fortuner in the forest",
      kind: "desktop",
    },
    preview: [{ src: "/work/webkeun-templates/kawalu-coffee.webp", alt: "Kawalu Coffee template hero", kind: "desktop" }],
    accent: "#e2552d",
    problem:
      "Small businesses in Indonesia mostly live on Instagram and WhatsApp. A template that's only a brochure doesn't help them; the site has to do a bit of the selling, answering \"how much?\" and \"is it available?\" before the chat starts.",
    sections: [
      {
        title: "Laju Jogja: a rental that plans the trip",
        body: "Filter the fleet by cars or motorbikes, pick dates, times and pick-up, and get the price estimate before you message. The planner builds the WhatsApp message for you.",
        shots: [
          { src: "/work/webkeun-templates/laju-fleet.webp", alt: "Fleet section with car/motorbike filter and price per day", kind: "desktop", caption: "Fleet filter" },
          { src: "/work/webkeun-templates/laju-planner.webp", alt: "Trip planner form with vehicle, dates, service type and pick-up location", kind: "desktop", caption: "Trip planner" },
        ],
      },
      {
        title: "Four more, none alike",
        body: "Kawalu Coffee is a hand-drawn hillside. Bahtera is a shipping container. Laras Kinanti is a photographer's pinboard. Seungit Laundry jokes about Bandung's rain and sells packages sized for students.",
        shots: [
          { src: "/work/webkeun-templates/kawalu-coffee.webp", alt: "Kawalu Coffee illustrated hillside hero", kind: "desktop", caption: "Kawalu Coffee" },
          { src: "/work/webkeun-templates/bahtera-logistik.webp", alt: "Bahtera logistics hero designed as a red shipping container", kind: "desktop", caption: "Bahtera Lintas Nusantara" },
          { src: "/work/webkeun-templates/laras-kinanti.webp", alt: "Laras Kinanti photographer portfolio with polaroids", kind: "desktop", caption: "Laras Kinanti" },
          { src: "/work/webkeun-templates/seungit-pricing.webp", alt: "Seungit Laundry pricing cards S, M, L for boarding-house students", kind: "desktop", caption: "Seungit Laundry" },
        ],
      },
    ],
    learned:
      "A strong concept per business does more than any component library. Once \"the site is a shipping container\" is decided, half the design decisions make themselves.",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
