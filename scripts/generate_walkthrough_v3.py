"""
ARGUS Walkthrough v3 — Real screenshots, bottom-only overlay, under 2 min, findings-focused
"""
import asyncio, os, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import edge_tts

VOICE = "en-US-GuyNeural"
W, H  = 1440, 900
FPS   = 30
OUT   = Path(__file__).parent / "argus_walkthrough_v3.mp4"
SHOTS = Path("/tmp")

# ── TTS ──────────────────────────────────────────────────────────
async def _tts(text, path):
    await edge_tts.Communicate(text, voice=VOICE, rate="+15%").save(str(path))
    from moviepy import AudioFileClip
    a = AudioFileClip(str(path)); d = a.duration; a.close(); return d

def speak(text, path):
    return asyncio.run(_tts(text, path))

# ── Drawing ───────────────────────────────────────────────────────
CYAN   = (6, 182, 212)
AMBER  = (245, 158, 11)
GREEN  = (0, 255, 136)
RED    = (239, 68, 68)
PURPLE = (139, 92, 246)
WHITE  = (255, 255, 255)
DARK   = (2, 8, 23)

def _font(size, bold=False):
    size = max(size, 9)
    for p in ["/System/Library/Fonts/Helvetica.ttc",
              "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf"]:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: continue
    return ImageFont.load_default()

def load_shot(name):
    p = SHOTS / f"{name}.png"
    img = Image.open(p).convert("RGB") if p.exists() else Image.new("RGB", (W, H), DARK)
    # Fit screenshot inside frame: leave 72px at bottom for overlay
    FRAME_H = H - 72
    # Scale screenshot to width W, then crop/pad height
    ratio = W / img.width
    new_h = int(img.height * ratio)
    img = img.resize((W, new_h), Image.LANCZOS)
    # Crop to FRAME_H from top (shows the website naturally)
    if new_h >= FRAME_H:
        img = img.crop((0, 0, W, FRAME_H))
    # Place on canvas
    canvas = Image.new("RGB", (W, H), DARK)
    canvas.paste(img, (0, 0))
    return canvas

def add_bottom_bar(img, title, accent, page, total, finding=None):
    out = img.copy()
    d   = ImageDraw.Draw(out, "RGBA")
    BAR_Y = H - 72
    # dark bottom bar
    d.rectangle([(0, BAR_Y), (W, H)], fill=(*DARK, 235))
    # accent line at top of bar
    d.rectangle([(0, BAR_Y), (W, BAR_Y+2)], fill=(*accent, 255))
    # left accent strip
    d.rectangle([(0, BAR_Y), (4, H)], fill=(*accent, 255))
    # title
    d.text((16, BAR_Y+6), title.upper(), font=_font(13, bold=True), fill=WHITE)
    # finding highlight
    if finding:
        d.text((16, BAR_Y+30), f"◈  {finding}", font=_font(10), fill=(*accent, 230))
    # progress dots
    dot_x = W - 20 - (total * 18)
    for i in range(total):
        col = (*accent, 255) if i+1 == page else (*WHITE, 60)
        cx = dot_x + i*18 + 8
        cy = BAR_Y + 36
        d.ellipse([(cx-5, cy-5), (cx+5, cy+5)], fill=col)
    # progress bar
    d.rectangle([(0, H-3), (W, H)], fill=(*DARK, 180))
    d.rectangle([(0, H-3), (int(W*page/total), H)], fill=(*accent, 255))
    return out

