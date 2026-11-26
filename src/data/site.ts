export const profile = {
  name: 'Amir Zare',
  role: 'Staff-level Full-Stack Engineer',
  tagline: 'I ship the product, and I build the agents that help the team ship it.',
  location: 'Tehran, Iran',
  locationNote: 'Working remotely with a Vancouver team · open to remote or relocation',
  timezone: 'Asia/Tehran',
  email: 'z.amir04lm26@gmail.com',
  phone: '+98 939 867 1414',
  phoneHref: '+989398671414',
  linkedin: 'https://www.linkedin.com/in/amir04lm26',
  github: 'https://github.com/amir04lm26',
  githubUser: 'amir04lm26',
  resume: '/amir-zare-resume.pdf',
  rotating: ['frontend architecture', 'design systems', 'Django backends', 'CI and delivery speed', 'agent tooling', 'observability'],
};

export const stats = [
  { value: 8, suffix: '+', label: 'years building web platforms' },
  { value: 32, suffix: '×', label: 'request capacity after an SSR rebuild' },
  { value: 20, suffix: 'K', label: 'requests per second, load-tested' },
  { value: 53, suffix: '%', label: 'faster frontend on critical pages' },
  { value: 8, suffix: '', label: 'engineers led and mentored' },
];

export const about = [
  'I am a full-stack engineer with a frontend core. I work in React, Next.js and TypeScript on the front, and in Python, Django and Kubernetes on the back.',
  'At OVOU I split my time between product features, platform health and the tooling that keeps a small team fast. Before that I led the eight-engineer frontend chapter at SnappShop, a high-traffic e-commerce marketplace.',
  'The newest part of my work is agent tooling. I write the skills and the automation that let coding agents analyse, plan, review and verify real tickets, with a human in control of every hand-off.',
];

export const strengths = [
  'Frontend architecture: SSR, hydration, Core Web Vitals',
  'Cross-stack performance work with RUM, APM and real user data',
  'CI/CD pipelines and the inner developer loop',
  'Evidence-based code review and mentoring',
  'Pragmatic AI and MCP tooling in the engineering workflow',
];

export const pipeline = ['Analyse', 'Plan', 'Implement', 'Review', 'Verify'];

