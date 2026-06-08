export type Composition =
  | 'hero'
  | 'bilateral'
  | 'reading-room'
  | 'offset-title'
  | 'metric-lead'
  | 'about'
  | 'cta';

export type PanelBg = 'cream' | 'black' | 'navy';

export interface Stat   { value: string; label: string }
export interface Link   { label: string; href: string }

export interface Chapter {
  id:          string;
  number:      string;   // '01'
  name:        string;   // used in spine + topbar
  composition: Composition;
  bg:          PanelBg;
  label?:      string;   // small mono label  e.g. '02 · RAG · 2026'
  title:       string;
  role:        string;
  tagline?:    string;
  tech?:       string;
  body?:       string;
  metric?:     string;   // for metric-lead
  stats?:      Stat[];
  links?:      Link[];
  demo?:       boolean;  // show demo zone
  video?:      string;  // path to video in public/ e.g. '/lumen-demo.webm'
  experience?: { role: string; company: string; period: string; location: string };
  education?:  { degree: string; school: string; years: string }[];
}

export const chapters: Chapter[] = [
  {
    id:          'hero',
    number:      '',
    name:        ' ',
    composition: 'hero',
    bg:          'cream',
    title:       'Hey, I am\nNidhi.\n',
    role:        'AI Solutions & Robotics Enthusiast',
    tagline:     'I build AI that hallucinates less than the AI that wrote this line',
    body:        'Ideas are easy. Making them work - efficiently, at scale, without surprises in production - is the real puzzle. And puzzles are kind of my thing. You handle the vision, I will handle the execution. \nopen_to_work = True and the inbox is listening on port 24/7.',
    links: [
      { label: 'GitHub',   href: 'https://github.com/nidhicj' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/connect-nidhichijoshi/' },
      { label: 'Resume',   href: '/resume.pdf' },
      { label: 'Email',    href: 'mailto:joshichi.nidhi@gmail.com' },
    ],
  },
  {
    id:          'lumen',
    number:      '',
    name:        'Lumen',
    composition: 'bilateral',
    bg:          'black',
    label:       'RAG · Full-Stack · 2026',
    title:       'Lumen',
    role:        '',
    tech:        'FastAPI · React · OpenRouter · Google Drive API · TF-IDF',
    body:        'RAG pipeline built from scratch — no LangChain, no LlamaIndex. Drop a PDF, paste a URL, or connect a Google Drive folder. Get cited answers with inline [1][2] source markers. Four free LLMs with automatic fallback if one fails.',
    demo:        true,
    video:       '/lumen-demo.webm',
    links: [
      { label: 'Live Demo →', href: 'https://lumen-frontend-topaz.vercel.app/' },
    ],
  },
  {
    id:          'autodoc',
    number:      '',
    name:        'AutoDoc',
    composition: 'bilateral',
    bg:          'black',
    label:       'Agent · 2025',
    title:       'AutoDoc',
    role:        '',
    tech:        'Chrome MV3 · NestJS · Gemini AI · Docker',
    body:        'Chrome extension that watches you work and writes docs. Reads your active tab, infers context, drafts structured documentation — automatically.',
    demo:        true,
  },
  {
    id:          'projection-mapper',
    number:      '',
    name:        'Mapper',
    composition: 'bilateral',
    bg:          'navy',
    label:       'Vision · 2025',
    title:       'Projection\nMapper',
    role:        '',
    tech:        'Python · OpenCV · PySide6 · NumPy',
    body:        'Desktop tool for real-time projection mapping. Warp video feeds, define polygonal surfaces, keystone-correct geometry. Built for live performance and installation art.',
    demo:        true,
  },
  {
    id:          'weed-detection',
    number:      '',
    name:        'Weed',
    composition: 'bilateral',
    bg:          'navy',
    label:       'Vision · Work · 2023–24',
    title:       'Weed\nDetection',
    role:        '',
    tech:        'YOLOv8 · Jetson Nano · Escarda Technologies · Berlin',
    body:        '92% detection accuracy on a field robot. 40% reduction in herbicide use. Deployed in Brandenburg, Germany.',
    metric:      '%',
    stats: [
      { value: '92%', label: 'accuracy' },
      { value: '40%', label: 'less chemicals' },
    ],
    demo:        true,
  },
  {
    id:          'about',
    number:      '',
    name:        'About',
    composition: 'about',
    bg:          'cream',
    label:       'About',
    title:       'Building AI\nthat ships.',
    role:        '',
    body:        'AI/ML engineer bridging research and production. Freelancing and building in public — from RAG pipelines and Chrome extension agents to projection mapping tools.',
    experience:  {
      role:     'AI/ML Engineer',
      company:  'Escarda Technologies',
      period:   'Jan 2023 – Sep 2024',
      location: 'Berlin',
    },
    education: [
      { degree: 'MSc Information Technology', school: 'University of Stuttgart', years: '2019–2022' },
      { degree: 'BE Electrical Engineering',  school: 'MSRIT Bengaluru',         years: '2013–2017' },
    ],
  },
  {
    id:          'cta',
    number:      '',
    name:        'CTA',
    composition: 'cta',
    bg:          'navy',
    label:       'Let\'s work',
    title:       'Let\'s build\nsomething\nthat ships.',
    role:        '',
    links: [
      { label: 'GitHub',   href: 'https://github.com/' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/' },
      { label: 'Resume',   href: '/resume.pdf' },
      { label: 'Email',    href: 'mailto:shriramsomeshwar@gmail.com' },
    ],
  },
];
