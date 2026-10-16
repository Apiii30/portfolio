export const site = {
  name: "Hafidz Asmar Meisanda",
  shortName: "Hafidz Asmar Meisanda",
  role: "Full-stack developer",
  location: "Bandung, Indonesia",
  coords: "6.9175° S, 107.6191° E",
  timeZone: "Asia/Jakarta",
  status: "Open to internships & freelance",
  email: "asmarhafidz81@gmail.com",
  whatsapp: "https://wa.me/6283125043525",
  github: "https://github.com/Apiii30",
  linkedin: "https://www.linkedin.com/in/hafidz-asmar-meisanda/",
  webkeun: "https://webkeun.id",
  cv: "/files/Hafidz-Asmar-CV.pdf",
  description:
    "Full-stack developer and founder of Webkeun.id, based in Bandung. I build web apps with React, Next.js, Express and PostgreSQL — from the database schema to the deploy.",
} as const;

export const nav = [
  { id: "work", label: "Work", href: "/#work" },
  { id: "about", label: "About", href: "/#about" },
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "certificates", label: "Certificates", href: "/#certificates", wideOnly: true },
  { id: "skills", label: "Skills", href: "/#skills", wideOnly: true },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;
