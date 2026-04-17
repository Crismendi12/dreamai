import pptxgen from "pptxgenjs";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Cristian Mendivelso";
pres.company = "DreamAI";
pres.title = "DreamAI - AI-Powered Nightmare Therapy";

// Brand colors
const C = {
  navy: "080B14",
  navyMid: "0F1320",
  navyCard: "141822",
  gold: "D4A574",
  goldDark: "C49B6A",
  goldLight: "E8C9A0",
  cream: "EDE9E3",
  white: "FFFFFF",
  offWhite: "FAFAF8",
  bodyText: "374151",
  lightGray: "9CA3AF",
  lineGray: "E5E7EB",
  success: "7EB89A",
  danger: "D98B8B",
  lavender: "8B9CC7",
  warmBg: "F5F0EB",
};

// Helpers
function sourceFootnote(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 6.9, w: 12, h: 0.3,
    fontSize: 7.5, fontFace: "Calibri", italic: true,
    color: C.lightGray, margin: 0,
  });
}

function thinLine(slide, x, y, w, color = C.lineGray) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.02,
    fill: { color }, line: { type: "none" },
  });
}

function accentBar(slide, x, y, h, color = C.gold) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.05, h,
    fill: { color }, line: { type: "none" },
  });
}

function slideTitle(slide, text, opts = {}) {
  const { x = 0.6, y = 0.5, w = 11.5, size = 24, color = "0A0A2E" } = opts;
  slide.addText(text, {
    x, y, w, h: 0.85,
    fontSize: size, fontFace: "Georgia", bold: true,
    color, margin: 0,
  });
}

function slideNumber(slide, num, total = 11) {
  slide.addText(`${num} / ${total}`, {
    x: 12.0, y: 7.05, w: 1, h: 0.3,
    fontSize: 7.5, fontFace: "Calibri",
    color: C.lightGray, align: "right", margin: 0,
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 1: Cover (Dark)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.navy };

  // Gold accent line at top
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.04,
    fill: { color: C.gold }, line: { type: "none" },
  });

  // Moon icon (circle)
  s.addShape(pres.shapes.OVAL, {
    x: 5.9, y: 1.2, w: 1.5, h: 1.5,
    fill: { color: "1A1F35" },
    line: { color: C.gold, width: 1.5 },
  });

  // Title
  s.addText("DreamAI", {
    x: 0, y: 3.1, w: 13.33, h: 1.0,
    fontSize: 48, fontFace: "Georgia", bold: true,
    color: C.cream, align: "center", margin: 0,
  });

  // Subtitle
  s.addText("AI-Powered Image Rehearsal Therapy\nfor Nightmare Treatment", {
    x: 2.5, y: 4.1, w: 8.33, h: 0.9,
    fontSize: 16, fontFace: "Calibri",
    color: C.lightGray, align: "center", lineSpacingMultiple: 1.4,
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 5.2, w: 2.33, h: 0.02,
    fill: { color: C.gold }, line: { type: "none" },
  });

  // Partnership line
  s.addText("Built on the research and clinical framework of Dr. Michael Breus, PhD", {
    x: 2, y: 5.5, w: 9.33, h: 0.5,
    fontSize: 12, fontFace: "Calibri", italic: true,
    color: C.gold, align: "center",
  });

  // "The Sleep Doctor" subtitle
  s.addText("The Sleep Doctor", {
    x: 2, y: 5.9, w: 9.33, h: 0.35,
    fontSize: 10, fontFace: "Calibri",
    color: C.lightGray, align: "center",
  });

  // Date
  s.addText("April 2026  |  Confidential", {
    x: 0, y: 6.8, w: 13.33, h: 0.3,
    fontSize: 9, fontFace: "Calibri",
    color: "4B5563", align: "center",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 2: The Problem (Light, stats-driven)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.offWhite };
  slideNumber(s, 1);

  slideTitle(s, "Nightmares are the #1 symptom of PTSD -- and they are an independent, modifiable suicide risk factor");

  thinLine(s, 0.6, 1.5, 12);

  // Three stat blocks (from Breus research)
  const stats = [
    { num: "84%", label: "of studies confirm nightmares\nincrease suicide risk", src: "Breus research: Nightmare-Suicidality" },
    { num: "+105%", label: "suicide risk with\nfrequent nightmares", src: "Finnish cohort, 36,211 adults" },
    { num: "8M+", label: "US adults suffer from\nnightmare disorder", src: "AASM, 2023" },
  ];

  stats.forEach((st, i) => {
    const x = 0.6 + i * 4.2;
    s.addText(st.num, {
      x, y: 2.0, w: 3.8, h: 0.9,
      fontSize: 42, fontFace: "Georgia", bold: true,
      color: C.gold, margin: 0,
    });
    s.addText(st.label, {
      x, y: 2.85, w: 3.4, h: 0.7,
      fontSize: 12, fontFace: "Calibri",
      color: C.bodyText, lineSpacingMultiple: 1.3, margin: 0,
    });
    s.addText(st.src, {
      x, y: 3.55, w: 3.4, h: 0.3,
      fontSize: 8, fontFace: "Calibri", italic: true,
      color: C.lightGray, margin: 0,
    });
  });

  // Vertical separators
  s.addShape(pres.shapes.RECTANGLE, {
    x: 4.55, y: 2.0, w: 0.02, h: 1.8,
    fill: { color: C.lineGray }, line: { type: "none" },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.75, y: 2.0, w: 0.02, h: 1.8,
    fill: { color: C.lineGray }, line: { type: "none" },
  });

  // Bottom insight card -- from Breus's nightmare-suicidality research
  thinLine(s, 0.6, 4.3, 12);

  accentBar(s, 0.6, 4.6, 1.4, C.danger);
  s.addText("FROM YOUR RESEARCH", {
    x: 0.85, y: 4.55, w: 5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.danger, letterSpacing: 2, margin: 0,
  });
  s.addText(
    "In frontline COVID workers, nightmares fully mediated the link between trauma exposure and suicidal ideation, accounting for ~66% of the effect. " +
    "Treating nightmares through IRT may directly reduce suicidal thoughts. " +
    "This makes nightmare treatment not just a quality-of-life improvement -- it is a suicide prevention strategy.",
    {
      x: 0.85, y: 4.9, w: 11.5, h: 1.0,
      fontSize: 11, fontFace: "Calibri",
      color: C.bodyText, lineSpacingMultiple: 1.45, margin: 0,
    }
  );

  sourceFootnote(s, "Sources: Dr. Breus research compilation (Consensus AI), Finnish cohort study (36,211 adults), AASM 2023");
}

