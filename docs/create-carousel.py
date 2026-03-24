"""
Generate a LinkedIn PDF carousel for REPPIT.
LinkedIn treats uploaded PDFs as swipeable carousels.

Usage: python docs/create-carousel.py
Output: docs/linkedin-carousel.pdf
"""

import os
import math
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import io

# ── Constants ──────────────────────────────────────────────────────────────────
SLIDE_W = 1080
SLIDE_H = 1080
OUTPUT = os.path.join(os.path.dirname(__file__), "linkedin-carousel.pdf")
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

# Colors
BG = HexColor("#0f172a")
ORANGE = HexColor("#f97316")
WHITE = white
MUTED = HexColor("#94a3b8")
DARK_CARD = HexColor("#1e293b")
LIGHT_TEXT = HexColor("#e2e8f0")
GREEN = HexColor("#22c55e")

# Slide data: (heading, subtitle, screenshot_filename or None)
SLIDES = [
    {
        "type": "title",
        "heading": "REPPIT",
        "subtitle": "Your AI-Powered\nStrength Profile Tracker",
        "cta": "Swipe to see what's inside",
    },
    {
        "type": "feature",
        "heading": "Your Strength Profile\nat a Glance",
        "subtitle": "One dashboard. Every lift. Your complete training picture.",
        "screenshot": "hero-dashboard.jpeg",
    },
    {
        "type": "feature",
        "heading": "Smart Targets Based\non YOUR History",
        "subtitle": "Standards calibrated from real strength data — not guesswork.",
        "screenshot": "strength-standards.jpeg",
    },
    {
        "type": "feature",
        "heading": "See What's Strong.\nFix What's Weak.",
        "subtitle": "Muscle heatmap reveals imbalances you didn't know you had.",
        "screenshot": "muscle heatmap.jpeg",
    },
    {
        "type": "feature",
        "heading": "Every Workout,\nSummarised",
        "subtitle": "End-of-day breakdown with sets, volume, and highlights.",
        "screenshot": "EOD summary.jpeg",
    },
    {
        "type": "cta",
        "heading": "Try REPPIT",
        "subtitle": "Free. No signup. Start tracking today.",
        "url": "reppit.vercel.app",
    },
]

TOTAL_SLIDES = len(SLIDES)


def draw_background(c):
    """Fill the entire slide with the dark background."""
    c.setFillColor(BG)
    c.rect(0, 0, SLIDE_W, SLIDE_H, fill=1, stroke=0)


def draw_dots(c, current_index):
    """Draw slide indicator dots at the bottom of each slide."""
    dot_radius = 6
    dot_gap = 24
    total_width = TOTAL_SLIDES * dot_radius * 2 + (TOTAL_SLIDES - 1) * dot_gap
    start_x = (SLIDE_W - total_width) / 2 + dot_radius

    y = 40

    for i in range(TOTAL_SLIDES):
        x = start_x + i * (dot_radius * 2 + dot_gap)
        if i == current_index:
            c.setFillColor(ORANGE)
            c.circle(x, y, dot_radius, fill=1, stroke=0)
        else:
            c.setFillColor(HexColor("#334155"))
            c.circle(x, y, dot_radius, fill=1, stroke=0)


def draw_rounded_rect(c, x, y, w, h, radius, fill_color=None, stroke_color=None, stroke_width=0):
    """Draw a rectangle with rounded corners."""
    p = c.beginPath()
    p.moveTo(x + radius, y)
    p.lineTo(x + w - radius, y)
    p.arcTo(x + w - radius, y, x + w, y + radius, radius)
    p.lineTo(x + w, y + h - radius)
    p.arcTo(x + w, y + h - radius, x + w - radius, y + h, radius)
    p.lineTo(x + radius, y + h)
    p.arcTo(x + radius, y + h, x, y + h - radius, radius)
    p.lineTo(x, y + radius)
    p.arcTo(x, y + radius, x + radius, y, radius)
    p.close()

    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(stroke_width)
    c.drawPath(p, fill=1 if fill_color else 0, stroke=1 if stroke_color else 0)