# ── Slides — tight narration, key findings only ───────────────────
SLIDES = [
    {
        "shot":    "ss_landing",
        "title":   "ARGUS — UAP Intelligence Command",
        "accent":  CYAN,
        "finding": "79,621 real NUFORC reports · AI-powered analysis · zero fabrication",
        "vo": (
            "ARGUS is a full AI investigation system — not a UFO blog. "
            "We analyzed seventy-nine thousand real sightings from the National UFO Reporting Center "
            "and built a data science pipeline to find what humans miss at scale. "
            "Here's what we found."
        ),
    },
    {
        "shot":    "ss_dashboard",
        "title":   "Mission Overview — Live Command Center",
        "accent":  CYAN,
        "finding": "79,621 reports · 1,045 verified cases · 207 high-priority anomalies",
        "vo": (
            "The command center surfaces the big picture instantly. "
            "Seventy-nine thousand reports analyzed. One thousand and forty-five verified cases. "
            "Two hundred and seven high-priority anomalies flagged by the scoring model. "
            "The global map plots every real sighting — triangles, lights, discs — "
            "color-coded by shape. The live feed on the right streams the highest-scoring reports in real time."
        ),
    },
    {
        "shot":    "ss_research",
        "title":   "Analyze — The Core Findings",
        "accent":  CYAN,
        "finding": "61% at night · 2012 spike is smartphone bias · Washington #1 per capita",
        "vo": (
            "Three major findings from the data. "
            "First: sixty-one percent of sightings happen between eight p-m and two a-m — "
            "consistent across all seventy-four years. "
            "Second: the 2012 spike is a smartphone reporting artifact — "
            "normalize for internet penetration and it nearly flattens. "
            "Third: California looks like the hotspot until you control for population. "
            "Washington State is actually number one — fifty-eight point six sightings per hundred thousand people."
        ),
    },
    {
        "shot":    "ss_extract",
        "title":   "Extract — What the NLP Pipeline Found",
        "accent":  AMBER,
        "finding": "77 cases: silent flight + instant acceleration simultaneously",
        "vo": (
            "Our rule-based NLP pipeline reads every raw report and extracts "
            "shape, speed, movement, duration, and military context. "
            "The standout discovery: seventy-seven cases describe silent flight "
            "combined with instant acceleration at the same time — "
            "behaviors that are physically inconsistent with any known conventional aircraft. "
            "These are the hardest cases to explain away."
        ),
    },
    {
        "shot":    "ss_insights",
        "title":   "Key Findings — Computed from Real Data",
        "accent":  GREEN,
        "finding": "10.4% triangles · 56% under 5 min · 1,845 military-context reports",
        "vo": (
            "Six stats — all computed directly from raw data, nothing fabricated. "
            "Ten point four percent of reports describe triangles. "
            "Fifty-six percent last under five minutes. "
            "One thousand eight hundred and forty-five reports reference military context. "
            "Summer sightings run one point six times higher than winter. "
            "Two hundred and seven reports use explicit physics-violation language. "
            "Open, auditable, fully sourced."
        ),
    },
]

# ── Main ──────────────────────────────────────────────────────────
def main():
    from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

    print("ARGUS WALKTHROUGH v3 — Under 2 min, findings-focused")
    print("=" * 56)

    clips  = []
    total  = len(SLIDES)

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        for i, s in enumerate(SLIDES, 1):
            label = s["title"].split("—")[0].strip()
            print(f"  [{i}/{total}] {label} ...", end=" ", flush=True)

            img = load_shot(s["shot"])
            img = add_bottom_bar(img, s["title"], s["accent"], i, total, s.get("finding"))
            frame_path = tmp / f"frame_{i:02d}.png"
            img.save(str(frame_path))

            audio_path = tmp / f"audio_{i:02d}.mp3"
            dur = speak(s["vo"], audio_path)
            print(f"{dur:.1f}s")

            clip = (
                ImageClip(str(frame_path))
                .with_duration(dur + 0.5)
                .with_audio(AudioFileClip(str(audio_path)))
            )
            clips.append(clip)

        print("\n  Encoding ...", flush=True)
        final = concatenate_videoclips(clips, method="compose")
        final.write_videofile(str(OUT), fps=FPS, codec="libx264", audio_codec="aac", logger=None)

    total_dur = sum(c.duration for c in clips)
    size_mb   = OUT.stat().st_size / 1_048_576
    print(f"\n  Done! {total_dur:.0f}s ({total_dur/60:.1f} min) · {size_mb:.1f} MB")
    print(f"  {OUT}")

if __name__ == "__main__":
    main()
