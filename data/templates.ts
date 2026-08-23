export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  thumbnail: string;
  objects: Array<{
    type: string;
    left: number;
    top: number;
    width?: number;
    height?: number;
    radius?: number;
    rx?: number;
    ry?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    opacity?: number;
    fillAsGradient?: boolean;
    gradient?: {
      type: string;
      coords: Record<string, number>;
      colorStops: Array<{ offset: number; color: string }>;
    };
  }>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  templates: TemplateItem[];
}

export const templateCategories: TemplateCategory[] = [
  {
    id: "social-media",
    name: "Social Media",
    icon: "📱",
    description: "Posts for Instagram, Facebook, Twitter & more",
    templates: [
      {
        id: "ig-post-1",
        name: "Gradient Announcement",
        category: "social-media",
        tags: ["instagram", "announcement", "gradient"],
        width: 1080,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1080, fill: "#667eea" },
          { type: "rect", left: 100, top: 100, width: 880, height: 880, fill: "#764ba2" },
          { type: "rect", left: 200, top: 200, width: 680, height: 680, fill: "#ffffff" },
          { type: "text", left: 280, top: 350, text: "NEW\nARRIVALS", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#667eea", textAlign: "center" },
          { type: "text", left: 320, top: 550, text: "Shop the latest collection", fontSize: 24, fontFamily: "Arial", fill: "#666666" },
        ],
      },
      {
        id: "ig-post-2",
        name: "Minimal Quote",
        category: "social-media",
        tags: ["instagram", "quote", "minimal"],
        width: 1080,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1080, fill: "#fef9ef" },
          { type: "text", left: 150, top: 200, text: "\"", fontSize: 300, fontFamily: "Georgia", fill: "#d4a574" },
          { type: "text", left: 200, top: 380, text: "The only way to do\ngreat work is to love\nwhat you do.", fontSize: 48, fontFamily: "Georgia", fontStyle: "italic", fill: "#333333" },
          { type: "text", left: 200, top: 650, text: "— Steve Jobs", fontSize: 20, fontFamily: "Arial", fill: "#999999" },
        ],
      },
      {
        id: "ig-story-1",
        name: "Sale Story",
        category: "social-media",
        tags: ["instagram", "story", "sale"],
        width: 1080,
        height: 1920,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: "#ff6b6b" },
          { type: "rect", left: 80, top: 400, width: 920, height: 400, fill: "#ffffff" },
          { type: "text", left: 200, top: 480, text: "50% OFF", fontSize: 120, fontFamily: "Arial", fontWeight: "bold", fill: "#ff6b6b" },
          { type: "text", left: 280, top: 650, text: "ALL ITEMS", fontSize: 48, fontFamily: "Arial", fill: "#333333" },
          { type: "text", left: 350, top: 1400, text: "Swipe up to shop", fontSize: 28, fontFamily: "Arial", fill: "#ffffff" },
        ],
      },
      {
        id: "fb-post-1",
        name: "Event Promotion",
        category: "social-media",
        tags: ["facebook", "event", "promotion"],
        width: 1200,
        height: 630,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1200, height: 630, fill: "#1a1a2e" },
          { type: "rect", left: 60, top: 60, width: 500, height: 510, fill: "#e94560" },
          { type: "text", left: 100, top: 150, text: "SUMMER\nFESTIVAL", fontSize: 60, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 100, top: 350, text: "June 15, 2025", fontSize: 24, fontFamily: "Arial", fill: "#ffffff" },
          { type: "text", left: 640, top: 180, text: "Join us for the\nbiggest event\nof the year!", fontSize: 32, fontFamily: "Arial", fill: "#ffffff" },
        ],
      },
      {
        id: "twitter-post-1",
        name: "Product Launch",
        category: "social-media",
        tags: ["twitter", "product", "launch"],
        width: 1200,
        height: 675,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1200, height: 675, fill: "#0f0f23" },
          { type: "circle", left: 700, top: 100, radius: 200, fill: "#6c5ce7" },
          { type: "circle", left: 750, top: 150, radius: 150, fill: "#a29bfe" },
          { type: "text", left: 80, top: 180, text: "INTRODUCING", fontSize: 24, fontFamily: "Arial", fill: "#a29bfe" },
          { type: "text", left: 80, top: 230, text: "The Future\nof Design", fontSize: 56, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 80, top: 450, text: "Coming soon →", fontSize: 20, fontFamily: "Arial", fill: "#a29bfe" },
        ],
      },
      {
        id: "ig-reel-cover",
        name: "Reel Cover Bold",
        category: "social-media",
        tags: ["instagram", "reel", "bold"],
        width: 1080,
        height: 1920,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: "#0c0c0c" },
          { type: "rect", left: 0, top: 700, width: 1080, height: 500, fill: "#ffd700" },
          { type: "text", left: 100, top: 800, text: "TOP 10\nTIPS", fontSize: 100, fontFamily: "Arial", fontWeight: "bold", fill: "#0c0c0c" },
          { type: "text", left: 100, top: 400, text: "You need to know", fontSize: 36, fontFamily: "Arial", fill: "#ffffff" },
        ],
      },
    ],
  },
  {
    id: "presentations",
    name: "Presentations",
    icon: "📊",
    description: "Professional slide decks and pitch decks",
    templates: [
      {
        id: "pitch-deck-1",
        name: "Startup Pitch Deck",
        category: "presentations",
        tags: ["pitch", "startup", "business"],
        width: 1920,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1920, height: 1080, fill: "#0a0a1a" },
          { type: "rect", left: 0, top: 0, width: 100, height: 1080, fill: "#6366f1" },
          { type: "text", left: 160, top: 200, text: "REVOLUTION", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 160, top: 320, text: "The Future of Technology", fontSize: 36, fontFamily: "Arial", fill: "#a5b4fc" },
          { type: "rect", left: 160, top: 600, width: 300, height: 60, fill: "#6366f1" },
          { type: "text", left: 200, top: 615, text: "Get Started →", fontSize: 22, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "circle", left: 1400, top: 200, radius: 250, fill: "#1e1e3f" },
          { type: "circle", left: 1500, top: 300, radius: 150, fill: "#6366f1" },
        ],
      },
      {
        id: "company-overview",
        name: "Company Overview",
        category: "presentations",
        tags: ["company", "overview", "corporate"],
        width: 1920,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1920, height: 1080, fill: "#ffffff" },
          { type: "rect", left: 0, top: 0, width: 1920, height: 8, fill: "#3b82f6" },
          { type: "text", left: 120, top: 80, text: "COMPANY OVERVIEW", fontSize: 18, fontFamily: "Arial", fontWeight: "bold", fill: "#3b82f6" },
          { type: "text", left: 120, top: 150, text: "Innovating for the\nFuture", fontSize: 56, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b" },
          { type: "rect", left: 120, top: 400, width: 800, height: 2, fill: "#e2e8f0" },
          { type: "text", left: 120, top: 440, text: "Our mission is to create innovative solutions\nthat transform industries.", fontSize: 22, fontFamily: "Arial", fill: "#64748b" },
          { type: "rect", left: 1200, top: 200, width: 560, height: 400, fill: "#eff6ff" },
          { type: "circle", left: 1350, top: 320, radius: 100, fill: "#3b82f6" },
        ],
      },
      {
        id: "data-report",
        name: "Data Report",
        category: "presentations",
        tags: ["data", "report", "analytics"],
        width: 1920,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1920, height: 1080, fill: "#f8fafc" },
          { type: "text", left: 120, top: 60, text: "Q4 PERFORMANCE REPORT", fontSize: 16, fontFamily: "Arial", fontWeight: "bold", fill: "#64748b" },
          { type: "text", left: 120, top: 110, text: "Quarterly Results", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#0f172a" },
          { type: "rect", left: 120, top: 250, width: 540, height: 320, fill: "#ffffff" },
          { type: "rect", left: 700, top: 250, width: 540, height: 320, fill: "#ffffff" },
          { type: "rect", left: 1280, top: 250, width: 540, height: 320, fill: "#ffffff" },
          { type: "text", left: 160, top: 290, text: "Revenue", fontSize: 18, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 160, top: 340, text: "$2.4M", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#10b981" },
          { type: "text", left: 740, top: 290, text: "Users", fontSize: 18, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 740, top: 340, text: "145K", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 1320, top: 290, text: "Growth", fontSize: 18, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 1320, top: 340, text: "+34%", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#f59e0b" },
        ],
      },
      {
        id: "minimal-slide",
        name: "Minimal Title Slide",
        category: "presentations",
        tags: ["minimal", "title", "clean"],
        width: 1920,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1920, height: 1080, fill: "#111827" },
          { type: "text", left: 960, top: 400, text: "MINIMAL", fontSize: 96, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 960, top: 520, text: "PRESENTATION TEMPLATE", fontSize: 20, fontFamily: "Arial", fill: "#6b7280", textAlign: "center" },
          { type: "rect", left: 910, top: 580, width: 100, height: 3, fill: "#6366f1" },
        ],
      },
      {
        id: "creative-agency",
        name: "Creative Agency",
        category: "presentations",
        tags: ["creative", "agency", "colorful"],
        width: 1920,
        height: 1080,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1920, height: 1080, fill: "#0d1117" },
          { type: "rect", left: 0, top: 0, width: 960, height: 1080, fill: "#ff6b35" },
          { type: "text", left: 120, top: 300, text: "CREATIVE\nAGENCY", fontSize: 72, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 120, top: 520, text: "Where ideas come alive", fontSize: 24, fontFamily: "Arial", fill: "#ffe0cc" },
          { type: "text", left: 1100, top: 400, text: "Our Work", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 1100, top: 500, text: "See our portfolio", fontSize: 20, fontFamily: "Arial", fill: "#9ca3af" },
        ],
      },
    ],
  },
  {
    id: "social-stories",
    name: "Stories",
    icon: "📖",
    description: "Instagram & Facebook stories",
    templates: [
      {
        id: "story-promo-1",
        name: "Flash Sale",
        category: "social-stories",
        tags: ["story", "sale", "flash"],
        width: 1080,
        height: 1920,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: "#1a1a2e" },
          { type: "rect", left: 0, top: 600, width: 1080, height: 700, fill: "#e94560" },
          { type: "text", left: 540, top: 750, text: "FLASH\nSALE", fontSize: 120, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 540, top: 1100, text: "UP TO 70% OFF", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffd700", textAlign: "center" },
          { type: "text", left: 540, top: 1500, text: "Today Only!", fontSize: 28, fontFamily: "Arial", fill: "#ffffff", textAlign: "center" },
        ],
      },
      {
        id: "story-poll",
        name: "Interactive Poll",
        category: "social-stories",
        tags: ["story", "poll", "interactive"],
        width: 1080,
        height: 1920,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: "#667eea" },
          { type: "rect", left: 0, top: 600, width: 1080, height: 800, fill: "#ffffff" },
          { type: "text", left: 540, top: 700, text: "WHICH DO\nYOU PREFER?", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#1a1a2e", textAlign: "center" },
          { type: "rect", left: 140, top: 950, width: 380, height: 200, fill: "#667eea" },
          { type: "text", left: 330, top: 1020, text: "Option A", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "rect", left: 560, top: 950, width: 380, height: 200, fill: "#f093fb" },
          { type: "text", left: 750, top: 1020, text: "Option B", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
        ],
      },
      {
        id: "story-countdown",
        name: "Countdown Timer",
        category: "social-stories",
        tags: ["story", "countdown", "launch"],
        width: 1080,
        height: 1920,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: "#000000" },
          { type: "text", left: 540, top: 400, text: "LAUNCHING\nIN", fontSize: 48, fontFamily: "Arial", fill: "#ffffff", textAlign: "center" },
          { type: "rect", left: 100, top: 600, width: 250, height: 250, fill: "#6366f1" },
          { type: "text", left: 225, top: 670, text: "03", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "rect", left: 415, top: 600, width: 250, height: 250, fill: "#8b5cf6" },
          { type: "text", left: 540, top: 670, text: "12", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "rect", left: 730, top: 600, width: 250, height: 250, fill: "#a78bfa" },
          { type: "text", left: 855, top: 670, text: "45", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 225, top: 900, text: "Days", fontSize: 20, fontFamily: "Arial", fill: "#ffffff" },
          { type: "text", left: 540, top: 900, text: "Hours", fontSize: 20, fontFamily: "Arial", fill: "#ffffff" },
          { type: "text", left: 855, top: 900, text: "Mins", fontSize: 20, fontFamily: "Arial", fill: "#ffffff" },
        ],
      },
    ],
  },
  {
    id: "posters",
    name: "Posters",
    icon: "🖼️",
    description: "Event posters, movie posters & more",
    templates: [
      {
        id: "concert-poster",
        name: "Concert Poster",
        category: "posters",
        tags: ["concert", "music", "event"],
        width: 800,
        height: 1200,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 1200, fill: "#0c0c0c" },
          { type: "circle", left: 150, top: 100, radius: 250, fill: "#ff006e" },
          { type: "circle", left: 200, top: 150, radius: 200, fill: "#8338ec" },
          { type: "circle", left: 250, top: 200, radius: 150, fill: "#3a86ff" },
          { type: "text", left: 400, top: 550, text: "SUMMER\nSOUNDS", fontSize: 72, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 400, top: 750, text: "2025 WORLD TOUR", fontSize: 24, fontFamily: "Arial", fill: "#ff006e", textAlign: "center" },
          { type: "text", left: 400, top: 900, text: "JUNE 15 • MSG • NYC", fontSize: 18, fontFamily: "Arial", fill: "#666666", textAlign: "center" },
        ],
      },
      {
        id: "movie-poster",
        name: "Movie Poster",
        category: "posters",
        tags: ["movie", "film", "cinema"],
        width: 800,
        height: 1200,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 1200, fill: "#1a1a2e" },
          { type: "rect", left: 100, top: 100, width: 600, height: 600, fill: "#16213e" },
          { type: "rect", left: 150, top: 150, width: 500, height: 500, fill: "#0f3460" },
          { type: "text", left: 400, top: 800, text: "THE\nLAST\nFRONTIER", fontSize: 64, fontFamily: "Arial", fontWeight: "bold", fill: "#e94560", textAlign: "center" },
          { type: "text", left: 400, top: 1050, text: "COMING SOON", fontSize: 20, fontFamily: "Arial", fill: "#ffffff", textAlign: "center" },
        ],
      },
      {
        id: "workshop-poster",
        name: "Workshop Poster",
        category: "posters",
        tags: ["workshop", "education", "class"],
        width: 800,
        height: 1100,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 1100, fill: "#f0f4f8" },
          { type: "rect", left: 0, top: 0, width: 800, height: 300, fill: "#2563eb" },
          { type: "text", left: 400, top: 100, text: "DESIGN\nWORKSHOP", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 100, top: 400, text: "Learn the fundamentals\nof UI/UX design", fontSize: 24, fontFamily: "Arial", fill: "#475569" },
          { type: "rect", left: 100, top: 550, width: 600, height: 2, fill: "#e2e8f0" },
          { type: "text", left: 100, top: 600, text: "📅  Saturday, March 15\n⏰  10:00 AM - 4:00 PM\n📍  Design Studio NYC", fontSize: 20, fontFamily: "Arial", fill: "#64748b" },
          { type: "rect", left: 100, top: 850, width: 300, height: 60, fill: "#2563eb" },
          { type: "text", left: 250, top: 865, text: "Register Now", fontSize: 20, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
        ],
      },
    ],
  },
  {
    id: "logos",
    name: "Logos",
    icon: "✨",
    description: "Logo designs and brand marks",
    templates: [
      {
        id: "geometric-logo",
        name: "Geometric Logo",
        category: "logos",
        tags: ["logo", "geometric", "modern"],
        width: 500,
        height: 500,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 500, height: 500, fill: "#0f172a" },
          { type: "rect", left: 150, top: 120, width: 200, height: 200, fill: "#6366f1" },
          { type: "circle", left: 180, top: 180, radius: 80, fill: "#ffffff" },
          { type: "text", left: 250, top: 380, text: "BRAND", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 250, top: 420, text: "STUDIO", fontSize: 14, fontFamily: "Arial", fill: "#6366f1", textAlign: "center" },
        ],
      },
      {
        id: "minimal-logo",
        name: "Minimal Lettermark",
        category: "logos",
        tags: ["logo", "minimal", "lettermark"],
        width: 500,
        height: 500,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 500, height: 500, fill: "#ffffff" },
          { type: "text", left: 250, top: 150, text: "A", fontSize: 180, fontFamily: "Georgia", fontWeight: "bold", fill: "#111827", textAlign: "center" },
          { type: "rect", left: 100, top: 350, width: 300, height: 3, fill: "#111827" },
          { type: "text", left: 250, top: 380, text: "ATELIER", fontSize: 20, fontFamily: "Arial", fill: "#6b7280", textAlign: "center" },
        ],
      },
      {
        id: "tech-logo",
        name: "Tech Startup",
        category: "logos",
        tags: ["logo", "tech", "startup"],
        width: 500,
        height: 500,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 500, height: 500, fill: "#0c0c0c" },
          { type: "circle", left: 170, top: 120, radius: 60, fill: "#22d3ee" },
          { type: "circle", left: 250, top: 120, radius: 60, fill: "#818cf8" },
          { type: "circle", left: 170, top: 200, radius: 60, fill: "#a78bfa" },
          { type: "circle", left: 250, top: 200, radius: 60, fill: "#f472b6" },
          { type: "text", left: 250, top: 350, text: "NEXUS", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 250, top: 400, text: "TECHNOLOGIES", fontSize: 12, fontFamily: "Arial", fill: "#6b7280", textAlign: "center" },
        ],
      },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    description: "Cards, letterheads & business docs",
    templates: [
      {
        id: "business-card-1",
        name: "Modern Business Card",
        category: "business",
        tags: ["business", "card", "professional"],
        width: 1050,
        height: 600,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1050, height: 600, fill: "#ffffff" },
          { type: "rect", left: 0, top: 0, width: 400, height: 600, fill: "#1e293b" },
          { type: "text", left: 60, top: 150, text: "JOHN\nSMITH", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 60, top: 260, text: "Creative Director", fontSize: 16, fontFamily: "Arial", fill: "#94a3b8" },
          { type: "rect", left: 60, top: 350, width: 60, height: 2, fill: "#6366f1" },
          { type: "text", left: 500, top: 180, text: "john@studio.com", fontSize: 18, fontFamily: "Arial", fill: "#475569" },
          { type: "text", left: 500, top: 230, text: "+1 (555) 123-4567", fontSize: 18, fontFamily: "Arial", fill: "#475569" },
          { type: "text", left: 500, top: 280, text: "www.studio.com", fontSize: 18, fontFamily: "Arial", fill: "#6366f1" },
        ],
      },
      {
        id: "invoice-header",
        name: "Invoice Header",
        category: "business",
        tags: ["invoice", "business", "document"],
        width: 800,
        height: 200,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 200, fill: "#ffffff" },
          { type: "rect", left: 0, top: 0, width: 800, height: 4, fill: "#6366f1" },
          { type: "text", left: 60, top: 40, text: "ACME CORP", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b" },
          { type: "text", left: 60, top: 90, text: "123 Business St, Suite 100", fontSize: 14, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 600, top: 40, text: "INVOICE", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 600, top: 90, text: "#INV-2025-001", fontSize: 14, fontFamily: "Arial", fill: "#64748b" },
        ],
      },
      {
        id: "letterhead",
        name: "Company Letterhead",
        category: "business",
        tags: ["letterhead", "business", "formal"],
        width: 800,
        height: 1100,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 1100, fill: "#ffffff" },
          { type: "rect", left: 0, top: 0, width: 800, height: 120, fill: "#1e293b" },
          { type: "text", left: 60, top: 40, text: "COMPANY NAME", fontSize: 24, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 600, top: 45, text: "info@company.com", fontSize: 12, fontFamily: "Arial", fill: "#94a3b8" },
          { type: "rect", left: 0, top: 1080, width: 800, height: 20, fill: "#6366f1" },
          { type: "text", left: 400, top: 1080, text: "www.company.com", fontSize: 10, fontFamily: "Arial", fill: "#ffffff" },
        ],
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "🎬",
    description: "Thumbnails and channel art",
    templates: [
      {
        id: "yt-thumbnail-1",
        name: "Gaming Thumbnail",
        category: "youtube",
        tags: ["youtube", "gaming", "thumbnail"],
        width: 1280,
        height: 720,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1280, height: 720, fill: "#1a1a2e" },
          { type: "rect", left: 0, top: 0, width: 640, height: 720, fill: "#e94560" },
          { type: "text", left: 100, top: 200, text: "EPIC\nGAMING", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 100, top: 450, text: "SESSION #47", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffd700" },
          { type: "circle", left: 900, top: 150, radius: 180, fill: "#6366f1" },
          { type: "circle", left: 950, top: 200, radius: 130, fill: "#a78bfa" },
        ],
      },
      {
        id: "yt-thumbnail-2",
        name: "Tutorial Thumbnail",
        category: "youtube",
        tags: ["youtube", "tutorial", "education"],
        width: 1280,
        height: 720,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1280, height: 720, fill: "#0f172a" },
          { type: "rect", left: 60, top: 60, width: 600, height: 600, fill: "#6366f1" },
          { type: "text", left: 120, top: 200, text: "LEARN\nREACT", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 120, top: 450, text: "IN 30 MINUTES", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#ffd700" },
          { type: "text", left: 800, top: 250, text: "Beginner\nFriendly", fontSize: 36, fontFamily: "Arial", fill: "#a78bfa" },
          { type: "text", left: 800, top: 450, text: "2025 Edition", fontSize: 24, fontFamily: "Arial", fill: "#94a3b8" },
        ],
      },
      {
        id: "yt-banner",
        name: "Channel Banner",
        category: "youtube",
        tags: ["youtube", "banner", "channel"],
        width: 2560,
        height: 1440,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 2560, height: 1440, fill: "#0c0c0c" },
          { type: "rect", left: 400, top: 400, width: 1760, height: 640, fill: "#1a1a2e" },
          { type: "text", left: 1280, top: 550, text: "CREATIVE CHANNEL", fontSize: 64, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
          { type: "text", left: 1280, top: 680, text: "Design • Code • Create", fontSize: 28, fontFamily: "Arial", fill: "#6366f1", textAlign: "center" },
          { type: "rect", left: 1180, top: 780, width: 200, height: 60, fill: "#6366f1" },
          { type: "text", left: 1280, top: 795, text: "Subscribe", fontSize: 20, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
        ],
      },
    ],
  },
  {
    id: "resumes",
    name: "Resumes",
    icon: "📄",
    description: "Professional resume templates",
    templates: [
      {
        id: "modern-resume",
        name: "Modern Resume",
        category: "resumes",
        tags: ["resume", "modern", "professional"],
        width: 800,
        height: 1100,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 1100, fill: "#ffffff" },
          { type: "rect", left: 0, top: 0, width: 280, height: 1100, fill: "#1e293b" },
          { type: "circle", left: 90, top: 60, radius: 50, fill: "#6366f1" },
          { type: "text", left: 140, top: 70, text: "JD", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff" },
          { type: "text", left: 60, top: 200, text: "CONTACT", fontSize: 14, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 60, top: 240, text: "john@email.com\n+1 555-0123\nNew York, NY", fontSize: 12, fontFamily: "Arial", fill: "#94a3b8" },
          { type: "text", left: 60, top: 380, text: "SKILLS", fontSize: 14, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 60, top: 420, text: "UI/UX Design\nReact, TypeScript\nFigma, Sketch", fontSize: 12, fontFamily: "Arial", fill: "#94a3b8" },
          { type: "text", left: 340, top: 80, text: "JOHN DOE", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b" },
          { type: "text", left: 340, top: 130, text: "Senior Designer", fontSize: 18, fontFamily: "Arial", fill: "#6366f1" },
          { type: "rect", left: 340, top: 180, width: 400, height: 2, fill: "#e2e8f0" },
          { type: "text", left: 340, top: 220, text: "EXPERIENCE", fontSize: 14, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b" },
          { type: "text", left: 340, top: 260, text: "Senior Designer\nGoogle • 2020-Present\nLed design team of 8", fontSize: 12, fontFamily: "Arial", fill: "#64748b" },
        ],
      },
    ],
  },
  {
    id: "invitations",
    name: "Invitations",
    icon: "🎉",
    description: "Event invitations and cards",
    templates: [
      {
        id: "birthday-invite",
        name: "Birthday Party",
        category: "invitations",
        tags: ["birthday", "party", "celebration"],
        width: 800,
        height: 800,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 800, fill: "#fdf2f8" },
          { type: "circle", left: 50, top: 50, radius: 80, fill: "#f472b6" },
          { type: "circle", left: 650, top: 50, radius: 60, fill: "#a78bfa" },
          { type: "circle", left: 100, top: 650, radius: 50, fill: "#60a5fa" },
          { type: "circle", left: 680, top: 680, radius: 40, fill: "#34d399" },
          { type: "text", left: 400, top: 200, text: "YOU'RE\nINVITED!", fontSize: 72, fontFamily: "Arial", fontWeight: "bold", fill: "#ec4899", textAlign: "center" },
          { type: "text", left: 400, top: 420, text: "Join us for Sarah's\nBirthday Celebration", fontSize: 24, fontFamily: "Georgia", fill: "#6b7280", textAlign: "center" },
          { type: "rect", left: 250, top: 550, width: 300, height: 50, fill: "#ec4899" },
          { type: "text", left: 400, top: 565, text: "RSVP Now", fontSize: 18, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
        ],
      },
      {
        id: "wedding-invite",
        name: "Wedding Invitation",
        category: "invitations",
        tags: ["wedding", "elegant", "formal"],
        width: 800,
        height: 1100,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 800, height: 1100, fill: "#fefcf3" },
          { type: "rect", left: 60, top: 60, width: 680, height: 980, fill: "#ffffff" },
          { type: "rect", left: 80, top: 80, width: 640, height: 940, fill: "none", stroke: "#d4a574", strokeWidth: 2 },
          { type: "text", left: 400, top: 200, text: "Together with\ntheir families", fontSize: 18, fontFamily: "Georgia", fill: "#9ca3af", textAlign: "center" },
          { type: "text", left: 400, top: 350, text: "Sarah & James", fontSize: 48, fontFamily: "Georgia", fontStyle: "italic", fill: "#1f2937", textAlign: "center" },
          { type: "rect", left: 320, top: 450, width: 160, height: 1, fill: "#d4a574" },
          { type: "text", left: 400, top: 500, text: "Request the pleasure\nof your company", fontSize: 16, fontFamily: "Georgia", fill: "#6b7280", textAlign: "center" },
          { type: "text", left: 400, top: 650, text: "Saturday, June 20th\n2025 at 4:00 PM", fontSize: 20, fontFamily: "Georgia", fill: "#1f2937", textAlign: "center" },
          { type: "text", left: 400, top: 800, text: "The Grand Ballroom\nNew York, NY", fontSize: 16, fontFamily: "Georgia", fill: "#6b7280", textAlign: "center" },
        ],
      },
    ],
  },
  {
    id: "infographics",
    name: "Infographics",
    icon: "📈",
    description: "Data visualization and info graphics",
    templates: [
      {
        id: "timeline-infographic",
        name: "Timeline",
        category: "infographics",
        tags: ["timeline", "history", "process"],
        width: 1200,
        height: 800,
        thumbnail: "",
        objects: [
          { type: "rect", left: 0, top: 0, width: 1200, height: 800, fill: "#f8fafc" },
          { type: "text", left: 600, top: 60, text: "COMPANY TIMELINE", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b", textAlign: "center" },
          { type: "rect", left: 100, top: 380, width: 1000, height: 4, fill: "#6366f1" },
          { type: "circle", left: 200, top: 360, radius: 20, fill: "#6366f1" },
          { type: "circle", left: 450, top: 360, radius: 20, fill: "#6366f1" },
          { type: "circle", left: 700, top: 360, radius: 20, fill: "#6366f1" },
          { type: "circle", left: 950, top: 360, radius: 20, fill: "#6366f1" },
          { type: "text", left: 200, top: 250, text: "2020", fontSize: 18, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 200, top: 420, text: "Founded", fontSize: 14, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 450, top: 250, text: "2021", fontSize: 18, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 450, top: 420, text: "Series A", fontSize: 14, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 700, top: 250, text: "2023", fontSize: 18, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 700, top: 420, text: "100K Users", fontSize: 14, fontFamily: "Arial", fill: "#64748b" },
          { type: "text", left: 950, top: 250, text: "2025", fontSize: 18, fontFamily: "Arial", fontWeight: "bold", fill: "#6366f1" },
          { type: "text", left: 950, top: 420, text: "Global Launch", fontSize: 14, fontFamily: "Arial", fill: "#64748b" },
        ],
      },
    ],
  },
];

export function getAllTemplates(): TemplateItem[] {
  return templateCategories.flatMap((cat) => cat.templates);
}

export function getTemplatesByCategory(categoryId: string): TemplateItem[] {
  const category = templateCategories.find((c) => c.id === categoryId);
  return category ? category.templates : [];
}

export function searchTemplates(query: string): TemplateItem[] {
  const lower = query.toLowerCase();
  return getAllTemplates().filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lower)) ||
      t.category.toLowerCase().includes(lower)
  );
}