export type Job = {
  company: string;
  title: string;
  period: string;
  place: string;
  summary: string;
  points: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    company: 'OVOU',
    title: 'Senior Full-Stack Engineer',
    period: '2025 — Now',
    place: 'Vancouver, Canada · Remote',
    summary: 'Product, platform and agent tooling on a Next.js and Django platform for digital business cards.',
    points: [
      'Architected the overhaul of the company design system into a tokenized library for two UI frameworks (Chakra UI and MUI v7), used by the web app and the admin app.',
      'Delivered Profile Templates end to end: frontend, admin panel and backend, with subscription-tier gating and role-based permissions.',
      'Built self-serve billing in the app: plan changes, cancellation with a reason, and emails for each billing state.',
      'Cut incident frequency by 30% with Datadog APM monitors, expiry checks for certificates and service tokens, and Slack alerting.',
      'Shipped magic-link sign-in and demo-link onboarding, which lifted conversion by 7%.',
      'Wrote the team’s Claude Code skills for task analysis, planning, code review and verification.',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Django', 'PostgreSQL', 'Celery', 'Kubernetes', 'Datadog', 'Claude Code'],
  },
  {
    company: 'SnappShop',
    title: 'Frontend Chapter Lead · Senior Frontend Engineer',
    period: '2021 — 2025',
    place: 'Tehran, Iran',
    summary: 'Led the frontend chapter of a high-traffic e-commerce marketplace.',
    points: [
      'Led and mentored 8 engineers through architecture redesigns, hiring and a code-review culture.',
      'Redesigned how the storefront is served: a static app from the CDN for people and server-rendered pages for crawlers, split at the gateway. Result: 25% faster rendering and 32× the sustained request capacity.',
      'Owned the frontend infrastructure end to end: GitLab CI pipelines, Docker images, Helm releases on Kubernetes, and Nginx with Brotli, caching, keep-alive tuning and rate limits.',
      'Proved the platform at 20K requests per second with a Locust suite for search, sign-in, cart, payment and delivery flows.',
      'Started the shared design system and the shared tools library that every storefront app installs: about 290 and 95 releases between 2022 and 2025.',
      'Improved frontend performance by 53% on critical pages, and moved the build from Babel to esbuild for builds more than 2× faster.',
      'Integrated the shop into partner super-apps (Snapp, Irancell) and shipped a single-sign-on prize-wheel campaign.',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Nginx', 'Kubernetes', 'Helm', 'GitLab CI', 'Locust', 'Sentry'],
  },
  {
    company: 'FANAP',
    title: 'Senior Frontend Engineer',
    period: '2020 — 2021',
    place: 'Tehran, Iran · Remote',
    summary: 'Modernized the main customer-facing platform.',
    points: [
      'Rebuilt the platform on Next.js and took its Lighthouse performance score from under 10 into the 90s.',
      'Built a real-time theming system for per-customer UI customization.',
      'Led frontend code review and cut the reported bug count by 17%.',
    ],
    stack: ['Next.js', 'React', 'Sass'],
  },
  {
    company: 'Nobitex',
    title: 'Frontend Engineer',
    period: '2019 — 2020',
    place: 'Tehran, Iran',
    summary: 'Frontend for one of Iran’s largest cryptocurrency exchanges.',
    points: [
      'Moved the public site to a static-first Nuxt.js architecture: 48% faster pages and a 41% better search ranking.',
      'Redesigned sign-in and dashboard flows and resolved 82% of the open frontend issues.',
    ],
    stack: ['Nuxt.js', 'Vue', 'Sass'],
  },
  {
    company: 'Luxin Tech',
    title: 'Full-Stack & Embedded Engineer',
    period: '2018 — 2019',
    place: 'Tehran, Iran',
    summary: 'Smart-home IoT: hardware and the web control layer.',
    points: [
      'Designed a smart-home system that joins Raspberry Pi controllers to a web management UI.',
      'Built custom embedded modules that contributed to a 22% increase in sales.',
    ],
    stack: ['C', 'Python', 'Raspberry Pi', 'JavaScript'],
  },
];

export type Work = { tag: string; title: string; body: string; metric?: string; metricLabel?: string; chips: string[] };

export const work: Work[] = [
  {
    tag: 'Agent tooling',
    title: 'An autopilot for review and verification',
    body: 'When a ticket lands in review or verification, a watcher finds its last agent session, takes a free worktree and runs the right skill unattended. A local dashboard shows every run, its report and the decisions that still need a human.',
    metric: '5',
    metricLabel: 'stages from analysis to verification',
    chips: ['Claude Code', 'Python', 'tmux', 'launchd'],
  },
  {
    tag: 'Design system',
    title: 'One token source, two UI frameworks',
    body: 'A multi-phase rebuild of the company design system: design tokens as the single source of truth, themes for Chakra UI and MUI v7, Storybook with interaction tests, and CJS and ESM builds for every consuming app.',
    metric: '2',
    metricLabel: 'frameworks from one token set',
    chips: ['React', 'Chakra UI', 'MUI v7', 'Storybook', 'Rollup'],
  },
  {
    tag: 'Scale',
    title: 'A storefront that holds 20K requests per second',
    body: 'People get a static app from the CDN. Crawlers get server-rendered pages. The gateway splits the two by user agent, with Brotli, caching, keep-alive tuning and rate limits in front. Locust scenarios for search, cart, payment and delivery set the target and proved the result.',
    metric: '32×',
    metricLabel: 'sustained request capacity',
    chips: ['Next.js', 'Nginx', 'Kubernetes', 'Helm', 'Locust'],
  },
  {
    tag: 'Product',
    title: 'Billing that customers manage themselves',
    body: 'Plan and billing pages inside the app, plan changes, a cancel flow that records the reason, emails for each billing state, and payment webhooks that stay correct under retries and races.',
    chips: ['Next.js', 'Django', 'Stripe', 'Celery'],
  },
  {
    tag: 'Delivery speed',
    title: 'Faster pipelines, lighter dev machines',
    body: 'One verify command for the whole monorepo, parallel pre-push checks, timeouts on every CI job, cached image builds and unit tests without per-file isolation. Dev-server memory for the main app dropped from 7.8 GB to 3.3 GB.',
    metric: '−58%',
    metricLabel: 'dev-server memory',
    chips: ['GitHub Actions', 'Turborepo', 'Vitest', 'Docker'],
  },
  {
    tag: 'Reliability',
    title: 'Monitoring that finds the cause',
    body: 'APM monitors, expiry audits for certificates and tokens, and alert routing that pages only for customer-facing failures. Several alerts led to root causes in data growth and slow scheduled jobs, which are now fixed.',
    metric: '−30%',
    metricLabel: 'incident frequency',
    chips: ['Datadog', 'PostgreSQL', 'Celery', 'Terraform'],
  },
  {
    tag: 'API quality',
    title: 'Contracts the compiler enforces',
    body: 'Backend serializers own every response shape. The OpenAPI spec is generated from code, a gate blocks breaking changes before push, and the frontends consume generated TypeScript types.',
    chips: ['Django REST', 'OpenAPI', 'TypeScript'],
  },
  {
    tag: 'Security',
    title: 'Hardening as routine work',
    body: 'Security treated as part of delivery: regular hardening of the platform, patched base images, and a weekly agent run that triages dependency findings, checks whether each one is reachable and prepares the tickets.',
    chips: ['Django', 'Datadog SCA', 'Docker', 'Claude Code'],
  },
  {
    tag: 'Experiment',
    title: 'A voice assistant for macOS',
    body: 'A Siri-like assistant on top of Claude Code: a hotkey opens an orb, speech goes in, work gets done, a short answer comes back. It has spoken approvals, a countdown before anything is sent, and local memory.',
    chips: ['Swift', 'Bun', 'TypeScript', 'Claude Code'],
  },
  {
    tag: 'Shared platform',
    title: 'One component library for every storefront app',
    body: 'A design system and a tools library published as versioned packages: inputs, date pickers, maps, carousels and an icon set on one side, and hooks, validation and date utilities on the other. Each app installs them, so a fix ships once.',
    metric: '290',
    metricLabel: 'design-system releases in under three years',
    chips: ['React', 'TypeScript', 'Storybook', 'semantic-release'],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'React Native', 'Expo', 'Chakra UI', 'MUI', 'Storybook', 'Vite'] },
  { group: 'Backend', items: ['Python', 'Django', 'Node.js', 'Go', 'Celery', 'REST', 'GraphQL'] },
  { group: 'Data & infra', items: ['PostgreSQL', 'Redis', 'Kubernetes', 'Docker', 'Nginx', 'Terraform'] },
  { group: 'Delivery', items: ['GitHub Actions', 'GitLab CI', 'Vitest', 'Playwright', 'Locust', 'Datadog', 'Sentry'] },
  { group: 'AI tooling', items: ['Claude Code', 'MCP servers', 'Agent skills', 'Cursor'] },
  { group: 'Leadership', items: ['Mentoring', 'Hiring', 'Architecture reviews', 'Technical strategy'] },
];

export const marquee = ['React', 'Next.js', 'TypeScript', 'Python', 'Django', 'PostgreSQL', 'Kubernetes', 'Datadog', 'Storybook', 'Claude Code', 'MCP', 'Go', 'Redis', 'Celery', 'React Native'];

export const recommendations = [
  {
    quote: 'Amir seamlessly blended his technical expertise with strong management skills, taking on the role of chapter lead within our team for over two years.',
    name: 'Aboozar Ghaffari',
    title: 'CTO at SnappShop',
    relation: 'Managed Amir directly',
  },
  {
    quote: 'Amir is a problem solver first and foremost and no topic is too complex for him.',
    name: 'Mohammad Saad Shahzad',
    title: 'VP of Product',
    relation: 'Worked with Amir on the same team',
  },
  {
    quote: 'As the Front-end Chapter lead, Amir has demonstrated excellent leadership skills and has consistently motivated his team to deliver their best work.',
    name: 'AmirMahdi Digbari',
    title: 'Software Engineer',
    relation: 'Worked with Amir on the same team',
  },
];
