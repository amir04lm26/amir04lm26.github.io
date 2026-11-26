import fallback from './github-fallback.json';

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushed: string;
};

// Descriptions for repos that have none on GitHub.
const notes: Record<string, string> = {
  'flight-search-app': 'Flight search in Next.js with server components, Drizzle and PostgreSQL, Redis, NextAuth, Jest and Cypress.',
  'go-micro-example': 'Go microservices: broker, authentication, logger, mail and listener services.',
  'go-training': 'More than 130 small Go programs, from basics to concurrency patterns.',
  'python-training': 'Python from first principles to asyncio, threads and locks.',
};

const hidden = new Set(['uniclient', 'stations-graphql', 'Turbo-Next-Boilerplate', 'go-custom-pkg', 'TCPVoiceController', 'amir04lm26.github.io']);

export async function getRepos(user: string): Promise<Repo[]> {
  let raw: any[] = fallback as any[];
  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'static-site-build' },
    });
    if (res.ok) raw = await res.json();
  } catch {
    // Offline build: use the committed snapshot.
  }
  return raw
    .filter((r) => !r.fork && !hidden.has(r.name))
    .map((r) => ({
      name: r.name,
      description: r.description && r.description.length > 12 ? r.description : notes[r.name] ?? r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      pushed: r.pushed_at,
    }))
    .sort((a, b) => b.pushed.localeCompare(a.pushed))
    .slice(0, 9);
}