def draw_phone_frame(c, img_path, cx, cy, phone_h=620):
    """Draw a phone screenshot centered at (cx, cy) with a phone-like frame."""
    # Load image to get aspect ratio
    img = Image.open(img_path)
    img_w, img_h = img.size
    aspect = img_w / img_h

    # Phone dimensions
    screen_h = phone_h
    screen_w = screen_h * aspect
    frame_padding = 12
    frame_w = screen_w + frame_padding * 2
    frame_h = screen_h + frame_padding * 2
    corner_radius = 28

    frame_x = cx - frame_w / 2
    frame_y = cy - frame_h / 2

    # Phone body shadow
    c.setFillColor(Color(0, 0, 0, alpha=0.3))
    draw_rounded_rect(c, frame_x + 6, frame_y - 6, frame_w, frame_h, corner_radius + 4, fill_color=Color(0, 0, 0, alpha=0.3))

    # Phone body
    draw_rounded_rect(c, frame_x, frame_y, frame_w, frame_h, corner_radius + 4, fill_color=HexColor("#1a1a2e"))

    # Phone bezel border
    draw_rounded_rect(c, frame_x, frame_y, frame_w, frame_h, corner_radius + 4,
                      stroke_color=HexColor("#2d3748"), stroke_width=2)

    # Screen area (clip with rounded corners)
    screen_x = frame_x + frame_padding
    screen_y = frame_y + frame_padding

    c.saveState()
    # Draw the screenshot image
    c.drawImage(img_path, screen_x, screen_y, screen_w, screen_h,
                preserveAspectRatio=True, mask='auto')

    # Rounded corner mask: draw 4 corner pieces in BG color to simulate rounding
    _mask_corners(c, screen_x, screen_y, screen_w, screen_h, corner_radius)

    c.restoreState()


def _mask_corners(c, x, y, w, h, r):
    """Mask the corners of a rectangle to make them appear rounded."""
    bg = BG
    # We draw small filled shapes over each corner
    for corner in ['bl', 'br', 'tl', 'tr']:
        c.saveState()
        if corner == 'bl':
            cx, cy = x, y
            c.setFillColor(bg)
            p = c.beginPath()
            p.moveTo(cx, cy)
            p.lineTo(cx + r, cy)
            p.arcTo(cx, cy, cx + r, cy + r, r)
            p.lineTo(cx, cy + r)
            p.close()
            # Actually we want the inverse - fill the corner outside the arc
            # Use a different approach: draw a square and cut an arc
            p2 = c.beginPath()
            p2.rect(cx, cy, r, r)
            c.clipPath(p2)
            # Now draw background over everything
            c.setFillColor(bg)
            c.rect(cx, cy, r, r, fill=1, stroke=0)
            # Then draw a circle that reveals the image underneath
            # This approach is tricky in ReportLab; use simple overlay instead
        c.restoreState()

    # Simpler approach: just draw thin BG-colored arcs at each corner
    # Actually, the visual difference is minimal at PDF scale. Skip complex masking.
    # The phone frame border already provides the visual boundary.


