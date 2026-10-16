import { cacheLife } from "next/cache";

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Contributions = {
  total: number;
  last30: number;
  longestStreak: number;
  days: ContributionDay[];
  source: "api" | "profile";
};

const LOGIN = "Apiii30";

const LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type Source = { days: ContributionDay[]; total: number };

/**
 * Last year of contributions, with the same total GitHub prints on the profile.
 *
 * - With GITHUB_TOKEN (a token from this account): the GraphQL API. Private
 *   contributions are added via `restrictedContributionsCount`, so the total
 *   matches what you see while logged in.
 * - Without a token: the public profile calendar. This only includes private
 *   work once "Private contributions" is enabled in the profile's
 *   contribution settings.
 *
 * Cached for hours, so visitors never wait on GitHub.
 */
export async function getContributions(): Promise<Contributions | null> {
  "use cache";
  cacheLife("hours");

  const token = process.env.GITHUB_TOKEN;
  try {
    const data = token ? await fromApi(token) : await fromProfile();
    if (!data.days.length) return null;
    return summarise(data, token ? "api" : "profile");
  } catch {
    // A bad or expired token shouldn't blank the card: fall back to the profile.
    if (!token) return null;
    try {
      const data = await fromProfile();
      return data.days.length ? summarise(data, "profile") : null;
    } catch {
      return null;
    }
  }
}

async function fromApi(token: string): Promise<Source> {
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GitHub API error");
  const collection = json.data.user.contributionsCollection;
  const calendar = collection.contributionCalendar;
  const weeks = calendar.weeks as {
    contributionDays: { date: string; contributionCount: number; contributionLevel: string }[];
  }[];
  const days = weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVELS[d.contributionLevel] ?? 0,
    })),
  );
  return { days, total: calendar.totalContributions + (collection.restrictedContributionsCount ?? 0) };
}

async function fromProfile(): Promise<Source> {
  const res = await fetch(`https://github.com/users/${LOGIN}/contributions`, {
    headers: { Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`GitHub profile ${res.status}`);
  const html = await res.text();

  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d+)/);
    counts.set(m[1], n ? Number(n[1]) : 0);
  }

  const days: ContributionDay[] = [];
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0) as ContributionDay["level"];
    if (date) days.push({ date, level, count: (id && counts.get(id)) || 0 });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));

  // The heading ("123 contributions in the last year") is the number GitHub itself shows.
  const heading = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
  const total = heading ? Number(heading[1].replace(/,/g, "")) : days.reduce((sum, d) => sum + d.count, 0);
  return { days, total };
}

function summarise({ days, total }: Source, source: Contributions["source"]): Contributions {
  const last30 = days.slice(-30).reduce((s, d) => s + d.count, 0);
  let longestStreak = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }
  return { total, last30, longestStreak, days, source };
}
