// ─── Portfolio Data ───────────────────────────────────────────────────────────
// Organized: workExperience (chronological) then sideProjects

export const workExperience = [
    {
        
        id: "autodoc",
        type: "Demo",
        title: "AutoDoc",
        company: "Freelance",
        location: "",
        date: "Nov 2025 - Feb 2026",
        tags: ["Chrome Extension", "NestJS", "FastAPI", "Gemini AI", "Next.js", "Docker"],
        description: "Production-grade workflow documentation platform. A Chrome MV3 extension captures clicks, DOM events, and throttled screenshots — piped through a NestJS backend and FastAPI AI service to auto-generate step-by-step guides with PII redaction, PDF export, and embeddable iframes.",
        link: "https://github.com/you/autodoc",   // or live URL
    },
    {
        id: "projection-mapper",
        type: "Lab",
        title: "Projection Mapper",
        company: "Personal Experiment",
        location: "",
        date: "Oct 2025 - Jan 2026",
        tags: ["Python", "PySide6", "OpenCV", "NumPy", "Homography"],
        description: "Desktop tool for real-time projection mapping onto physical surfaces. Load images or video, drag four corner handles to warp perspective via live homography, layer multiple surfaces, and save/restore quad configurations as JSON presets.",
    },
    {
        id: "lumen",
        type: "Lab",
        title: "Lumen",
        company: "RAG Document Intelligence",
        location: "",
        date: "Mar 2026 - Present",
        tags: ["FastAPI", "React", "OpenRouter", "RAG", "Google Drive API", "Vercel", "Railway"],
        description: "Chat with your documents. Drop a PDF, paste a URL, or connect a Google Drive folder — Lumen chunks and retrieves relevant excerpts, then answers questions with inline citations. Runs on free LLMs via OpenRouter with an automatic model fallback chain (Llama → Gemma → Mistral).",
    },
    {
        id: 'exp-escarda',
        type: 'work',
        title: 'AI/ML Engineer',
        company: 'Escarda Technologies',
        location: 'Berlin, Germany',
        date: 'Jan 2023 – Sep 2024',
        tags: ['YOLOv8', 'Robotics', 'Jetson Nano', 'IoT', 'Agile', 'Docker'],
        description: 'Led algorithm development for autonomous weed detection achieving 92% accuracy, reducing chemical usage by 40%. Delivered Smart Checkpot IoT plant monitor using YOLOv8 + Raspberry Pi. Standardized Agile sprint processes and CI/CD pipelines across the engineering team.',
        highlight: '92% accuracy · 40% less chemicals'
    },
   
];

export const sideProjects = [
    
];

export const allEntries = [...workExperience, ...sideProjects];