def draw_title_slide(c, slide, index):
    """Slide 1: Title slide with REPPIT branding."""
    draw_background(c)

    # Decorative top accent bar
    bar_w = 120
    c.setFillColor(ORANGE)
    c.rect((SLIDE_W - bar_w) / 2, SLIDE_H - 160, bar_w, 5, fill=1, stroke=0)

    # Dumbbell icon (simple geometric)
    _draw_dumbbell_icon(c, SLIDE_W / 2, SLIDE_H - 280, scale=1.0)

    # "REPPIT" logo text
    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 96)
    c.drawCentredString(SLIDE_W / 2, SLIDE_H - 440, "REPPIT")

    # Tagline
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 32)
    lines = slide["subtitle"].split("\n")
    y = SLIDE_H - 510
    for line in lines:
        c.drawCentredString(SLIDE_W / 2, y, line)
        y -= 44

    # Divider line
    div_w = 300
    c.setStrokeColor(HexColor("#334155"))
    c.setLineWidth(1)
    c.line((SLIDE_W - div_w) / 2, y - 30, (SLIDE_W + div_w) / 2, y - 30)

    # "Swipe" CTA
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 26)
    c.drawCentredString(SLIDE_W / 2, y - 80, slide["cta"])

    # Arrow hint
    _draw_swipe_arrows(c, SLIDE_W / 2, y - 140)

    draw_dots(c, index)


def _draw_dumbbell_icon(c, cx, cy, scale=1.0):
    """Draw a simple geometric dumbbell icon."""
    s = scale
    c.setFillColor(ORANGE)
    # Center bar
    bar_w = 80 * s
    bar_h = 10 * s
    c.rect(cx - bar_w / 2, cy - bar_h / 2, bar_w, bar_h, fill=1, stroke=0)

    # Left weight plates
    plate_w = 16 * s
    plate_h = 50 * s
    c.rect(cx - bar_w / 2 - plate_w, cy - plate_h / 2, plate_w, plate_h, fill=1, stroke=0)
    c.rect(cx - bar_w / 2 - plate_w * 2 - 4 * s, cy - plate_h * 0.7 / 2, plate_w, plate_h * 0.7, fill=1, stroke=0)

    # Right weight plates
    c.rect(cx + bar_w / 2, cy - plate_h / 2, plate_w, plate_h, fill=1, stroke=0)
    c.rect(cx + bar_w / 2 + plate_w + 4 * s, cy - plate_h * 0.7 / 2, plate_w, plate_h * 0.7, fill=1, stroke=0)


def _draw_swipe_arrows(c, cx, cy):
    """Draw right-pointing arrows as swipe hint."""
    c.setFillColor(MUTED)
    for i in range(3):
        alpha = 1.0 - i * 0.3
        c.setFillColor(Color(0.58, 0.64, 0.72, alpha=alpha))
        x = cx + i * 24 - 24
        # Simple chevron
        p = c.beginPath()
        p.moveTo(x, cy + 12)
        p.lineTo(x + 14, cy)
        p.lineTo(x, cy - 12)
        p.lineTo(x + 5, cy - 12)
        p.lineTo(x + 19, cy)
        p.lineTo(x + 5, cy + 12)
        p.close()
        c.drawPath(p, fill=1, stroke=0)


def draw_feature_slide(c, slide, index):
    """Slides 2-5: Feature slide with heading + phone screenshot."""
    draw_background(c)

    # Heading
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 44)
    lines = slide["heading"].split("\n")
    y = SLIDE_H - 90
    for line in lines:
        c.drawCentredString(SLIDE_W / 2, y, line)
        y -= 54

    # Subtitle
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 22)
    c.drawCentredString(SLIDE_W / 2, y - 12, slide["subtitle"])

    # Phone screenshot
    img_path = os.path.join(SCREENSHOTS_DIR, slide["screenshot"])
    if os.path.exists(img_path):
        # Center phone in remaining space below subtitle
        phone_center_y = (y - 50) / 2 + 30  # centered in bottom area
        draw_phone_frame(c, img_path, SLIDE_W / 2, phone_center_y, phone_h=580)
    else:
        c.setFillColor(HexColor("#ef4444"))
        c.setFont("Helvetica", 20)
        c.drawCentredString(SLIDE_W / 2, SLIDE_H / 2, f"Missing: {slide['screenshot']}")

    draw_dots(c, index)


