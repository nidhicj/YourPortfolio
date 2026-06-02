# Portfolio Content
# Single source of truth for all copy on the site.
# Claude Code reads this before writing any UI. Update here first — code follows.
# Reference site for visual direction: https://fintora-temlis.webflow.io/

---

## Identity

```
name:        Nidhi Joshi
short_name:  Nidhi
title:       AI/ML Engineer
tagline:     I don't ship AI without guardrails
location:    Duluth, GA
email:       joshichi.nidhi@gmail.com
github:      github.com/nidhicj
linkedin:    linkedin.com/in/connect-nidhichijoshi
hero_image:  /images/pic_op2.png
```

---

## Hero Section

headline_line1: "Research"
headline_line2: "Engineered"
headline_line3: "Shipped"

# Renders doubled: "Research Research / Engineered Engineered / Shipped Shipped"
# Story arc in 3 words — captures exactly how Nidhi works.
# "Engineered" gets --color-accent (teal) applied — the pivot word between idea and output.
#
# Alternatives if you want to revisit:
#   "Build / Deploy / Repeat"     — action loop, punchy
#   "AI / With / Guardrails"      — ties to tagline directly
#   "Robust / Real / Shipped"     — adjectives, more editorial

hero_description: >
  I'm an AI/ML engineer who bridges research and production —
  building systems that are robust, explainable, and ready to ship.
  Always looking for what needs automating, so colleagues aren't
  bogged down by repetitive manual work. AI is my tool for turning
  cognitive tasks into scalable systems.

cta_primary:   "See my work"
cta_secondary: "Talk to my AI"

---

## Navigation

nav_links:
  - label: "Agents"     anchor: "#agents"
  - label: "LLMs"       anchor: "#llms"
  - label: "Vision"     anchor: "#vision"
  - label: "Creative"   anchor: "#creative"
  - label: "About"      anchor: "#about"

# Nav also includes: dark/light theme toggle (icon button, top right)

---

## The 4 Niche Sections
# These are NOT cards. They are full expandable portfolio sections.
# Each section header is collapsed by default — clicking expands it.
# Expanded state reveals a horizontal scroll track of project panels.
# See DESIGN_SYSTEM.md for exact scroll and animation behavior per section.

# ── Section 1: AI Agents ──────────────────────────────────────────────────────

section_1:
  id: "agents"
  label: "01"
  title: "AI Agents"
  tagline: "Systems that plan, act, and adapt without hand-holding."
  accent_word: "Agents"
  color_highlight: "--color-accent"

  projects:

    - id: autodoc
      type: Demo
      title: "AutoDoc"
      year: "2025"
      tags: ["Chrome Extension", "NestJS", "FastAPI", "Gemini AI", "Next.js", "Docker"]
      short_description: "A Chrome extension that watches you work and writes the documentation for you."
      long_description: >
        Production-grade workflow documentation platform. A Chrome MV3 extension
        captures clicks, DOM events, and throttled screenshots — piped through a
        NestJS backend and FastAPI AI service to auto-generate step-by-step guides
        with PII redaction, PDF export, and embeddable iframes.
      tech_stack: ["Chrome MV3", "NestJS", "FastAPI", "Gemini AI", "Next.js", "Docker"]
      link_github: "https://github.com/you/autodoc"
      link_live: ""
      image: "/images/projects/autodoc.jpg"
      featured: true
      coming_soon: false

    - id: lumen
      type: Lab
      title: "Lumen"
      year: "2026"
      tags: ["FastAPI", "React", "RAG", "OpenRouter", "Google Drive API"]
      short_description: "Drop a PDF, paste a URL, or connect Google Drive — then just ask questions."
      long_description: >
        RAG document intelligence platform. Chunks and retrieves relevant excerpts
        from any source, then answers with inline citations. Runs on free LLMs via
        OpenRouter with automatic model fallback — Llama → Gemma → Mistral.
      tech_stack: ["FastAPI", "React", "OpenRouter", "RAG", "Google Drive API"]
      link_github: ""
      link_live: ""
      image: "/images/projects/lumen.jpg"
      featured: true
      coming_soon: false

# ── Section 2: Fine-Tuned LLMs ───────────────────────────────────────────────

section_2:
  id: "llms"
  label: "02"
  title: "Fine-Tuned LLMs"
  tagline: "Models trained to think differently about specific things."
  accent_word: "Models"
  color_highlight: "--color-accent-light"

  projects:

    - id: llm-placeholder-1
      type: Lab
      title: "Domain-Specific Fine-Tune"
      year: "2025"
      tags: ["LoRA", "HuggingFace", "Python"]
      short_description: "A language model trained on a narrow domain to outperform general models."
      long_description: >
        Placeholder — coming soon. Will cover dataset construction,
        fine-tuning approach, and evaluation results against the base model.
      tech_stack: ["Python", "HuggingFace", "LoRA"]
      image: "/images/projects/placeholder.jpg"
      featured: true
      coming_soon: true

    - id: llm-placeholder-2
      type: Lab
      title: "Persona-Trained Model"
      year: "2026"
      tags: ["RLHF", "Transformers", "FastAPI"]
      short_description: "An LLM fine-tuned to adopt a specific voice, tone, and knowledge base."
      long_description: >
        Placeholder — coming soon. Will cover training methodology,
        persona design, and how it differs from prompt-engineering the same result.
      tech_stack: ["Python", "Transformers", "FastAPI"]
      image: "/images/projects/placeholder.jpg"
      featured: true
      coming_soon: true