// ═══════════════════════════════════════════════════
// SLIDE 3: IRT Protocol -- from Breus's research (Light, two-column)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.white };
  slideNumber(s, 2);

  slideTitle(s, "IRT reduces nightmares by 70%, but the delivery model requires trained therapists that don't exist at scale");

  thinLine(s, 0.6, 1.5, 12);

  // Left column: IRT 8 elements from Breus's research
  s.addText("THE 8-ELEMENT IRT PROTOCOL", {
    x: 0.6, y: 1.75, w: 5.5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 2, margin: 0,
  });
  s.addText("From Dr. Breus's IRT research compilation", {
    x: 0.6, y: 2.0, w: 5.5, h: 0.25,
    fontSize: 8, fontFace: "Calibri", italic: true,
    color: C.lightGray, margin: 0,
  });

  const irtElements = [
    { num: "1", title: "Psychoeducation", desc: "Explain nightmares, REM, how rehearsal changes dream content" },
    { num: "2", title: "Nightmare selection", desc: "Pick one recurrent nightmare as target" },
    { num: "3", title: "Imagery skills training", desc: "Practice pleasant imagery first" },
    { num: "4", title: "Rescripting", desc: '"Change the nightmare any way you wish"' },
    { num: "5", title: "Daily rehearsal", desc: "5-20 min/day. Higher dose = better outcomes" },
    { num: "6", title: "Optional exposure", desc: "Writing/reading original nightmare" },
    { num: "7", title: "Belief/mastery work", desc: 'Challenge "nightmares can\'t change" beliefs' },
    { num: "8", title: "Homework/logging", desc: "Dream diary tracking over time" },
  ];

  irtElements.forEach((el, i) => {
    const y = 2.4 + i * 0.48;
    s.addText(el.num, {
      x: 0.6, y, w: 0.25, h: 0.3,
      fontSize: 9, fontFace: "Georgia", bold: true,
      color: C.gold, margin: 0,
    });
    s.addText(el.title, {
      x: 0.9, y, w: 2.0, h: 0.3,
      fontSize: 10, fontFace: "Calibri", bold: true,
      color: "0A0A2E", margin: 0,
    });
    s.addText(el.desc, {
      x: 2.95, y, w: 3.1, h: 0.3,
      fontSize: 9, fontFace: "Calibri",
      color: C.bodyText, margin: 0,
    });
  });

  // Vertical separator
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.4, y: 1.75, w: 0.02, h: 4.8,
    fill: { color: C.lineGray }, line: { type: "none" },
  });

  // Right column: The bottleneck
  s.addText("THE BOTTLENECK", {
    x: 6.8, y: 1.75, w: 5.5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.danger, letterSpacing: 2, margin: 0,
  });

  const bottlenecks = [
    "Requires a trained IRT therapist (few exist)",
    "4-6 weekly sessions at $150-$300 each",
    "12-week average wait for a sleep specialist",
    'Patient must imagine the ending -- most struggle',
    "No visual rehearsal tool exists anywhere",
    "Zero at-home reinforcement between sessions",
  ];

  bottlenecks.forEach((text, i) => {
    const y = 2.4 + i * 0.55;
    s.addText("\u2715", {
      x: 6.8, y, w: 0.3, h: 0.3,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: C.danger, margin: 0,
    });
    s.addText(text, {
      x: 7.15, y, w: 5.5, h: 0.35,
      fontSize: 11, fontFace: "Calibri",
      color: C.bodyText, margin: 0,
    });
  });

  // Bottom insight
  thinLine(s, 0.6, 5.9, 12);
  s.addText(
    'Key insight from your research: "Higher rehearsal dose = better outcomes" (Roth & Drerup, 2020). ' +
    'AI-generated video makes nightly rehearsal engaging -- patients watch instead of struggling to imagine.',
    {
      x: 0.6, y: 6.1, w: 12, h: 0.5,
      fontSize: 11, fontFace: "Calibri", italic: true,
      color: C.bodyText, margin: 0,
    }
  );

  sourceFootnote(s, "Sources: Krakow & Zadra (2006), Aurora et al. (2010), Roth & Drerup (2020), Dr. Breus IRT compilation");
}

