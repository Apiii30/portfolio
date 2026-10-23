export type Certificate = {
  title: string;
  issuer: string;
  issued: string;
  image: string;
  file: string;
  verifyUrl?: string;
  note?: string;
  kind: string;
  blurb: string;
  facts: readonly { label: string; value: string }[];
};

export type Experience = {
  role: string;
  org: string;
  period: string;
  type: string;
  points: readonly string[];
  stack?: readonly string[];
  certificate?: Certificate;
};

export const certificates = {
  oygInternship: {
    title: "Certificate of Appreciation — Internship Program",
    issuer: "Ocean Young Guards",
    issued: "Aug 2026",
    image: "/certificates/oyg-internship.jpg",
    file: "/certificates/oyg-internship.pdf",
    note: "No. 03/CA/OYG/VIII/26",
    kind: "Internship",
    blurb:
      "Awarded for completing the Ocean Young Guards internship program, signed by the organisation's CEO and founder.",
    facts: [
      { label: "Issued", value: "August 2026" },
      { label: "Number", value: "03/CA/OYG/VIII/26" },
      { label: "Role", value: "Full-stack developer intern" },
    ],
  },
  dicodingPython: {
    title: "Memulai Pemrograman dengan Python",
    issuer: "Dicoding Indonesia",
    issued: "Oct 2026",
    image: "/certificates/dicoding-python.jpg",
    file: "/certificates/dicoding-python.pdf",
    verifyUrl: "https://www.dicoding.com/certificates/98XW82300PM3",
    kind: "Course",
    blurb:
      "Python fundamentals to industry standard: data, control flow, OOP, PEP 8, unit testing and popular libraries, closed with a final exam.",
    facts: [
      { label: "Issued", value: "3 October 2026" },
      { label: "Valid until", value: "3 October 2029" },
      { label: "Study time", value: "60 hours" },
      { label: "ID", value: "98XW82300PM3" },
    ],
  },
} satisfies Record<string, Certificate>;

export const experience: readonly Experience[] = [
  {
    role: "Founder & Full-stack Developer",
    org: "Webkeun.id",
    period: "Oct 2026 — Now",
    type: "Own business · Bandung",
    points: [
      "Founded a web development service for digital wedding invitations, small-business sites, company profiles and personal portfolios.",
      "Launched a digital invitation product with 11 themes and 3 pricing packages; manage client consultation, development, domain setup, hosting and launch.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Vercel"],
  },
  {
    role: "Full-stack Developer Intern",
    org: "Ocean Young Guards",
    period: "Jan — Jul 2026",
    type: "Internship · Marine conservation NGO",
    points: [
      "Developed a React and Tailwind CSS website and admin dashboard for events, volunteers, coupons and payment verification; the platform is awaiting launch.",
      "Built an Express.js REST API with Sequelize and PostgreSQL for enrollment, JWT authentication, document uploads, payment review, search and pagination.",
      "Tested endpoints in Postman and collaborated with the team through Git branches.",
    ],
    stack: ["React", "Vite", "Tailwind CSS", "Express", "Sequelize", "PostgreSQL", "JWT"],
    certificate: certificates.oygInternship,
  },
  {
    role: "Head of Communication & Information (KOMINFO)",
    org: "HIMAMI — Informatics Management Student Association",
    period: "2024 — Now",
    type: "Organisation",
    points: ["Lead Instagram content design and activity updates; built and maintain the association's website."],
  },
];

export const education = {
  school: "Politeknik Praktisi Bandung",
  degree: "D3 Informatics Management",
  period: "Sep 2024 — 2027 (expected)",
} as const;
