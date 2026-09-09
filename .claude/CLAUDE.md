# Joshua Lescano Portfolio — Claude Code Instructions

## Project Overview
Building a single-page personal brand portfolio website for Joshua Lescano — Creative Content Specialist. This is a living, interactive personal brand hub. Not a basic portfolio.

## CRITICAL RULES
- NEVER put all code in one file
- Every section has its own CSS file in /styles/
- Every major function has its own JS file in /scripts/
- All dynamic data lives in JSON files in /data/
- Joshua only ever edits /data/ files to update content
- All external links MUST open in a new tab (target="_blank")
- Everything reveals through HOVER and SCROLL only
- Clicking is ONLY for external links

## UI/UX Standards
- Dark premium aesthetic throughout
- Production-grade animations — smooth, intentional, never cheap
- Hover interactions must feel satisfying and polished
- Scroll animations use Intersection Observer API
- Mouse movement reactions on hero and web3 backgrounds
- Mobile responsive — desktop and mobile equally premium
- Respect prefers-reduced-motion for accessibility

## Design Direction
- Tone: Premium creative agency — confident, dark, electric
- NOT generic AI aesthetics
- NOT templates or cookie-cutter layouts
- Every section has its own visual personality
- Typography: Strong modern sans-serif — NOT Inter, NOT Roboto, NOT Arial
- Generous whitespace, intentional layout, asymmetric where appropriate

## Brand Colors
- Black base: #000000
- Electric Blue (Iconiq Creatives): #41BDFE
- Electric Pink (Revybe Motion): #E111FB
- Portfolio Gradient: #41BDFE → #E111FB
- Matrix Green (Web3 / iconiq0x): #00F808
- White: #FFFFFF — used in Social Media and Mentorship sections only

## File Structure — MANDATORY
portfolio/
├── index.html
├── styles/
│   ├── main.css
│   ├── hero.css
│   ├── social-media.css
│   ├── mentorship.css
│   ├── graphic-design.css
│   ├── video-editing.css
│   ├── web3.css
│   ├── tools.css
│   └── footer.css
├── scripts/
│   ├── main.js
│   ├── clock.js
│   ├── animations.js
│   ├── data-loader.js
│   ├── charts.js
│   └── rotating-title.js
├── data/
│   ├── projects.json
│   ├── mentorship.json
│   ├── design-portfolio.json
│   ├── video-portfolio.json
│   └── tools.json
├── assets/
│   ├── images/
│   │   ├── brands/
│   │   ├── design-portfolio/
│   │   ├── mentorship/
│   │   └── profile/
│   └── videos/
│       └── thumbnails/
└── README.md

## Tech Stack
- Vanilla HTML, CSS, JavaScript — no framework
- Google Fonts — free
- Chart.js — for growth charts
- GSAP or AOS — for scroll animations
- Canvas API — for hero gradient mesh and web3 particles

## Animation Principles
- Card hover expansion: CSS transition 300ms ease
- Story ring glow: CSS box-shadow pulse
- Chart draw animation: Chart.js built-in left to right
- Hero background: canvas gradient mesh reacts to mousemove
- Web3 background: holographic grid shifts

## UI/UX Skill — Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic AI aesthetics.

### Design Thinking
Before coding, commit to a BOLD aesthetic direction:
- Purpose: Premium creative portfolio for a Creative Content Specialist
- Tone: Dark, electric, premium creative agency — confident and unforgettable
- Differentiation: The one thing someone remembers is the social media story ring system and the interactive growth charts

### Frontend Aesthetics
- Typography: Choose fonts that are beautiful and unexpected. NEVER use Inter, Roboto, Arial, or Space Grotesk. Pick distinctive display fonts that feel premium and creative.
- Color: Dominant dark base with electric blue and pink accents. Sharp and intentional. Never timid.
- Motion: High-impact animations. Staggered page load. Hover states that surprise. Scroll-triggered reveals.
- Spatial Composition: Generous negative space. Intentional asymmetry where appropriate. Grid-breaking hero.
- Backgrounds: Gradient mesh on hero. Matrix particle system on web3. Depth and atmosphere throughout.

### Never Do This
- Generic purple gradients on white
- Cookie-cutter layouts
- Predictable component patterns
- Flat boring transitions
- Any design that looks like a template