// ═══════════════════════════════════════════════════
// SLIDE 4: Research-to-Product Pipeline (Dark, the money slide)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.navy };
  slideNumber(s, 3);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.04,
    fill: { color: C.gold }, line: { type: "none" },
  });

  s.addText("Your Research Powers Every Feature", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 28, fontFace: "Georgia", bold: true,
    color: C.cream, margin: 0,
  });
  s.addText("Every document you shared is embedded in the product. Here is how your clinical IP becomes working technology.", {
    x: 0.6, y: 1.1, w: 10, h: 0.4,
    fontSize: 11, fontFace: "Calibri",
    color: C.lightGray, margin: 0,
  });

  thinLine(s, 0.6, 1.65, 12, "1C2033");

  // Research-to-feature mapping rows
  const mappings = [
    {
      research: "IRT Protocol (8 elements)",
      arrow: "\u2192",
      feature: "Analysis Engine + Rescript Generator",
      detail: "AI follows Krakow's 8-step sequence: nightmare selection, rescripting with mastery/transformation/safety endings, structured rehearsal protocol",
    },
    {
      research: "Dream Diary Components",
      arrow: "\u2192",
      feature: "Voice Recorder + 15-Field Analysis",
      detail: "Captures all 9 diary dimensions: narrative, sensory details (5 channels), emotions (0-10), somatic response, waking-life links, lucidity markers",
    },
    {
      research: "Nightmare-Suicidality Link",
      arrow: "\u2192",
      feature: "Clinical Urgency & Intervention Window",
      detail: "AI identifies the turning point and intervention window -- the exact moment before peak distress where rescripting begins",
    },
    {
      research: "Dream Engineering / TDI",
      arrow: "\u2192",
      feature: "Cinematic Video Generation",
      detail: "Technology-enhanced Targeted Dream Incubation: pre-sleep video + narration replaces verbal suggestion. First-person POV matches dream perspective",
    },
    {
      research: "Sensory Stimulation Research",
      arrow: "\u2192",
      feature: "IRT Follow-Up Questions",
      detail: "AI targets 3 IRT areas: intervention window, somatic experience, sensory vividness. Uses choice framing from clinical interview protocols",
    },
    {
      research: "CBT-I Integration",
      arrow: "\u2192",
      feature: "10-Day Healing Protocol",
      detail: "Structured tracking with milestones at days 3, 5, 7, 10 based on neural pathway formation timeline from IRT evidence",
    },
  ];

  mappings.forEach((m, i) => {
    const y = 1.85 + i * 0.85;
    const isEven = i % 2 === 0;

    // Subtle alternating row background
    if (isEven) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.4, y: y - 0.05, w: 12.5, h: 0.8,
        fill: { color: "0D1120" }, line: { type: "none" },
      });
    }

    // Research source (left)
    s.addText(m.research, {
      x: 0.6, y, w: 2.8, h: 0.35,
      fontSize: 11, fontFace: "Georgia", bold: true,
      color: C.gold, margin: 0,
    });

    // Arrow
    s.addText("\u2192", {
      x: 3.5, y, w: 0.4, h: 0.35,
      fontSize: 14, fontFace: "Calibri",
      color: C.goldLight, align: "center", margin: 0,
    });

    // Feature name (middle)
    s.addText(m.feature, {
      x: 4.0, y, w: 3.2, h: 0.35,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: C.cream, margin: 0,
    });

    // Detail (right)
    s.addText(m.detail, {
      x: 7.3, y: y - 0.05, w: 5.5, h: 0.7,
      fontSize: 9.5, fontFace: "Calibri",
      color: C.lightGray, lineSpacingMultiple: 1.3, margin: 0,
    });
  });

  // Bottom emphasis
  thinLine(s, 0.6, 7.0, 12, "1C2033");
  s.addText("8 research PDFs  \u2192  6 API endpoints  \u2192  15 clinical analysis fields  \u2192  1 working product", {
    x: 0.6, y: 7.05, w: 12, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 1, margin: 0,
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 5: How Research Lives in the AI (Light, evidence slide)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.offWhite };
  slideNumber(s, 4);

  slideTitle(s, "The AI doesn't just reference your research -- it implements the clinical protocols as operational logic");

  thinLine(s, 0.6, 1.5, 12);

  // Three columns showing how research becomes AI behavior
  const implementations = [
    {
      label: "NIGHTMARE ANALYSIS",
      source: "Your dream diary + IRT research",
      items: [
        "9-type nightmare classification taxonomy",
        "5-channel sensory mapping (visual, auditory, tactile, olfactory, proprioceptive)",
        "Somatic response tracking (body + waking)",
        "NDQ framework for intensity (0-10)",
        "Core threat extraction (not surface, deep fear)",
        "Intervention window identification",
      ],
    },
    {
      label: "CLINICAL INTERVIEW",
      source: "Your IRT interview protocols",
      items: [
        "Targets 3 IRT areas per question round",
        "Intervention window (moment before peak)",
        "Somatic experience (how body holds nightmare)",
        'Choice framing ("Was it more like X or Y?")',
        "Always includes one body-focused question",
        "2 rounds max, 3 questions each = clinical pace",
      ],
    },
    {
      label: "RESCRIPTING ENGINE",
      source: "Your IRT rescripting principles",
      items: [
        "3 evidence-based approaches per nightmare",
        "Mastery: dreamer takes control/agency",
        "Transformation: threat becomes non-threatening",
        "Safety: dreamer reaches place of peace",
        "AI recommends which fits this nightmare",
        "3 scenes per ending for video generation",
      ],
    },
  ];

  implementations.forEach((impl, i) => {
    const x = 0.6 + i * 4.2;

    s.addText(impl.label, {
      x, y: 1.75, w: 3.8, h: 0.3,
      fontSize: 9, fontFace: "Calibri", bold: true,
      color: C.gold, letterSpacing: 2, margin: 0,
    });

    // Source badge
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.15, w: 3.8, h: 0.35,
      fill: { color: C.warmBg }, line: { type: "none" },
    });
    s.addText(impl.source, {
      x: x + 0.1, y: 2.15, w: 3.6, h: 0.35,
      fontSize: 9, fontFace: "Calibri", italic: true,
      color: C.bodyText, valign: "middle", margin: 0,
    });

    thinLine(s, x, 2.65, 3.8);

    impl.items.forEach((item, j) => {
      const py = 2.85 + j * 0.48;
      s.addText("\u2022", {
        x, y: py, w: 0.2, h: 0.3,
        fontSize: 10, fontFace: "Calibri",
        color: C.gold, margin: 0,
      });
      s.addText(item, {
        x: x + 0.25, y: py, w: 3.5, h: 0.38,
        fontSize: 10, fontFace: "Calibri",
        color: C.bodyText, margin: 0,
      });
    });

    // Vertical separator
    if (i < 2) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 4.05, y: 1.75, w: 0.02, h: 4.5,
        fill: { color: C.lineGray }, line: { type: "none" },
      });
    }
  });

  sourceFootnote(s, "Implementation based on: Krakow IRT taxonomy, NDQ framework, Dr. Breus dream diary research, Consensus AI compilations");
}