# ── Section 3: Vision Projects ────────────────────────────────────────────────

section_3:
  id: "vision"
  label: "03"
  title: "Vision Projects"
  tagline: "Building eyes for machines — detection, mapping, understanding."
  accent_word: "Vision"
  color_highlight: "--color-pop"

  projects:

    - id: projection-mapper
      type: Lab
      title: "Projection Mapper"
      year: "2025"
      tags: ["Python", "PySide6", "OpenCV", "NumPy", "Homography"]
      short_description: "A desktop tool for warping images onto physical surfaces in real time."
      long_description: >
        Real-time projection mapping tool for physical surfaces. Load images or
        video, drag four corner handles to warp perspective via live homography,
        layer multiple surfaces, and save quad configurations as JSON presets.
      tech_stack: ["Python", "PySide6", "OpenCV", "NumPy"]
      image: "/images/projects/projection-mapper.jpg"
      featured: true
      coming_soon: false

    - id: weed-detection
      type: Work
      title: "Autonomous Weed Detection"
      year: "2023"
      tags: ["YOLOv8", "Jetson Nano", "Robotics", "Docker"]
      short_description: "92% accurate weed detection on a field robot — 40% less herbicide."
      long_description: >
        Led algorithm development at Escarda Technologies for an autonomous weed
        detection system on field robotics hardware. Achieved 92% detection accuracy
        using YOLOv8 on Jetson Nano, directly cutting chemical usage by 40%.
      tech_stack: ["YOLOv8", "Jetson Nano", "Raspberry Pi", "Docker"]
      image: "/images/projects/weed-detection.jpg"
      featured: true
      coming_soon: false

# ── Section 4: Creative Side Projects ────────────────────────────────────────

section_4:
  id: "creative"
  label: "04"
  title: "Creative Projects"
  tagline: "Things built because they were interesting. No other reason needed."
  accent_word: "Creative"
  color_highlight: "--color-accent"

  projects:

    - id: creative-placeholder-1
      type: Experiment
      title: "Generative Visual System"
      year: "2025"
      tags: ["p5.js", "Generative Art", "Canvas API"]
      short_description: "An algorithmic system that produces visual output from simple rules."
      long_description: >
        Placeholder — coming soon. Will cover the generative logic,
        parameter space, and what made the output worth keeping.
      tech_stack: ["p5.js", "JavaScript"]
      image: "/images/projects/placeholder.jpg"
      featured: true
      coming_soon: true

    - id: creative-placeholder-2
      type: Experiment
      title: "Interactive Audio-Visual Piece"
      year: "2026"
      tags: ["WebGL", "Tone.js", "Three.js"]
      short_description: "Sound and visuals that respond to each other in real time."
      long_description: >
        Placeholder — coming soon. Built because it was interesting —
        no practical use case required.
      tech_stack: ["Three.js", "Tone.js", "WebGL"]
      image: "/images/projects/placeholder.jpg"
      featured: true
      coming_soon: true

---

## About Section

about_headline: "Know more."

about_body_p1: >
  I'm an AI/ML engineer who bridges research and production — building systems
  that are robust, explainable, and ready to ship. Always looking for systems
  that need automating, so colleagues aren't bogged down by repetitive manual
  work. AI is my tool for turning cognitive tasks into scalable systems.

about_body_p2: >
  Currently freelancing and building in public — from RAG pipelines and Chrome
  extension agents to projection mapping tools. I work end-to-end: problem
  definition, model selection, deployment, and the guardrails that make it
  trustworthy.

about_fun: "✦ Over-engineering my coffee routine since 2013."

about_facts:
  - label: "Years building AI"    value: "3+"
  - label: "Projects shipped"     value: "4+"
  - label: "Coffees automated"    value: "∞"

---

## Education

- degree:      "M.Sc. Information Technology"
  institution: "University of Stuttgart"
  location:    "Germany"
  period:      "2019 – 2022"

- degree:      "B.E. Electrical & Electronics"
  institution: "Ramaiah Institute of Technology"
  location:    "Bangalore, India"
  period:      "2013 – 2017"

---

## Skills

core: ["Python", "PyTorch", "YOLOv8", "LangChain", "RAG", "FastAPI", "OpenCV"]
infra: ["Docker", "ROS2", "n8n", "C++"]
# Displayed as pill tags in the About section — same tag style as project tags

---

## Work Experience

- company:     "Escarda Technologies"
  role:        "AI/ML Engineer"
  period:      "Jan 2023 – Sep 2024"
  location:    "Berlin, Germany"
  description: >
    Led algorithm development for autonomous weed detection achieving 92% accuracy,
    reducing chemical usage by 40%. Delivered Smart Checkpot IoT plant monitor using
    YOLOv8 + Raspberry Pi. Standardized Agile sprint processes and CI/CD pipelines.
  highlight:   "92% accuracy · 40% less chemicals"
  tags: ["YOLOv8", "Robotics", "Jetson Nano", "IoT", "Docker", "Agile"]

# ADD MORE ROLES ABOVE — most recent first

---

## Chatbot Bubble

# Floating widget — bottom-right corner, always visible on all pages.
# Clicking opens a slide-up chat panel over the page content.
# NOT a page section — never in the normal document flow.

bubble_tooltip:   "Ask my AI anything"
chat_headline:    "Ask me anything"
chat_subtext:     "Trained on my work, my thinking, and my projects."
chat_placeholder: "What are you curious about?"
chat_disclaimer:  "Powered by a model trained on my own writing."
bubble_icon:      "/assets/icons/chat-bubble.svg"
