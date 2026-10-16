import {
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
  siLaravel,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siNpm,
  siPhp,
  siPostgresql,
  siPostman,
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

export type SkillGroup = {
  id: string;
  title: string;
  blurb: string;
  span: string;
  skills: readonly Skill[];
};

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "frontend",
    title: "Front-end",
    blurb: "Interfaces, layout and motion.",
    span: "lg:col-span-7",
    skills: [
      { name: "React", icon: siReact },
      { name: "Next.js", icon: siNextdotjs },
      { name: "TypeScript", icon: siTypescript },
      { name: "JavaScript", icon: siJavascript },
      { name: "Tailwind CSS", icon: siTailwindcss },
      { name: "Vite", icon: siVite },
      { name: "HTML5", icon: siHtml5 },
      { name: "CSS", icon: siCss },
      { name: "Motion" },
      { name: "Bootstrap", icon: siBootstrap },
      { name: "EJS", icon: siEjs },
      { name: "Responsive design" },
    ],
  },
  {
    id: "backend",
    title: "Back-end",
    blurb: "APIs, auth and server logic.",
    span: "lg:col-span-5",
    skills: [
      { name: "Node.js", icon: siNodedotjs },
      { name: "Express", icon: siExpress },
      { name: "REST APIs" },
      { name: "JWT auth", icon: siJsonwebtokens },
      { name: "PHP", icon: siPhp },
      { name: "Laravel", icon: siLaravel },
      { name: "MVC" },
    ],
  },
  {
    id: "data",
    title: "Databases",
    blurb: "Schemas, queries and access rules.",
    span: "lg:col-span-5",
    skills: [
      { name: "PostgreSQL", icon: siPostgresql },
      { name: "Supabase", icon: siSupabase },
      { name: "MySQL", icon: siMysql },
      { name: "MongoDB", icon: siMongodb },
      { name: "Firebase", icon: siFirebase },
      { name: "Sequelize", icon: siSequelize },
    ],
  },
  {
    id: "tools",
    title: "Tools & design",
    blurb: "Shipping, testing and the design side.",
    span: "lg:col-span-7",
    skills: [
      { name: "Git", icon: siGit },
      { name: "GitHub", icon: siGithub },
      { name: "Postman", icon: siPostman },
      { name: "npm", icon: siNpm },
      { name: "Vercel", icon: siVercel },
      { name: "VS Code" },
      { name: "Figma", icon: siFigma },
      { name: "Canva" },
    ],
  },
];

export const learning: Skill[] = [{ name: "Python", icon: siPython }, { name: "Backend architecture" }, { name: "API design" }];

export const skillCount = skillGroups.reduce((n, g) => n + g.skills.length, 0);