// ═══════════════════════════════════════════════════
// SLIDE 6: Section divider -- The Product (Dark)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.navy };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.04,
    fill: { color: C.gold }, line: { type: "none" },
  });

  s.addText("The Product", {
    x: 0, y: 2.2, w: 13.33, h: 1.0,
    fontSize: 40, fontFace: "Georgia", bold: true,
    color: C.cream, align: "center",
  });

  s.addText("Your IRT protocol, automated end-to-end.\nFrom nightmare capture to cinematic rehearsal video in 15 minutes.", {
    x: 2.5, y: 3.4, w: 8.33, h: 0.9,
    fontSize: 14, fontFace: "Calibri",
    color: C.lightGray, align: "center", lineSpacingMultiple: 1.5,
  });

  // Small note connecting to research
  s.addText("Each step below maps directly to elements from the 8-element IRT protocol", {
    x: 2.5, y: 4.6, w: 8.33, h: 0.4,
    fontSize: 10, fontFace: "Calibri", italic: true,
    color: C.gold, align: "center",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 7: 6-Step Protocol (Light, annotated with research)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.offWhite };
  slideNumber(s, 5);

  slideTitle(s, "DreamAI delivers the full IRT protocol in a single session -- each step grounded in your research");

  thinLine(s, 0.6, 1.5, 12);

  const steps = [
    {
      num: "01", title: "Record", desc: "Speak or type your nightmare. AI transcribes via Whisper.",
      research: "IRT elements 2 + 6: Nightmare selection + optional exposure",
    },
    {
      num: "02", title: "Analyze", desc: "Claude extracts 15 clinical fields: core threat, distortions, somatic response.",
      research: "Dream Diary: all 9 dimensions captured automatically",
    },
    {
      num: "03", title: "Deepen", desc: "AI asks targeted IRT questions about intervention window and body sensation.",
      research: "IRT element 3: Imagery skills + sensory vividness training",
    },
    {
      num: "04", title: "Rescript", desc: "3 alternative endings: Mastery, Transformation, Safety.",
      research: 'IRT element 4: "Change the nightmare any way you wish"',
    },
    {
      num: "05", title: "Watch", desc: "AI generates cinematic first-person POV video with narration.",
      research: "Dream Engineering: Technology-enhanced TDI (Stickgold, 2025)",
    },
    {
      num: "06", title: "Heal", desc: "10-day tracking calendar. Watch nightly. Transformation at Day 10.",
      research: "IRT elements 5 + 8: Daily rehearsal + homework/logging",
    },
  ];

  // Two rows of 3
  steps.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 4.2;
    const y = 1.8 + row * 2.6;

    // Number + Title
    s.addText(st.num, {
      x, y, w: 0.6, h: 0.35,
      fontSize: 14, fontFace: "Georgia", bold: true,
      color: C.gold, margin: 0,
    });
    s.addText(st.title, {
      x: x + 0.6, y, w: 3.2, h: 0.35,
      fontSize: 14, fontFace: "Georgia", bold: true,
      color: "0A0A2E", margin: 0,
    });

    thinLine(s, x, y + 0.42, 3.8);

    // Description
    s.addText(st.desc, {
      x, y: y + 0.55, w: 3.8, h: 0.5,
      fontSize: 10.5, fontFace: "Calibri",
      color: C.bodyText, lineSpacingMultiple: 1.3, margin: 0,
    });

    // Research annotation (warm background badge)
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: y + 1.15, w: 3.8, h: 0.42,
      fill: { color: C.warmBg }, line: { type: "none" },
    });
    accentBar(s, x, y + 1.15, 0.42);
    s.addText(st.research, {
      x: x + 0.12, y: y + 1.15, w: 3.6, h: 0.42,
      fontSize: 8, fontFace: "Calibri", italic: true,
      color: C.goldDark, valign: "middle", margin: 0,
    });
  });

  // Arrow connectors between columns
  [1, 2, 4, 5].forEach((i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    if (col === 0) return;
    const x = 0.6 + col * 4.2 - 0.35;
    const y = 1.95 + row * 2.6;
    s.addText("\u2192", {
      x, y, w: 0.3, h: 0.3,
      fontSize: 12, fontFace: "Calibri",
      color: C.lightGray, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 8: Technology stack (Light, table-like)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.white };
  slideNumber(s, 6);

  slideTitle(s, "Three AI engines power the platform: Claude for clinical intelligence, Kling for video, Whisper for voice");

  thinLine(s, 0.6, 1.5, 12);

  const engines = [
    {
      label: "CLINICAL INTELLIGENCE",
      name: "Claude Sonnet 4",
      provider: "Anthropic",
      points: [
        "15-field nightmare analysis",
        "IRT-targeted follow-up questions",
        "3 rescripted endings per session",
        "Nightmare classification taxonomy",
      ],
      cost: "$0.07-$0.15 / session",
    },
    {
      label: "VIDEO GENERATION",
      name: "Kling v2 Standard",
      provider: "fal.ai",
      points: [
        "First-person POV cinematography",
        "5-second clips, 3 per session",
        "Mood-based camera + lighting",
        "Queue-based async generation",
      ],
      cost: "$0.45-$0.90 / session",
    },
    {
      label: "VOICE CAPTURE",
      name: "Whisper",
      provider: "fal.ai",
      points: [
        "Real-time speech transcription",
        "Multi-language support",
        "Captures emotional nuance",
        "Browser-based recording",
      ],
      cost: "$0.01 / session",
    },
  ];

  engines.forEach((eng, i) => {
    const x = 0.6 + i * 4.2;

    s.addText(eng.label, {
      x, y: 1.8, w: 3.8, h: 0.3,
      fontSize: 9, fontFace: "Calibri", bold: true,
      color: C.gold, letterSpacing: 2, margin: 0,
    });

    s.addText(eng.name, {
      x, y: 2.15, w: 3.8, h: 0.4,
      fontSize: 18, fontFace: "Georgia", bold: true,
      color: "0A0A2E", margin: 0,
    });

    s.addText(eng.provider, {
      x, y: 2.55, w: 3.8, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: C.lightGray, margin: 0,
    });

    thinLine(s, x, 2.95, 3.8);

    eng.points.forEach((pt, j) => {
      const py = 3.15 + j * 0.45;
      s.addText("\u2022", {
        x, y: py, w: 0.25, h: 0.3,
        fontSize: 10, fontFace: "Calibri",
        color: C.gold, margin: 0,
      });
      s.addText(pt, {
        x: x + 0.25, y: py, w: 3.5, h: 0.3,
        fontSize: 10.5, fontFace: "Calibri",
        color: C.bodyText, margin: 0,
      });
    });

    // Cost
    thinLine(s, x, 5.2, 3.8);
    s.addText(eng.cost, {
      x, y: 5.35, w: 3.8, h: 0.3,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: C.gold, margin: 0,
    });

    if (i < 2) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 4.05, y: 1.8, w: 0.02, h: 3.8,
        fill: { color: C.lineGray }, line: { type: "none" },
      });
    }
  });

  // Total cost bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 6.0, w: 12, h: 0.55,
    fill: { color: C.warmBg }, line: { type: "none" },
  });
  s.addText("Total cost per session: $0.53 - $1.06", {
    x: 0.6, y: 6.0, w: 6, h: 0.55,
    fontSize: 13, fontFace: "Georgia", bold: true,
    color: "0A0A2E", margin: [0, 0, 0, 15],
    valign: "middle",
  });
  s.addText("vs. $150-$300 per traditional IRT session with a therapist", {
    x: 6.6, y: 6.0, w: 6, h: 0.55,
    fontSize: 11, fontFace: "Calibri",
    color: C.bodyText, valign: "middle",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 9: Clinical validation + what DreamAI adds (Light)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.offWhite };
  slideNumber(s, 7);

  slideTitle(s, "IRT has the strongest evidence base of any nightmare intervention -- DreamAI makes it accessible to millions");

  thinLine(s, 0.6, 1.5, 12);

  // Big stat blocks
  const evidence = [
    { num: "70%", label: "Nightmare\nreduction", study: "Krakow & Zadra, 2006" },
    { num: "90%", label: "Maintain gains\nat 6 months", study: "Aurora et al., 2010" },
    { num: "Level A", label: "AASM\nrecommendation", study: "AASM Position Paper" },
  ];

  evidence.forEach((ev, i) => {
    const x = 0.6 + i * 4.2;
    s.addText(ev.num, {
      x, y: 1.9, w: 3.8, h: 0.9,
      fontSize: 48, fontFace: "Georgia", bold: true,
      color: C.gold, margin: 0,
    });
    s.addText(ev.label, {
      x, y: 2.8, w: 3.8, h: 0.55,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: "0A0A2E", lineSpacingMultiple: 1.3, margin: 0,
    });
    s.addText(ev.study, {
      x, y: 3.35, w: 3.8, h: 0.3,
      fontSize: 9, fontFace: "Calibri", italic: true,
      color: C.lightGray, margin: 0,
    });
  });

  thinLine(s, 0.6, 3.9, 12);

  // What DreamAI adds (with research annotations)
  s.addText("WHAT DREAMAI ADDS TO IRT", {
    x: 0.6, y: 4.2, w: 12, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 3, margin: 0,
  });

  const adds = [
    ["AI-generated visual rehearsal", "Patients watch instead of imagine -- your TDI research shows 70-80% dream incubation success"],
    ["Clinical-grade analysis in seconds", "15-field assessment matching your dream diary protocol -- all 9 dimensions captured"],
    ["Structured 10-day protocol", "Built on your evidence that effects sustained 6-12 months, even 4+ years (Sierro 2020)"],
    ["Accessible anywhere, anytime", "No therapist required. A suicide prevention tool that reaches veterans before the 12-week wait"],
  ];

  adds.forEach((item, i) => {
    const y = 4.65 + i * 0.52;
    accentBar(s, 0.6, y, 0.38);
    s.addText(item[0], {
      x: 0.85, y: y - 0.02, w: 3.3, h: 0.38,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: "0A0A2E", margin: 0, valign: "middle",
    });
    s.addText(item[1], {
      x: 4.3, y: y - 0.02, w: 8.3, h: 0.38,
      fontSize: 10, fontFace: "Calibri",
      color: C.bodyText, margin: 0, valign: "middle",
    });
  });

  sourceFootnote(s, "Sources: Krakow (2006), Aurora (2010), Stickgold TDI (2025), Sierro et al. (2020), Dr. Breus research compilation");
}

