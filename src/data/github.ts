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
  'go-micro-example': 'Go microservices: broker, auth, logger, mail and listener services.',
  'go-training': 'More than 130 small Go programs, from basics to concurrency patterns.',
  'python-training': 'Python from first principles to asyncio, threads and locks.',
  'algorigthm-data-structure': 'Algorithms and data structures, written in Go.',
  'flight-search-app': 'A flight search UI in TypeScript.',
  'STM8': 'Firmware drivers for the STM8S105K4 microcontroller.',
  'tiktok-desktop': 'A desktop client for TikTok.',
  'html-components-drag-and-drop': 'Drag and drop with plain HTML components and TypeScript.',
  'go-custom-pkg': 'A minimal custom Go package.',
  'TCPVoiceController': 'Voice control over TCP, from my embedded years.',
};

const hidden = new Set(['uniclient', 'stations-graphql', 'Turbo-Next-Boilerplate', 'amir04lm26.github.io']);

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