def draw_cta_slide(c, slide, index):
    """Slide 6: Call-to-action with URL and tech stack."""
    draw_background(c)

    # "Try REPPIT" heading
    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 72)
    c.drawCentredString(SLIDE_W / 2, SLIDE_H - 200, slide["heading"])

    # Subtitle
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 28)
    c.drawCentredString(SLIDE_W / 2, SLIDE_H - 270, slide["subtitle"])

    # URL box
    box_w = 520
    box_h = 70
    box_x = (SLIDE_W - box_w) / 2
    box_y = SLIDE_H - 400
    draw_rounded_rect(c, box_x, box_y, box_w, box_h, 16, fill_color=DARK_CARD)
    draw_rounded_rect(c, box_x, box_y, box_w, box_h, 16, stroke_color=ORANGE, stroke_width=2)

    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(SLIDE_W / 2, box_y + 22, slide["url"])

    # QR code (generate simple placeholder text since we can't easily make a real QR)
    # Draw a QR-like box with instructions
    qr_size = 160
    qr_x = (SLIDE_W - qr_size) / 2
    qr_y = SLIDE_H - 620

    # Try to generate actual QR code
    try:
        import qrcode
        qr = qrcode.make(f"https://{slide['url']}", box_size=10, border=1)
        qr_path = os.path.join(os.path.dirname(__file__), "_temp_qr.png")
        qr.save(qr_path)
        c.drawImage(qr_path, qr_x, qr_y, qr_size, qr_size)
        os.remove(qr_path)
    except ImportError:
        # Fallback: draw a stylized QR placeholder
        draw_rounded_rect(c, qr_x, qr_y, qr_size, qr_size, 12, fill_color=WHITE)
        c.setFillColor(BG)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(SLIDE_W / 2, qr_y + qr_size / 2 + 8, "SCAN")
        c.drawCentredString(SLIDE_W / 2, qr_y + qr_size / 2 - 14, "TO OPEN")

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 18)
    c.drawCentredString(SLIDE_W / 2, qr_y - 20, "Scan to open on your phone")

    # Tech stack pills
    techs = ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"]
    pill_gap = 16
    pill_h = 38
    pill_font_size = 18

    # Measure total width
    c.setFont("Helvetica", pill_font_size)
    pill_widths = [c.stringWidth(t, "Helvetica", pill_font_size) + 32 for t in techs]
    total_w = sum(pill_widths) + pill_gap * (len(techs) - 1)

    x = (SLIDE_W - total_w) / 2
    pill_y = 120

    for i, tech in enumerate(techs):
        pw = pill_widths[i]
        draw_rounded_rect(c, x, pill_y, pw, pill_h, pill_h / 2, fill_color=DARK_CARD)
        c.setFillColor(LIGHT_TEXT)
        c.setFont("Helvetica", pill_font_size)
        c.drawCentredString(x + pw / 2, pill_y + 12, tech)
        x += pw + pill_gap

    # "Built with" label
    c.setFillColor(HexColor("#475569"))
    c.setFont("Helvetica", 14)
    c.drawCentredString(SLIDE_W / 2, pill_y + pill_h + 14, "BUILT WITH")

    draw_dots(c, index)


def main():
    print(f"Generating carousel: {OUTPUT}")
    print(f"Slide size: {SLIDE_W}x{SLIDE_H}px")

    c = canvas.Canvas(OUTPUT, pagesize=(SLIDE_W, SLIDE_H))

    for i, slide in enumerate(SLIDES):
        print(f"  Slide {i + 1}/{TOTAL_SLIDES}: {slide.get('heading', '')}")

        if slide["type"] == "title":
            draw_title_slide(c, slide, i)
        elif slide["type"] == "feature":
            draw_feature_slide(c, slide, i)
        elif slide["type"] == "cta":
            draw_cta_slide(c, slide, i)

        if i < TOTAL_SLIDES - 1:
            c.showPage()

    c.save()
    print(f"\nDone! Saved to: {OUTPUT}")
    print(f"File size: {os.path.getsize(OUTPUT) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
