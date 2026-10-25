import {
  siAndroidstudio,
  siBootstrap,
  siCss,
  siEjs,
  siExpress,
  siFigma,
  siFirebase,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siKotlin,
  siLaravel,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siNpm,
  siPhp,
  siPostgresql,
  siPostman,
  siPrisma,
  siPython,
  siReact,
  siSequelize,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
  type SimpleIcon,
} from "simple-icons";

export type Skill = { name: string; icon?: SimpleIcon };

/** The technologies used most in the main projects, by layer. */
export const coreStack: readonly { layer: string; skills: readonly Skill[] }[] = [
  {
    layer: "Frontend",
    skills: [
      { name: "React", icon: siReact },
      { name: "Next.js", icon: siNextdotjs },
      { name: "TypeScript", icon: siTypescript },
      { name: "Tailwind CSS", icon: siTailwindcss },
    ],
  },
  {
    layer: "Backend",
    skills: [
      { name: "Node.js", icon: siNodedotjs },
      { name: "Express", icon: siExpress },
    ],
  },
  {
    layer: "Data",
    skills: [
      { name: "PostgreSQL", icon: siPostgresql },
      { name: "MySQL", icon: siMysql },
      { name: "Supabase", icon: siSupabase },
    ],
  },
];

/** The base everything sits on, plus the supporting tools that have actually been used. */
export const foundations: readonly { title: string; skills: readonly Skill[] }[] = [
  {
    title: "Web foundations",
    skills: [
      { name: "JavaScript", icon: siJavascript },
      { name: "HTML", icon: siHtml5 },
      { name: "CSS", icon: siCss },
      { name: "Responsive design" },
    ],
  },
  {
    title: "UI tools & templating",
    skills: [
      { name: "Vite", icon: siVite },
      { name: "Motion" },
      { name: "Bootstrap", icon: siBootstrap },
      { name: "EJS", icon: siEjs },
    ],
  },
  {
    title: "Backend & data",
    skills: [
      { name: "REST API design & development" },
      { name: "Backend architecture" },
      { name: "JWT authentication", icon: siJsonwebtokens },
      { name: "Row-Level Security (RLS)" },
      { name: "Sequelize", icon: siSequelize },
      { name: "Prisma", icon: siPrisma },
      { name: "Python", icon: siPython },
      { name: "PHP", icon: siPhp },
      { name: "Laravel", icon: siLaravel },
      { name: "MongoDB", icon: siMongodb },
      { name: "Firebase", icon: siFirebase },
    ],
  },
  {
    title: "Development tools",
    skills: [
      { name: "Git", icon: siGit },
      { name: "GitHub", icon: siGithub },
      { name: "Postman", icon: siPostman },
      { name: "npm", icon: siNpm },
      { name: "Vercel", icon: siVercel },
    ],
  },
  {
    title: "Design & office",
    skills: [
      { name: "Figma", icon: siFigma },
      { name: "Canva" },
      { name: "Microsoft Word" },
      { name: "Excel" },
      { name: "PowerPoint" },
    ],
  },
];

/** Ongoing learning, kept apart from what is already applied in projects. */
export const learning: readonly { title: string; skills: readonly Skill[] }[] = [
  {
    title: "Android",
    skills: [
      { name: "Kotlin", icon: siKotlin },
      { name: "Android Studio", icon: siAndroidstudio },
    ],
  },
];