// ═══════════════════════════════════════════════════
// SLIDE 10: Academic References + IP (Light, credibility)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.white };
  slideNumber(s, 8);

  slideTitle(s, "DreamAI is grounded in peer-reviewed research -- a foundation strong enough for clinical trials and patents");

  thinLine(s, 0.6, 1.5, 12);

  // Left column: Key references
  s.addText("RESEARCH FOUNDATION", {
    x: 0.6, y: 1.75, w: 6, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 2, margin: 0,
  });

  const refs = [
    { authors: "Krakow et al., 2001 (JAMA)", desc: "IRT RCT for sexual assault survivors with PTSD" },
    { authors: "Casement & Swanson, 2012", desc: "Meta-analysis of IRT for post-trauma nightmares" },
    { authors: "Morgenthaler et al., 2018", desc: "AASM Position Paper for nightmare treatment" },
    { authors: "Roth & Drerup, 2020", desc: "Higher rehearsal dose = better outcomes" },
    { authors: "Sierro et al., 2020", desc: "IRT effects sustained 4+ years" },
    { authors: "Mallett et al., 2024", desc: "New strategies for dream science (Trends in Cog Sci)" },
    { authors: "Stickgold et al., 2025", desc: "TDI for creativity + PTSD using EEG platform" },
    { authors: "Salvesen et al., 2024", desc: "Systematic review: sensory dream stimulation (51 studies)" },
  ];

  refs.forEach((ref, i) => {
    const y = 2.15 + i * 0.47;
    s.addText(ref.authors, {
      x: 0.6, y, w: 3.0, h: 0.3,
      fontSize: 10, fontFace: "Calibri", bold: true,
      color: "0A0A2E", margin: 0,
    });
    s.addText(ref.desc, {
      x: 3.7, y, w: 3.0, h: 0.3,
      fontSize: 9.5, fontFace: "Calibri",
      color: C.bodyText, margin: 0,
    });
  });

  // Vertical separator
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.0, y: 1.75, w: 0.02, h: 4.5,
    fill: { color: C.lineGray }, line: { type: "none" },
  });

  // Right column: What this enables
  s.addText("WHAT THIS ENABLES", {
    x: 7.4, y: 1.75, w: 5.5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 2, margin: 0,
  });

  const enables = [
    {
      title: "Clinical Trials",
      desc: "A/B test DreamAI-assisted IRT vs. standard IRT. Measurable: nightmare frequency, intensity (NDQ), sleep quality, PTSD scores.",
    },
    {
      title: "Patent Application",
      desc: "AI-generated personalized video for Image Rehearsal Therapy. Novel combination of IRT + TDI + generative video. No prior art.",
    },
    {
      title: "FDA Digital Therapeutic Path",
      desc: "Prescription digital therapeutic (PDT) for nightmare disorder. IRT already has Level A evidence -- DreamAI is a delivery mechanism.",
    },
    {
      title: "Publication",
      desc: "Pilot study publishable in Sleep, JCSM, or Dreaming. Dr. Breus as clinical author, technology as intervention.",
    },
  ];

  enables.forEach((en, i) => {
    const y = 2.25 + i * 1.05;
    accentBar(s, 7.4, y, 0.75);
    s.addText(en.title, {
      x: 7.65, y, w: 5, h: 0.3,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: "0A0A2E", margin: 0,
    });
    s.addText(en.desc, {
      x: 7.65, y: y + 0.3, w: 5, h: 0.5,
      fontSize: 10, fontFace: "Calibri",
      color: C.bodyText, lineSpacingMultiple: 1.3, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 11: The Partnership Ask (Dark, closing)
// ═══════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { fill: C.navy };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.04,
    fill: { color: C.gold }, line: { type: "none" },
  });

  s.addText("The Partnership", {
    x: 0, y: 0.6, w: 13.33, h: 0.7,
    fontSize: 36, fontFace: "Georgia", bold: true,
    color: C.cream, align: "center",
  });

  s.addText("Your clinical IP + our engineering = a product neither of us could build alone", {
    x: 2, y: 1.2, w: 9.33, h: 0.4,
    fontSize: 12, fontFace: "Calibri", italic: true,
    color: C.lightGray, align: "center",
  });

  // Two columns
  const colX1 = 1.2;
  const colX2 = 7.3;

  s.addText("DR. BREUS BRINGS", {
    x: colX1, y: 1.9, w: 5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 3, margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: colX1, y: 2.25, w: 5.2, h: 0.02,
    fill: { color: "1C2033" }, line: { type: "none" },
  });

  const breusItems = [
    "Clinical credibility and IRT expertise",
    "8 research PDFs (now embedded in product)",
    "The Sleep Doctor brand (2M+ audience)",
    "Network of sleep clinics for pilot study",
    "Media presence for patient acquisition",
    "Guidance on clinical trial design",
  ];

  breusItems.forEach((item, i) => {
    const y = 2.45 + i * 0.4;
    s.addText("\u2022", {
      x: colX1, y, w: 0.2, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: C.gold, margin: 0,
    });
    s.addText(item, {
      x: colX1 + 0.25, y, w: 5, h: 0.3,
      fontSize: 11, fontFace: "Calibri",
      color: C.cream, margin: 0,
    });
  });

  // Vertical separator
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.9, y: 1.9, w: 0.02, h: 3.5,
    fill: { color: "1C2033" }, line: { type: "none" },
  });

  s.addText("WE BRING", {
    x: colX2, y: 1.9, w: 5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 3, margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: colX2, y: 2.25, w: 5.2, h: 0.02,
    fill: { color: "1C2033" }, line: { type: "none" },
  });

  const weItems = [
    "Working MVP (live at dreamai-rho.vercel.app)",
    "Full-stack AI engineering capability",
    "Your research implemented in every AI prompt",
    "Video generation pipeline (Kling v2)",
    "Clinical analysis engine (Claude + IRT)",
    "Rapid iteration and deployment",
  ];

  weItems.forEach((item, i) => {
    const y = 2.45 + i * 0.4;
    s.addText("\u2022", {
      x: colX2, y, w: 0.2, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: C.gold, margin: 0,
    });
    s.addText(item, {
      x: colX2 + 0.25, y, w: 5, h: 0.3,
      fontSize: 11, fontFace: "Calibri",
      color: C.cream, margin: 0,
    });
  });

  // CTA
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.5, y: 5.3, w: 6.33, h: 0.65,
    fill: { color: C.gold },
    line: { type: "none" },
    rectRadius: 0.08,
  });

  s.addText("Try the live demo: dreamai-rho.vercel.app", {
    x: 3.5, y: 5.3, w: 6.33, h: 0.65,
    fontSize: 14, fontFace: "Georgia", bold: true,
    color: C.navy, align: "center", valign: "middle",
  });

  // Next steps
  thinLine(s, 1.2, 6.2, 10.9, "1C2033");
  s.addText("NEXT STEPS", {
    x: 1.2, y: 6.35, w: 3, h: 0.25,
    fontSize: 8, fontFace: "Calibri", bold: true,
    color: C.gold, letterSpacing: 2, margin: 0,
  });
  s.addText(
    "1. Live demo walkthrough    2. Define beachhead (veterans vs. survivors)    3. Pilot study design    4. Patent filing",
    {
      x: 1.2, y: 6.55, w: 11, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: C.lightGray, margin: 0,
    }
  );

  // Contact
  s.addText("Cristian Mendivelso  |  cristian.mendivelso@mahway.com", {
    x: 0, y: 7.0, w: 13.33, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: "4B5563", align: "center",
  });
}

// ═══════════════════════════════════════════════════
// Generate
// ═══════════════════════════════════════════════════
const outputPath = "docs/presentation/DreamAI-Pitch-Deck.pptx";
pres.writeFile({ fileName: outputPath })
  .then(() => console.log(`Deck created: ${outputPath}`))
  .catch((err) => console.error("Error:", err));
