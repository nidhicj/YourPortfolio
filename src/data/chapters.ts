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
  // number:      string;   // '01'
  name:        string;   // used in spine + topbar
  composition: Composition;
  bg:          PanelBg;
  label?:      string;   // small mono label  e.g. '02 · RAG · 2026'
  title:       string;
  tagline?:    string;
  tech?:       string;
  body?:       string;
  metric?:     string;   // for metric-lead
  stats?:      Stat[];
  links?:      Link[];
  demo?:       boolean;  // show demo zone
  experience?: { role: string; company: string; period: string; location: string };
  education?:  { degree: string; school: string; years: string }[];
}

export const chapters: Chapter[] = [
  {
    id:          'hero',
    // number:      '01',
    name:        ' ',
    composition: 'hero',
    bg:          'cream',
    title:       'Research\nEngineered\nShipped.',
    tagline:     '"I don\'t ship AI\nwithout guardrails."',
    body:        'Bridges research and production — robust, explainable, end-to-end. Currently freelancing, open to work.',
    links: [
      { label: 'GitHub',   href: 'https://github.com/' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/' },
      { label: 'Resume',   href: '/resume.pdf' },
      { label: 'Email',    href: 'mailto:shriramsomeshwar@gmail.com' },
    ],
  },
  {
    id:          'lumen',
    // number:      '02',
    name:        'Lumen',
    composition: 'bilateral',
    bg:          'black',
    label:       'RAG · 2026',
    title:       'Lumen',
    tech:        'FastAPI · OpenRouter · Google Drive · pgvector',
    body:        'Drop a PDF. Ask anything. Get cited answers. A research assistant that reads your documents so you don\'t have to start from scratch.',
    demo:        true,
  },
  {
    id:          'autodoc',
    // number:      '03',
    name:        'AutoDoc',
    composition: 'reading-room',
    bg:          'black',
    label:       'Agent · 2025',
    title:       'AutoDoc',
    tech:        'Chrome MV3 · NestJS · Gemini AI · Docker',
    body:        'Chrome extension that watches you work and writes docs. Reads your active tab, infers context, drafts structured documentation — automatically.',
    demo:        true,
  },
  {
    id:          'projection-mapper',
    // number:      '04',
    name:        'Mapper',
    composition: 'offset-title',
    bg:          'navy',
    label:       'Vision · 2025',
    title:       'Projection\nMapper',
    tech:        'Python · OpenCV · PySide6 · NumPy',
    body:        'Desktop tool for real-time projection mapping. Warp video feeds, define polygonal surfaces, keystone-correct geometry. Built for live performance and installation art.',
    demo:        true,
  },
  {
    id:          'weed-detection',
    // number:      '05',
    name:        'Weed',
    composition: 'metric-lead',
    bg:          'navy',
    label:       'Vision · Work · 2023–24',
    title:       'Weed\nDetection',
    tech:        'YOLOv8 · Jetson Nano · Escarda Technologies · Berlin',
    body:        '92% detection accuracy on a field robot. 40% reduction in herbicide use. Deployed in Brandenburg, Germany.',
    metric:      '92%',
    stats: [
      { value: '92%', label: 'accuracy' },
      { value: '40%', label: 'less chemicals' },
    ],
    demo:        true,
  },
  {
    id:          'about',
    // number:      '06',
    name:        'About',
    composition: 'about',
    bg:          'cream',
    label:       'About',
    title:       'Building AI\nthat ships.',
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
    // number:      '07',
    name:        'CTA',
    composition: 'cta',
    bg:          'navy',
    label:       'Let\'s work',
    title:       'Let\'s build\nsomething\nthat ships.',
    links: [
      { label: 'GitHub',   href: 'https://github.com/' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/' },
      { label: 'Resume',   href: '/resume.pdf' },
      { label: 'Email',    href: 'mailto:shriramsomeshwar@gmail.com' },
    ],
  },
];
