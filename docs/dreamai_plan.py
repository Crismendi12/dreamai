#!/usr/bin/env python3
"""DreamAI -- Technical & Product Plan PDF Generator"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle, Polygon, Group
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics import renderPDF
from reportlab.platypus.flowables import Flowable
import math
import os

# ── Colors ──────────────────────────────────────────────
DARK = HexColor("#0D0D0D")
DARK2 = HexColor("#1A1B23")
DARK3 = HexColor("#141520")
ORANGE = HexColor("#F97316")
ORANGE_LIGHT = HexColor("#FFF7ED")
VIOLET = HexColor("#A855F7")
GRAY = HexColor("#666666")
GRAY_LIGHT = HexColor("#9CA3AF")
GRAY_BG = HexColor("#F5F5F0")
WARM_BG = HexColor("#EDECE8")
TEXT = HexColor("#0D0D0D")
BORDER = HexColor("#E8E8E2")
GREEN = HexColor("#22C55E")
RED = HexColor("#EF4444")
BLUE = HexColor("#3B82F6")
WHITE = HexColor("#FFFFFF")

WIDTH, HEIGHT = letter

# ── Custom Flowables ────────────────────────────────────

class GradientRect(Flowable):
    """A horizontal bar with gradient from left color to right color."""
    def __init__(self, width, height, color_left, color_right):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.color_left = color_left
        self.color_right = color_right

    def draw(self):
        c = self.canv
        steps = 60
        step_w = self.width / steps
        r1, g1, b1 = self.color_left.red, self.color_left.green, self.color_left.blue
        r2, g2, b2 = self.color_right.red, self.color_right.green, self.color_right.blue
        for i in range(steps):
            t = i / steps
            r = r1 + (r2 - r1) * t
            g = g1 + (g2 - g1) * t
            b = b1 + (b2 - b1) * t
            c.setFillColor(Color(r, g, b))
            c.rect(i * step_w, 0, step_w + 1, self.height, fill=1, stroke=0)


class SectionHeader(Flowable):
    """Dark section header bar with orange accent."""
    def __init__(self, number, title, width=None):
        Flowable.__init__(self)
        self.number = number
        self.title = title
        self.w = width or (WIDTH - 2 * inch)
        self.height = 40

    def draw(self):
        c = self.canv
        c.setFillColor(DARK)
        c.roundRect(0, 0, self.w, self.height, 4, fill=1, stroke=0)
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(16, 13, self.number)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(42, 13, self.title)


class FlowBox(Flowable):
    """A rounded box with icon, title and description."""
    def __init__(self, title, desc, color=ORANGE, width=None, icon_text=None):
        Flowable.__init__(self)
        self.title = title
        self.desc = desc
        self.color = color
        self.w = width or (WIDTH - 2 * inch)
        self.height = 52
        self.icon_text = icon_text

    def draw(self):
        c = self.canv
        c.setFillColor(GRAY_BG)
        c.roundRect(0, 0, self.w, self.height, 6, fill=1, stroke=0)
        c.setFillColor(self.color)
        c.roundRect(0, 0, 4, self.height, 2, fill=1, stroke=0)
        if self.icon_text:
            c.setFillColor(self.color)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(14, self.height - 16, self.icon_text)
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(14, self.height - 18 if not self.icon_text else self.height - 30, self.title)
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 8)
        # Word wrap desc
        words = self.desc.split()
        line = ""
        y = self.height - 32 if not self.icon_text else self.height - 44
        for w in words:
            test = line + " " + w if line else w
            if c.stringWidth(test, "Helvetica", 8) > self.w - 28:
                c.drawString(14, y, line)
                y -= 10
                line = w
            else:
                line = test
        if line:
            c.drawString(14, y, line)


class MetricCard(Flowable):
    """Big number + label card."""
    def __init__(self, number, label, sublabel="", color=ORANGE, width=120, height=70):
        Flowable.__init__(self)
        self.number = number
        self.label = label
        self.sublabel = sublabel
        self.color = color
        self.w = width
        self.height = height

    def draw(self):
        c = self.canv
        c.setFillColor(WHITE)
        c.setStrokeColor(BORDER)
        c.roundRect(0, 0, self.w, self.height, 6, fill=1, stroke=1)
        c.setFillColor(self.color)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(12, self.height - 32, str(self.number))
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(12, self.height - 46, self.label)
        if self.sublabel:
            c.setFillColor(GRAY)
            c.setFont("Helvetica", 7)
            c.drawString(12, self.height - 57, self.sublabel)


class ArchitectureFlow(Flowable):
    """Visual architecture flow diagram."""
    def __init__(self, width=None):
        Flowable.__init__(self)
        self.w = width or (WIDTH - 2 * inch)
        self.height = 380

    def _draw_box(self, c, x, y, w, h, title, subtitle, color, text_color=WHITE):
        c.setFillColor(color)
        c.roundRect(x, y, w, h, 5, fill=1, stroke=0)
        c.setFillColor(text_color)
        c.setFont("Helvetica-Bold", 8)
        tw = c.stringWidth(title, "Helvetica-Bold", 8)
        c.drawString(x + (w - tw) / 2, y + h - 15, title)
        if subtitle:
            c.setFillColor(Color(text_color.red, text_color.green, text_color.blue, 0.7) if hasattr(text_color, 'red') else GRAY)
            c.setFont("Helvetica", 6.5)
            sw = c.stringWidth(subtitle, "Helvetica", 6.5)
            c.drawString(x + (w - sw) / 2, y + h - 26, subtitle)

    def _draw_arrow(self, c, x1, y1, x2, y2, color=GRAY_LIGHT):
        c.setStrokeColor(color)
        c.setLineWidth(1.5)
        c.line(x1, y1, x2, y2)
        angle = math.atan2(y2 - y1, x2 - x1)
        size = 5
        c.setFillColor(color)
        p = c.beginPath()
        p.moveTo(x2, y2)
        p.lineTo(x2 - size * math.cos(angle - 0.4), y2 - size * math.sin(angle - 0.4))
        p.lineTo(x2 - size * math.cos(angle + 0.4), y2 - size * math.sin(angle + 0.4))
        p.close()
        c.drawPath(p, fill=1, stroke=0)

    def draw(self):
        c = self.canv
        # Background
        c.setFillColor(HexColor("#FAFAF8"))
        c.roundRect(0, 0, self.w, self.height, 8, fill=1, stroke=0)

        # Title
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(16, self.height - 24, "System Architecture -- DreamAI MVP")
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 7)
        c.drawString(16, self.height - 36, "5-phase pipeline: Capture > Refine > Rescript > Generate > Rehearse")

        bw = 105
        bh = 36
        gap = 12
        startx = 20
        phase_y = self.height - 90

        # Phase boxes row 1
        phases = [
            ("CAPTURE", "3 AM voice note", DARK),
            ("REFINE", "AI follow-up Qs", HexColor("#374151")),
            ("RESCRIPT", "3 alt. endings", HexColor("#4B5563")),
            ("GENERATE", "Images + audio", ORANGE),
            ("REHEARSE", "Nightly video", VIOLET),
        ]

        for i, (title, sub, color) in enumerate(phases):
            x = startx + i * (bw + gap)
            self._draw_box(c, x, phase_y, bw, bh, title, sub, color)
            if i < len(phases) - 1:
                self._draw_arrow(c, x + bw, phase_y + bh / 2,
                                x + bw + gap, phase_y + bh / 2, ORANGE)

        # Tech stack boxes
        stack_y = phase_y - 70
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(20, stack_y + 38, "Tech Stack")

        stacks = [
            ("Web Speech API", "Browser native", HexColor("#DBEAFE"), TEXT),
            ("Whisper (fallback)", "$0.006/min", HexColor("#DBEAFE"), TEXT),
            ("Claude Sonnet", "$0.05/session", HexColor("#FEF3C7"), TEXT),
            ("Flux / DALL-E", "$0.04-0.08/img", HexColor("#FEE2E2"), TEXT),
            ("FFmpeg + TTS", "Assembly", HexColor("#D1FAE5"), TEXT),
        ]

        for i, (title, sub, color, tc) in enumerate(stacks):
            x = startx + i * (bw + gap)
            self._draw_box(c, x, stack_y, bw, bh - 4, title, sub, color, tc)

        # Data flow
        data_y = stack_y - 65
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(20, data_y + 38, "Data Layer")

        data_boxes = [
            ("Supabase Auth", "Row-level security", HexColor("#E0E7FF"), TEXT),
            ("PostgreSQL", "Dream entries, metrics", HexColor("#E0E7FF"), TEXT),
            ("Supabase Storage", "Audio, images, video", HexColor("#E0E7FF"), TEXT),
            ("Safety Engine", "Crisis detection", HexColor("#FEE2E2"), TEXT),
            ("Analytics", "Study-ready data", HexColor("#D1FAE5"), TEXT),
        ]

        for i, (title, sub, color, tc) in enumerate(data_boxes):
            x = startx + i * (bw + gap)
            self._draw_box(c, x, data_y, bw, bh - 4, title, sub, color, tc)

        # Vertical arrows connecting layers
        for i in range(5):
            x = startx + i * (bw + gap) + bw / 2
            self._draw_arrow(c, x, phase_y, x, stack_y + bh - 4, HexColor("#D1D5DB"))
            self._draw_arrow(c, x, stack_y, x, data_y + bh - 4, HexColor("#D1D5DB"))

        # Cost summary at bottom
        cost_y = data_y - 60
        c.setFillColor(DARK)
        c.roundRect(20, cost_y, self.w - 40, 42, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(32, cost_y + 24, "COST PER NIGHTMARE CYCLE")
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(32, cost_y + 6, "~$0.46")
        c.setFillColor(GRAY_LIGHT)
        c.setFont("Helvetica", 8)
        c.drawString(100, cost_y + 8, "Voice $0.01  +  AI $0.05  +  Images $0.30  +  TTS $0.10  =  100 users x 4 cycles/mo = $184/mo")


class UserFlowDiagram(Flowable):
    """User journey flow diagram."""
    def __init__(self, width=None):
        Flowable.__init__(self)
        self.w = width or (WIDTH - 2 * inch)
        self.height = 340

    def _draw_step(self, c, x, y, w, h, number, title, time, details, color):
        # Card
        c.setFillColor(WHITE)
        c.setStrokeColor(BORDER)
        c.roundRect(x, y, w, h, 6, fill=1, stroke=1)
        # Accent top
        c.setFillColor(color)
        c.roundRect(x, y + h - 4, w, 4, 2, fill=1, stroke=0)
        # Number badge
        c.setFillColor(color)
        c.circle(x + 16, y + h - 18, 10, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + 16, y + h - 21, str(number))
        # Title
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 30, y + h - 21, title)
        # Time
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 7)
        c.drawString(x + 10, y + h - 34, time)
        # Details
        c.setFont("Helvetica", 7)
        line_y = y + h - 48
        for d in details:
            c.setFillColor(color)
            c.drawString(x + 10, line_y, ">")
            c.setFillColor(GRAY)
            c.drawString(x + 20, line_y, d)
            line_y -= 11

    def draw(self):
        c = self.canv
        c.setFillColor(HexColor("#FAFAF8"))
        c.roundRect(0, 0, self.w, self.height, 8, fill=1, stroke=0)

        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(16, self.height - 24, "User Journey -- One Nightmare Cycle (7-14 days)")

        card_w = (self.w - 60) / 3
        card_h = 130
        row1_y = self.height - 170
        row2_y = row1_y - card_h - 16

        steps = [
            (1, "NIGHT CAPTURE", "3:00 AM -- 2 min", [
                "Wake from nightmare",
                "One-tap voice recording",
                "AI safety screen active",
                "Raw transcript saved",
            ], HexColor("#EF4444")),
            (2, "MORNING REFINE", "8:00 AM -- 5 min", [
                "AI asks follow-up Qs",
                "Sensory detail extraction",
                "Emotional intensity rating",
                "Dream diary auto-filled",
            ], ORANGE),
            (3, "AFTERNOON RESCRIPT", "2:00 PM -- 5 min", [
                "AI proposes 3 endings",
                "User picks or modifies",
                "Full narrative written",
                "Scene breakdown created",
            ], HexColor("#EAB308")),
            (4, "VIDEO GENERATION", "Background -- 15 min", [
                "6 scene images generated",
                "TTS narration recorded",
                "FFmpeg assembles video",
                "Push notification sent",
            ], BLUE),
            (5, "NIGHTLY REHEARSAL", "10:00 PM -- 3 min", [
                "Full-screen immersive",
                "Earbuds recommended",
                "Post-watch check-in",
                "Progress tracked",
            ], VIOLET),
            (6, "TRACK & ITERATE", "Ongoing -- daily", [
                "Nightmare freq. graphed",
                "Distress trend (0-10)",
                "AI suggests next steps",
                "Data ready for study",
            ], GREEN),
        ]

        for i, (num, title, time, details, color) in enumerate(steps):
            col = i % 3
            row = i // 3
            x = 12 + col * (card_w + 12)
            y = row1_y if row == 0 else row2_y
            self._draw_step(c, x, y, card_w, card_h, num, title, time, details, color)


class TimelineDiagram(Flowable):
    """Gantt-style timeline."""
    def __init__(self, width=None):
        Flowable.__init__(self)
        self.w = width or (WIDTH - 2 * inch)
        self.height = 260

    def draw(self):
        c = self.canv
        c.setFillColor(HexColor("#FAFAF8"))
        c.roundRect(0, 0, self.w, self.height, 8, fill=1, stroke=0)

        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(16, self.height - 24, "Development Timeline")

        # Week headers
        weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5-6", "Week 7-8"]
        labels_w = 130
        chart_w = self.w - labels_w - 30
        week_w = chart_w / len(weeks)
        header_y = self.height - 52

        for i, w in enumerate(weeks):
            x = labels_w + i * week_w
            c.setFillColor(DARK if i == 0 else HexColor("#374151"))
            c.roundRect(x, header_y, week_w - 2, 18, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            tw = c.stringWidth(w, "Helvetica-Bold", 7)
            c.drawString(x + (week_w - tw) / 2, header_y + 5, w)

        # Tasks
        tasks = [
            ("Dream Diary + Voice", 0, 1.5, ORANGE, "Core capture flow"),
            ("AI Conversation Engine", 0.5, 2, HexColor("#EAB308"), "Follow-up + rescript"),
            ("Safety Layer", 1, 2, RED, "Crisis detection, 988"),
            ("Image Generation", 1.5, 3, BLUE, "Scene-by-scene pipeline"),
            ("Video Assembly", 2, 3.5, VIOLET, "FFmpeg + TTS + music"),
            ("Rehearsal Player", 2.5, 3.5, GREEN, "Immersive full-screen"),
            ("Progress Dashboard", 3, 4.5, HexColor("#06B6D4"), "Tracking + metrics"),
            ("Pilot Study Prep", 4, 6, DARK, "IRB, recruitment, data"),
        ]

        bar_h = 18
        gap = 4
        start_y = header_y - 30

        for i, (name, start, end, color, note) in enumerate(tasks):
            y = start_y - i * (bar_h + gap)
            # Label
            c.setFillColor(TEXT)
            c.setFont("Helvetica-Bold", 7.5)
            c.drawString(10, y + 5, name)
            # Bar
            x1 = labels_w + start * week_w
            bar_w = (end - start) * week_w
            c.setFillColor(color)
            c.roundRect(x1, y, bar_w, bar_h, 3, fill=1, stroke=0)
            # Note text
            c.setFillColor(WHITE)
            c.setFont("Helvetica", 6.5)
            c.drawString(x1 + 6, y + 5, note)


class CostBreakdownChart(Flowable):
    """Visual cost breakdown."""
    def __init__(self, width=None):
        Flowable.__init__(self)
        self.w = width or (WIDTH - 2 * inch)
        self.height = 200

    def draw(self):
        c = self.canv
        c.setFillColor(HexColor("#FAFAF8"))
        c.roundRect(0, 0, self.w, self.height, 8, fill=1, stroke=0)

        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(16, self.height - 24, "Cost Analysis -- Per Nightmare Cycle")

        # Bar chart data
        items = [
            ("Voice\nCapture", 0.012, HexColor("#DBEAFE")),
            ("AI\nConversation", 0.05, HexColor("#FEF3C7")),
            ("Image\nGeneration", 0.30, ORANGE),
            ("TTS\nNarration", 0.10, HexColor("#E9D5FF")),
            ("FFmpeg\nProcessing", 0.00, HexColor("#D1FAE5")),
        ]

        max_val = 0.35
        bar_area_x = 80
        bar_area_w = self.w - 120
        bar_h = 22
        gap = 12
        start_y = self.height - 60

        for i, (label, val, color) in enumerate(items):
            y = start_y - i * (bar_h + gap)
            # Label
            c.setFillColor(TEXT)
            c.setFont("Helvetica", 7)
            for j, line in enumerate(label.split("\n")):
                c.drawRightString(bar_area_x - 8, y + 10 - j * 9, line)
            # Bar
            bw = (val / max_val) * (bar_area_w * 0.85) if val > 0 else 4
            c.setFillColor(color)
            c.roundRect(bar_area_x, y, bw, bar_h, 3, fill=1, stroke=0)
            # Value
            c.setFillColor(TEXT)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(bar_area_x + bw + 6, y + 7, f"${val:.3f}" if val > 0 else "FREE")

        # Total
        total_y = start_y - len(items) * (bar_h + gap)
        c.setFillColor(DARK)
        c.roundRect(bar_area_x, total_y, bar_area_w * 0.85, 24, 3, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(bar_area_x + 10, total_y + 7, "TOTAL PER CYCLE: $0.46")
        c.setFillColor(ORANGE)
        c.drawString(bar_area_x + 200, total_y + 7, "100 users x 4/mo = $184/mo")


class DatabaseSchema(Flowable):
    """Visual database schema."""
    def __init__(self, width=None):
        Flowable.__init__(self)
        self.w = width or (WIDTH - 2 * inch)
        self.height = 220

    def _draw_table_card(self, c, x, y, w, h, name, fields, color):
        c.setFillColor(WHITE)
        c.setStrokeColor(BORDER)
        c.roundRect(x, y, w, h, 4, fill=1, stroke=1)
        # Header
        c.setFillColor(color)
        c.roundRect(x, y + h - 20, w, 20, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        tw = c.stringWidth(name, "Helvetica-Bold", 8)
        c.drawString(x + (w - tw) / 2, y + h - 14, name)
        # Fields
        c.setFont("Helvetica", 6.5)
        for i, f in enumerate(fields):
            c.setFillColor(ORANGE if "PK" in f else (GRAY if "FK" in f else TEXT))
            c.drawString(x + 6, y + h - 34 - i * 11, f)

    def draw(self):
        c = self.canv
        c.setFillColor(HexColor("#FAFAF8"))
        c.roundRect(0, 0, self.w, self.height, 8, fill=1, stroke=0)

        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(16, self.height - 24, "Database Schema (Supabase PostgreSQL)")

        tw = 120
        th = 130
        gap = 16
        start_x = 16
        start_y = self.height - 175

        tables = [
            ("users", ["id (PK)", "email", "created_at", "onboarding_done", "sleep_device"], DARK),
            ("dream_entries", ["id (PK)", "user_id (FK)", "recorded_at", "audio_url", "transcript", "structured (jsonb)", "intensity 0-10"], ORANGE),
            ("rescripts", ["id (PK)", "entry_id (FK)", "ending_type", "narrative", "scenes (jsonb)", "video_url"], VIOLET),
            ("rehearsals", ["id (PK)", "rescript_id (FK)", "watched_at", "completion %", "feeling 0-10"], GREEN),
        ]

        for i, (name, fields, color) in enumerate(tables):
            x = start_x + i * (tw + gap)
            self._draw_table_card(c, x, start_y, tw, th, name, fields, color)
            # Draw relationship arrows
            if i > 0:
                ax1 = start_x + (i - 1) * (tw + gap) + tw
                ax2 = x
                ay = start_y + th / 2
                c.setStrokeColor(HexColor("#D1D5DB"))
                c.setLineWidth(1)
                c.line(ax1, ay, ax2, ay)


# ── Build PDF ───────────────────────────────────────────

def build_pdf():
    output_path = os.path.expanduser("~/Claude/DreamAI_Plan.pdf")
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=1 * inch,
        rightMargin=1 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    content_width = WIDTH - 2 * inch

    # Custom styles
    s_title = ParagraphStyle("DreamTitle", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=28, textColor=TEXT,
        spaceAfter=4, leading=32, alignment=TA_LEFT)

    s_subtitle = ParagraphStyle("DreamSub", parent=styles["Normal"],
        fontName="Helvetica", fontSize=12, textColor=GRAY,
        spaceAfter=20, leading=16)

    s_h1 = ParagraphStyle("H1", parent=styles["Heading1"],
        fontName="Helvetica-Bold", fontSize=18, textColor=TEXT,
        spaceBefore=24, spaceAfter=8, leading=22)

    s_h2 = ParagraphStyle("H2", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=13, textColor=TEXT,
        spaceBefore=16, spaceAfter=6, leading=16)

    s_body = ParagraphStyle("Body", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, textColor=TEXT,
        spaceAfter=8, leading=13, alignment=TA_JUSTIFY)

    s_body_sm = ParagraphStyle("BodySm", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=GRAY,
        spaceAfter=4, leading=11)

    s_accent = ParagraphStyle("Accent", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=ORANGE,
        spaceAfter=4, leading=12)

    s_quote = ParagraphStyle("Quote", parent=styles["Normal"],
        fontName="Helvetica-Oblique", fontSize=10, textColor=GRAY,
        leftIndent=20, rightIndent=20, spaceBefore=8, spaceAfter=8,
        leading=14, borderColor=ORANGE, borderWidth=0, borderPadding=0)

    story = []

    # ═══════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════

    story.append(Spacer(1, 40))
    story.append(GradientRect(content_width, 4, ORANGE, VIOLET))
    story.append(Spacer(1, 30))

    story.append(Paragraph("DreamAI", ParagraphStyle("Cover", parent=s_title,
        fontSize=42, leading=46)))
    story.append(Paragraph("Technical & Product Plan", ParagraphStyle("CoverSub",
        parent=s_subtitle, fontSize=16, textColor=GRAY)))
    story.append(Spacer(1, 16))

    story.append(HRFlowable(width=content_width, thickness=1, color=BORDER))
    story.append(Spacer(1, 16))

    story.append(Paragraph("AI-powered nightmare treatment using Image Rehearsal Therapy, "
        "dream capture, and personalized video generation to reduce nightmare frequency "
        "and support PTSD recovery.", s_body))
    story.append(Spacer(1, 24))

    # Metric cards
    cards_data = [
        ("21 min", "Military suicide rate", "1 every 21 minutes"),
        ("105%", "Increased risk", "Frequent nightmares + suicide"),
        ("7-14d", "IRT effectiveness", "Nightmare change timeline"),
        ("$0.46", "Cost per cycle", "AI image + audio + assembly"),
    ]
    card_w = (content_width - 30) / 4
    card_cells = [[MetricCard(n, l, s, ORANGE if i % 2 == 0 else VIOLET, width=card_w)
                   for i, (n, l, s) in enumerate(cards_data)]]
    cards_table = Table(card_cells, colWidths=[card_w + 10] * 4)
    cards_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(cards_table)
    story.append(Spacer(1, 30))

    # Info table
    info_data = [
        ["Project", "DreamAI -- Dream Engineering Platform"],
        ["Partners", "Dr. Michael Breus (Sleep Science) + Cristian Mendivelso (Technical)"],
        ["Target", "Military combat veterans with PTSD nightmares"],
        ["Phase", "MVP -- Functional prototype for validation study"],
        ["Date", "March 2026"],
    ]
    info_table = Table(info_data, colWidths=[1.2 * inch, content_width - 1.2 * inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), ORANGE),
        ('TEXTCOLOR', (1, 0), (1, -1), TEXT),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 2: THE PROBLEM
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("01", "THE PROBLEM"))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Nightmares are a modifiable, independent suicide risk factor",
        s_h2))
    story.append(Paragraph(
        "Research consistently shows that frequent nightmares are linked to suicidal ideation, "
        "plans, attempts, and death -- even after adjusting for depression and other disorders "
        "(Bernert 2015, Littlewood 2016). In a Finnish cohort of 36,211 adults, frequent "
        "nightmares raised suicide risk by 105% versus none (Tanskanen 2001). Among frontline "
        "COVID-19 workers, nightmares fully mediated 66% of the link between trauma exposure "
        "and suicidal ideation (Que 2022).", s_body))

    story.append(Spacer(1, 12))

    # Stats visualization
    stats = [
        ["Statistic", "Value", "Source"],
        ["Military suicide rate", "1 every 21 minutes", "DoD 2024"],
        ["Nightmare-suicide risk increase (frequent)", "+105%", "Tanskanen 2001"],
        ["Nightmare-suicide risk increase (occasional)", "+57%", "Tanskanen 2001"],
        ["Nightmare mediation of trauma-suicide link", "66%", "Que 2022"],
        ["IRT efficacy consensus", "84% of studies confirm", "Consensus.app"],
        ["IRT timeline to change nightmare", "7-14 days", "Krakow 2001"],
        ["IRT long-term effect duration", "4+ years sustained", "Sierro 2020"],
    ]
    stats_table = Table(stats, colWidths=[2.5 * inch, 1.5 * inch, 2 * inch])
    stats_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TEXTCOLOR', (1, 1), (1, -1), ORANGE),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("The opportunity", s_h2))
    story.append(Paragraph(
        "Image Rehearsal Therapy (IRT) is the gold standard for nightmare treatment -- a brief, "
        "CBT-based intervention where patients change their nightmare storyline and rehearse "
        "the new version daily. It works in 7-14 days and effects last 4+ years. But it requires "
        "a therapist, writing exercises, and mental visualization. DreamAI replaces all three "
        "with AI-guided voice capture, intelligent rescripting, and personalized video generation -- "
        "making IRT accessible to anyone with a phone.", s_body))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 3: THE SOLUTION
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("02", "THE SOLUTION"))
    story.append(Spacer(1, 16))

    story.append(Paragraph("DreamAI digitizes the IRT protocol into 6 steps", s_h2))
    story.append(Spacer(1, 8))

    story.append(UserFlowDiagram(width=content_width))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Clinical protocol mapping", s_h2))
    story.append(Spacer(1, 4))

    protocol_data = [
        ["IRT Step (Research)", "DreamAI Implementation", "Module"],
        ["1. Psychoeducation", "Onboarding flow: 60s video + interactive explainer on how IRT works and why nightmares can change", "Onboarding"],
        ["2. Nightmare selection", "User records nightmare via voice immediately after waking; AI identifies the target nightmare", "Capture"],
        ["3. Imagery skills training", "Guided pleasant visualization exercise before first rescript (safe-place exercise)", "Pre-rescript"],
        ["4. Nightmare narrative", "AI transcribes voice, asks follow-up Qs for sensory detail, auto-fills 9-field dream diary", "Refine"],
        ["5. Imagery rescripting", "AI proposes 3 alternative endings (mastery/transformation/safety); user picks or modifies", "Rescript"],
        ["6. Daily rehearsal", "AI-generated 2-3 min video with narration + ambient audio; nightly before bed", "Video + Player"],
        ["7. Tracking + follow-up", "Dashboard: nightmare frequency, distress trend, sleep quality; study-ready data", "Analytics"],
        ["8. Safety layer", "Real-time crisis language detection; immediate 988 routing + warm handoff", "Safety"],
    ]
    proto_table = Table(protocol_data, colWidths=[1.6 * inch, 3 * inch, 1.2 * inch])
    proto_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TEXTCOLOR', (2, 1), (2, -1), ORANGE),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(proto_table)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 4: ARCHITECTURE
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("03", "SYSTEM ARCHITECTURE"))
    story.append(Spacer(1, 16))

    story.append(ArchitectureFlow(width=content_width))
    story.append(Spacer(1, 16))

    story.append(DatabaseSchema(width=content_width))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 5: VIDEO GENERATION STRATEGY
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("04", "VIDEO GENERATION STRATEGY"))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Why hybrid (images + motion + audio) beats full AI video", s_h2))
    story.append(Spacer(1, 4))

    comparison = [
        ["", "Full AI Video\n(Runway/Kling)", "Hybrid Approach\n(Our Choice)", "Winner"],
        ["Cost per video", "$9.00 (18 clips)", "$0.40 (6 images + TTS)", "Hybrid (22x)"],
        ["Generation time", "40-60 minutes", "5-8 minutes", "Hybrid (8x)"],
        ["Content control", "Unpredictable frames", "Full control per scene", "Hybrid"],
        ["Trauma safety", "Risk of disturbing AI artifacts", "Every frame reviewed", "Hybrid"],
        ["Consistency", "Style varies clip to clip", "Consistent style via prompt", "Hybrid"],
        ["Immersion", "Higher motion realism", "Audio narration compensates", "Draw"],
    ]
    comp_table = Table(comparison, colWidths=[1.3 * inch, 1.5 * inch, 1.7 * inch, 1 * inch])
    comp_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TEXTCOLOR', (3, 1), (3, -1), GREEN),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('BACKGROUND', (2, 1), (2, -1), HexColor("#F0FDF4")),
        ('ROWBACKGROUNDS', (0, 1), (1, -1), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Video assembly pipeline", s_h2))
    story.append(Spacer(1, 4))

    pipeline_steps = [
        FlowBox("Scene Decomposition", "Claude AI breaks rescripted narrative into 5-6 discrete visual scenes with camera direction, mood, and key elements.", ORANGE, content_width),
        FlowBox("Image Generation (Parallel)", "Flux or DALL-E generates one image per scene. Same style prompt prefix ensures consistency. Promise.allSettled with retry.", BLUE, content_width),
        FlowBox("Narration Generation", "OpenAI TTS reads the rescripted narrative in a calm, warm voice. Paced for 2-3 minute total length.", VIOLET, content_width),
        FlowBox("FFmpeg Assembly", "Images get Ken Burns motion (slow zoom/pan). Crossfade transitions (1.5s). Narration + ambient music track layered.", GREEN, content_width),
        FlowBox("Delivery", "MP4 stored in Supabase Storage. Push notification: 'Your DreamAI session is ready.' Full-screen player with earbuds prompt.", DARK, content_width),
    ]
    for step in pipeline_steps:
        story.append(step)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 6: COST & TIMELINE
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("05", "COST ANALYSIS & TIMELINE"))
    story.append(Spacer(1, 16))

    story.append(CostBreakdownChart(width=content_width))
    story.append(Spacer(1, 12))

    # Monthly projection
    story.append(Paragraph("Monthly cost projection at scale", s_h2))
    monthly = [
        ["Users", "Cycles/mo", "API Cost", "Infra Cost", "Total/mo"],
        ["10 (pilot)", "40", "$18", "$5", "$23"],
        ["50", "200", "$92", "$10", "$102"],
        ["100 (MVP target)", "400", "$184", "$15", "$199"],
        ["500", "2,000", "$920", "$50", "$970"],
        ["1,000", "4,000", "$1,840", "$100", "$1,940"],
    ]
    monthly_table = Table(monthly, colWidths=[1.2 * inch] * 5)
    monthly_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('BACKGROUND', (0, 3), (-1, 3), HexColor("#FFF7ED")),
        ('ROWBACKGROUNDS', (0, 1), (-1, 2), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(monthly_table)
    story.append(Spacer(1, 16))

    story.append(TimelineDiagram(width=content_width))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 7: SCOPE & DECISIONS
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("06", "MVP SCOPE & KEY DECISIONS"))
    story.append(Spacer(1, 16))

    story.append(Paragraph("What we build (and what we don't)", s_h2))
    story.append(Spacer(1, 4))

    scope_data = [
        ["IN SCOPE (MVP)", "Priority", "OUT OF SCOPE (Future)"],
        ["Voice-first dream capture (1-tap)", "P0", "Wearable integration (Oura, Whoop)"],
        ["AI follow-up conversation", "P0", "VR/AR version"],
        ["Safety/crisis detection layer", "P0", "Lucid dream training module"],
        ["3-ending AI rescripting", "P0", "Therapist dashboard"],
        ["Hybrid video generation", "P0", "Native iOS/Android app"],
        ["Immersive rehearsal player", "P0", "Multi-language support"],
        ["9-field dream diary (auto-filled)", "P1", "Social/community features"],
        ["Progress dashboard + metrics", "P1", "Wearable sleep stage data"],
        ["Imagery skills training (onboarding)", "P1", "Advanced dream engineering (TDI)"],
        ["Study-ready data collection", "P1", "Real-time EEG integration"],
    ]
    scope_table = Table(scope_data, colWidths=[2.3 * inch, 0.7 * inch, 2.5 * inch])
    scope_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TEXTCOLOR', (1, 1), (1, 5), GREEN),
        ('TEXTCOLOR', (1, 6), (1, -1), ORANGE),
        ('TEXTCOLOR', (2, 1), (2, -1), GRAY),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ]))
    story.append(scope_table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("Open questions (awaiting Dr. Breus)", s_h2))
    story.append(Spacer(1, 4))

    questions = [
        ["#", "Question", "Impact on Build", "Status"],
        ["1", "Sample nightmare narrative for demo", "Needed for Thursday video demo", "SENT"],
        ["2", "Crisis/safety protocol specifics", "Defines safety layer behavior", "SENT"],
        ["3", "Literal vs symbolic video style", "Determines image generation prompts", "SENT"],
        ["4", "Imagery skills training exercise", "Onboarding guided visualization", "SENT"],
        ["5", "Writing vs speaking therapeutic value", "Voice-only vs transcript review UX", "SENT"],
        ["6", "How many rescripts per nightmare", "Defines the product loop", "SENT"],
        ["7", "Clinical outcome measures for study", "Dashboard metrics + data schema", "SENT"],
    ]
    q_table = Table(questions, colWidths=[0.3 * inch, 2 * inch, 2 * inch, 0.8 * inch])
    q_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TEXTCOLOR', (3, 1), (3, -1), ORANGE),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
    ]))
    story.append(q_table)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════
    # PAGE 8: NEXT STEPS
    # ═══════════════════════════════════════════════════════

    story.append(SectionHeader("07", "NEXT STEPS"))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Immediate actions (this week)", s_h2))
    story.append(Spacer(1, 4))

    next_steps = [
        FlowBox("MONDAY-TUESDAY: Foundation", "Set up Next.js project, Supabase database, auth flow. Build voice recording component with Web Speech API. Implement dream diary data model.", ORANGE, content_width, "MAR 17-18"),
        FlowBox("WEDNESDAY: AI + Video", "Integrate Claude API for follow-up questions and rescripting. Build image generation pipeline with Flux. Set up FFmpeg video assembly on VPS.", BLUE, content_width, "MAR 19"),
        FlowBox("THURSDAY: Demo Day", "Assemble end-to-end demo. Record walkthrough video. Present to Dr. Breus: working voice capture + at least 1 complete generated video.", GREEN, content_width, "MAR 20"),
        FlowBox("FRIDAY: Iterate", "Incorporate Breus feedback. Refine video quality. Add safety layer skeleton. Plan Week 2 sprint.", VIOLET, content_width, "MAR 21"),
    ]
    for step in next_steps:
        story.append(step)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 16))
    story.append(Paragraph("Path to pilot study", s_h2))
    story.append(Spacer(1, 4))

    pilot_data = [
        ["Phase", "Timeline", "Goal", "Users"],
        ["MVP Build", "Weeks 1-4", "Functional prototype, end-to-end flow working", "Internal testing"],
        ["Alpha Test", "Weeks 5-6", "5-10 users, Breus's patients or contacts", "5-10"],
        ["Refinement", "Weeks 7-8", "Fix issues, improve video quality, add tracking", "--"],
        ["Pilot Study", "Weeks 9-16", "Controlled study: IRT standard vs DreamAI", "50-100"],
        ["Results + Paper", "Week 16-20", "Analyze data, publish results, patent filing", "--"],
        ["Free Launch (Military)", "Week 20+", "Partner with VA / military orgs, give away free", "1,000+"],
    ]
    pilot_table = Table(pilot_data, colWidths=[1.3 * inch, 1 * inch, 2.5 * inch, 1 * inch])
    pilot_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(pilot_table)

    story.append(Spacer(1, 30))
    story.append(GradientRect(content_width, 3, ORANGE, VIOLET))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "\"We may have the opportunity to change a lot of people's lives, dude. "
        "The impact is gonna be awesome.\"", s_quote))
    story.append(Paragraph("-- Dr. Michael Breus, March 16, 2026", ParagraphStyle(
        "QuoteAttr", parent=s_body_sm, alignment=TA_RIGHT, textColor=ORANGE)))

    # Build
    doc.build(story)
    return output_path


if __name__ == "__main__":
    path = build_pdf()
    print(f"PDF generated: {path}")
