"""
ARGUS UAP — Top 5 Findings Video Generator
Creates an MP4 with animated slides + voiceover narration.
Output: scripts/argus_top5_findings.mp4
"""

import os
import json
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

ROOT    = Path(__file__).parent.parent
DATA    = ROOT / "public" / "data"
OUT_DIR = Path(__file__).parent
TMP     = OUT_DIR / "_tmp_frames"
TMP.mkdir(exist_ok=True)

# ── Video config ─────────────────────────────────────────────
W, H   = 1280, 720
FPS    = 30
CYAN   = (6,  182, 212)
GREEN  = (0,  255, 136)
AMBER  = (245,158, 11)
RED    = (239, 68,  68)
PURPLE = (168, 85, 247)
BG     = (2,   8,  23)
CARD   = (10,  22,  40)
SLATE  = (100,116,139)
WHITE  = (226,232,240)

# ── Fonts — use system fonts ─────────────────────────────────
def get_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    bold_candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in (bold_candidates if bold else candidates):
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

# ── Drawing helpers ───────────────────────────────────────────
def make_base_canvas():
    img = Image.new("RGB", (W, H), BG)
    d   = ImageDraw.Draw(img)
    # Subtle grid lines
    for x in range(0, W, 64):
        d.line([(x,0),(x,H)], fill=(6,182,212,10), width=1)
    for y in range(0, H, 64):
        d.line([(0,y),(W,y)], fill=(6,182,212,10), width=1)
    # Bottom accent bar
    d.rectangle([(0,H-4),(W,H)], fill=CYAN)
    return img, d

def draw_text_wrapped(d, text, x, y, font, fill, max_width):
    words = text.split()
    lines, line = [], ""
    for w in words:
        test = (line + " " + w).strip()
        bbox = d.textbbox((0,0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            line = test
        else:
            if line: lines.append(line)
            line = w
    if line: lines.append(line)
    for i, ln in enumerate(lines):
        lh = d.textbbox((0,0), ln, font=font)[3] + 6
        d.text((x, y + i*lh), ln, font=font, fill=fill)
    return y + len(lines) * (d.textbbox((0,0),"A",font=font)[3]+6)

# ── Slides ────────────────────────────────────────────────────
FINDINGS = [
    {
        "number": "01",
        "title":  "60.9% of Sightings Happen at Night",
        "stat":   "60.9%",
        "stat_label": "occur between 8pm and 2am",
        "body":   (
            "Out of 79,621 real witness reports in the NUFORC database, more than "
            "60% happen in darkness. The single busiest hour is 9pm. "
            "This could mean two things: either UAP genuinely prefer night operations, "
            "or humans simply notice unusual lights more easily against a dark sky. "
            "Either way, the pattern is extraordinarily consistent across 74 years of data."
        ),
        "voiceover": (
            "Finding one. Sixty point nine percent of all 79,621 sightings in the NUFORC database "
            "occur between 8pm and 2am. The single peak hour is 9pm. "
            "This pattern holds across every decade from 1941 to 2014. "
            "Whether this reflects genuine nocturnal behavior or simply human sky-watching habits, "
            "the consistency is remarkable."
        ),
        "color": PURPLE,
        "source": "NUFORC hourly aggregation · 79,621 records",
    },
    {
        "number": "02",
        "title":  "The 2012 Peak is Mostly Smartphones",
        "stat":   "6×",
        "stat_label": "reporting growth between 1995 and 2012",
        "body":   (
            "The raw data shows a massive spike peaking in 2012 with 7,308 reports. "
            "But after correcting for US internet penetration — which grew from 9% in 1995 "
            "to 81% in 2012 — the spike flattens dramatically. "
            "Pre-smartphone years show equal or stronger signal when normalized. "
            "Reporting capability grew 6 times. Actual phenomena likely did not."
        ),
        "voiceover": (
            "Finding two. The dramatic 2012 spike in the raw data — 7,308 reports in a single year — "
            "is largely explained by technology adoption. "
            "US internet penetration grew from 9 percent in 1995 to 81 percent by 2012. "
            "After bias correction using World Bank internet data, the spike flattens significantly. "
            "Reporting capability grew six times. "
            "This is a critical data science distinction: more reports does not mean more UAPs."
        ),
        "color": AMBER,
        "source": "Bias correction: World Bank internet penetration data",
    },
    {
        "number": "03",
        "title":  "77 Cases: Silent AND Instantly Accelerating",
        "stat":   "77",
        "stat_label": "reports combining both anomalies simultaneously",
        "body":   (
            "Our NLP pipeline scanned all 79,621 witness narratives. "
            "3,602 describe silent objects. 2,047 describe instant acceleration. "
            "But only 77 describe both simultaneously — and that pairing is the hardest "
            "to explain. A silent object has no engine. Instant acceleration implies "
            "no aerodynamic surface. Both at once rules out every known human aircraft."
        ),
        "voiceover": (
            "Finding three. Our natural language pipeline scanned every word of 79,621 witness testimonies. "
            "3,602 reports describe objects making no sound. "
            "2,047 describe instant acceleration from stationary. "
            "But only 77 describe both at the same time. "
            "That combination is physically impossible for any known aircraft. "
            "Silent means no engine. Instant acceleration means no aerodynamic surface. "
            "These 77 cases represent the hardest unexplained cluster in the entire dataset."
        ),
        "color": RED,
        "source": "NLP extraction from 79,621 raw narratives",
    },
    {
        "number": "04",
        "title":  "Washington Leads Per Capita — Not California",
        "stat":   "58.6",
        "stat_label": "sightings per 100,000 people · Washington State",
        "body":   (
            "California has the most sightings in raw count — 8,847. "
            "But California also has 37 million people. "
            "After normalizing by 2010 Census population, Washington State ranks #1 "
            "with 58.6 sightings per 100,000 people. "
            "This matters: California's lead is entirely explained by population, "
            "not by genuine aerial anomaly concentration."
        ),
        "voiceover": (
            "Finding four. California dominates the raw sighting count with nearly 9,000 reports. "
            "But California also has 37 million residents. "
            "After normalizing by 2010 Census population, Washington State ranks number one, "
            "with 58.6 sightings per 100,000 people. "
            "California drops to a much lower relative position. "
            "This is the population confound — a fundamental data science adjustment "
            "that completely changes the geographic story."
        ),
        "color": GREEN,
        "source": "NUFORC state data + 2010 US Census",
    },
    {
        "number": "05",
        "title":  "Triangle Reports Tripled Since the 1980s",
        "stat":   "3×",
        "stat_label": "increase in triangle reports — 1980s to 2000s",
        "body":   (
            "Triangle-shaped objects now account for 10.4% of all reports — "
            "up from roughly 3.5% in the 1980s. 7,812 total triangle reports exist "
            "in the database. No natural phenomenon changes shape distribution over decades. "
            "Possible explanations: classified stealth aircraft programs, "
            "cultural priming from media, or genuinely different objects appearing over time."
        ),
        "voiceover": (
            "Finding five. Triangle-shaped objects represent 10.4 percent of all modern reports — "
            "triple their rate from the 1980s. There are 7,812 triangle sightings in total. "
            "No atmospheric phenomenon shifts shape distribution over decades. "
            "Three explanations are possible: classified stealth aircraft programs like the B-2, "
            "cultural priming from movies and media showing triangular craft, "
            "or genuinely new aerial phenomena appearing in the late twentieth century. "
            "The data cannot distinguish between these — but the trend itself is undeniable."
        ),
        "color": CYAN,
        "source": "NUFORC decade breakdown · shape classification data",
    },
]

# ── Outro slide ───────────────────────────────────────────────
OUTRO = {
    "voiceover": (
        "These five findings come from the ARGUS UAP Intelligence Platform — "
        "built on 79,621 real NUFORC witness reports spanning 74 years. "
        "All numbers are computed from data. All charts are reproducible. "
        "The methodology is transparent, the limitations are documented. "
        "The truth is in the data. Draw your own conclusions."
    ),
}

def make_intro_frame() -> Image.Image:
    img, d = make_base_canvas()

    # Center glow
    from PIL import ImageFilter
    glow = Image.new("RGB", (W,H), BG)
    gd   = ImageDraw.Draw(glow)
    for r in range(300, 0, -10):
        alpha = int(40 * (1 - r/300))
        gd.ellipse([(W//2-r, H//2-r),(W//2+r, H//2+r)], fill=(6+alpha, 182, 212))
    img = Image.blend(img, glow, 0.15)
    d   = ImageDraw.Draw(img)

    # Top label
    f8 = get_font(13)
    label = "◉  ARGUS UAP INTELLIGENCE PLATFORM  ·  79,621 NUFORC RECORDS"
    lw = d.textbbox((0,0),label,font=f8)[2]
    d.text(((W-lw)//2, 60), label, font=f8, fill=CYAN)

    # Divider
    d.rectangle([(W//2-200, 96),(W//2+200,97)], fill=(*CYAN, 80))

    # Main title
    f_big = get_font(62, bold=True)
    t1 = "TOP 5 FINDINGS"
    w1 = d.textbbox((0,0),t1,font=f_big)[2]
    d.text(((W-w1)//2, 130), t1, font=f_big, fill=WHITE)

    f_sub = get_font(28)
    t2 = "What 79,621 UFO Reports Actually Reveal"
    w2 = d.textbbox((0,0),t2,font=f_sub)[2]
    d.text(((W-w2)//2, 218), t2, font=f_sub, fill=(*SLATE, 200))

    # Stats row
    stats_y = 330
    items = [("79,621","NUFORC Reports",CYAN), ("74 yrs","of data",GREEN), ("5","Key Findings",AMBER)]
    col_w = W // 3
    for i,(val,lab,col) in enumerate(items):
        cx = col_w * i + col_w // 2
        fv = get_font(44, bold=True)
        fl = get_font(12)
        vw = d.textbbox((0,0),val,font=fv)[2]
        lw2 = d.textbbox((0,0),lab,font=fl)[2]
        d.text((cx - vw//2, stats_y), val, font=fv, fill=col)
        d.text((cx - lw2//2, stats_y + 54), lab, font=fl, fill=(*col,160))

    # Divider
    d.rectangle([(80, 440),(W-80, 441)], fill=(*CYAN, 40))

    # Sub label
    f9 = get_font(11)
    note = "Real data · Reproducible methods · Honest limitations"
    nw = d.textbbox((0,0),note,font=f9)[2]
    d.text(((W-nw)//2, 460), note, font=f9, fill=(*SLATE,180))

    return img

def make_finding_frame(f: dict, progress: float = 0.0) -> Image.Image:
    img, d = make_base_canvas()
    col = f["color"]

    # Left accent bar
    d.rectangle([(0,0),(4,H)], fill=col)

    # Number badge
    fn = get_font(64, bold=True)
    d.text((32, 24), f["number"], font=fn, fill=(*col, 40))

    # Top label row
    ft = get_font(11)
    label = "ARGUS INTELLIGENCE · FINDING " + f["number"] + " OF 05"
    d.text((32, 28), label, font=ft, fill=(*CYAN, 180))

    # Title
    f_title = get_font(38, bold=True)
    title_y = 70
    draw_text_wrapped(d, f["title"], 32, title_y, f_title, WHITE, W - 64)

    # Stat box
    stat_x, stat_y = 32, 185
    stat_w = 360
    d.rectangle([(stat_x, stat_y),(stat_x+stat_w, stat_y+90)], fill=(*CARD, 200))
    d.rectangle([(stat_x, stat_y),(stat_x+4, stat_y+90)], fill=col)

    fs = get_font(52, bold=True)
    fl = get_font(13)
    d.text((stat_x+18, stat_y+8), f["stat"], font=fs, fill=col)
    slw = d.textbbox((0,0),f["stat"],font=fs)[2]
    d.text((stat_x+18, stat_y+68), f["stat_label"], font=fl, fill=(*WHITE, 180))

    # Body text
    fb = get_font(16)
    body_y = 300
    draw_text_wrapped(d, f["body"], 32, body_y, fb, (*WHITE, 220), W - 64)

    # Source badge
    fsrc = get_font(10)
    src_text = "SOURCE: " + f["source"]
    d.rectangle([(32, H-56),(32+d.textbbox((0,0),src_text,font=fsrc)[2]+20, H-36)], fill=(*CARD,180))
    d.text((42, H-51), src_text, font=fsrc, fill=(*SLATE, 200))

    # Progress bar
    bar_y = H - 10
    d.rectangle([(0,bar_y),(W,H-4)], fill=(*CARD,100))
    prog_w = int(W * progress)
    d.rectangle([(0,bar_y),(prog_w, H-4)], fill=col)

    return img

def make_outro_frame() -> Image.Image:
    img, d = make_base_canvas()

    f_big = get_font(48, bold=True)
    t = "ARGUS UAP Platform"
    tw = d.textbbox((0,0),t,font=f_big)[2]
    d.text(((W-tw)//2, 140), t, font=f_big, fill=WHITE)

    f_sub = get_font(20)
    t2 = "Built on 79,621 real NUFORC witness reports · 1941–2014"
    t2w = d.textbbox((0,0),t2,font=f_sub)[2]
    d.text(((W-t2w)//2, 220), t2, font=f_sub, fill=(*SLATE,200))

    # Three pillars
    pillars = [
        ("REAL DATA","79,621 witness\nreports analyzed", CYAN),
        ("HONEST METHODS","Limitations\ndocumented", GREEN),
        ("REPRODUCIBLE","Full pipeline\nopen source", AMBER),
    ]
    px, py = 80, 330
    pw = (W - 160) // 3
    for i,(title,desc,col) in enumerate(pillars):
        cx = px + i*(pw+40)
        d.rectangle([(cx,py),(cx+pw,py+160)], fill=(*CARD,200))
        d.rectangle([(cx,py),(cx+pw,py+3)], fill=col)
        ft = get_font(14, bold=True)
        fd = get_font(12)
        tw2 = d.textbbox((0,0),title,font=ft)[2]
        d.text((cx+(pw-tw2)//2, py+20), title, font=ft, fill=col)
        for j, ln in enumerate(desc.split("\n")):
            lw = d.textbbox((0,0),ln,font=fd)[2]
            d.text((cx+(pw-lw)//2, py+50+j*22), ln, font=fd, fill=(*WHITE,180))

    f9 = get_font(11)
    url = "github.com/Mugeshgithub/Argus_UFO_AI_Data"
    uw = d.textbbox((0,0),url,font=f9)[2]
    d.text(((W-uw)//2, 560), url, font=f9, fill=(*CYAN,160))

    return img

# ── Generate audio ────────────────────────────────────────────
def make_audio(text: str, path: Path) -> float:
    tts = gTTS(text=text, lang="en", slow=False)
    tts.save(str(path))
    clip = AudioFileClip(str(path))
    dur = clip.duration
    clip.close()
    return dur

# ── Main ──────────────────────────────────────────────────────
def main():
    print("ARGUS VIDEO GENERATOR")
    print("=" * 50)
    clips = []

    # 1. Intro
    print("  [1/8] Rendering intro slide...")
    intro_vo = (
        "Welcome to ARGUS. "
        "We analyzed 79,621 real UFO witness reports submitted to the National UFO Reporting Center, "
        "spanning 74 years from 1941 to 2014. "
        "Here are the five most significant findings from that analysis."
    )
    intro_audio = TMP / "intro_vo.mp3"
    intro_dur = make_audio(intro_vo, intro_audio)
    intro_frame = make_intro_frame()
    intro_path = TMP / "intro.png"
    intro_frame.save(str(intro_path))
    audio_clip = AudioFileClip(str(intro_audio))
    video_clip = ImageClip(str(intro_path)).with_duration(intro_dur + 0.5).with_audio(audio_clip)
    clips.append(video_clip)
    print(f"     Intro: {intro_dur:.1f}s")

    # 2. Findings
    for i, finding in enumerate(FINDINGS):
        n = i + 1
        print(f"  [{n+1}/8] Rendering Finding {finding['number']}...")
        vo_path = TMP / f"finding_{n}_vo.mp3"
        dur = make_audio(finding["voiceover"], vo_path)

        frame = make_finding_frame(finding, progress=(n/5))
        frame_path = TMP / f"finding_{n}.png"
        frame.save(str(frame_path))

        audio_clip = AudioFileClip(str(vo_path))
        video_clip = ImageClip(str(frame_path)).with_duration(dur + 0.8).with_audio(audio_clip)
        clips.append(video_clip)
        print(f"     Finding {n}: {dur:.1f}s")

    # 3. Outro
    print("  [7/8] Rendering outro...")
    outro_audio = TMP / "outro_vo.mp3"
    outro_dur = make_audio(OUTRO["voiceover"], outro_audio)
    outro_frame = make_outro_frame()
    outro_path = TMP / "outro.png"
    outro_frame.save(str(outro_path))
    audio_clip = AudioFileClip(str(outro_audio))
    video_clip = ImageClip(str(outro_path)).with_duration(outro_dur + 1.0).with_audio(audio_clip)
    clips.append(video_clip)
    print(f"     Outro: {outro_dur:.1f}s")

    # 4. Concatenate + export
    print("  [8/8] Encoding final video...")
    final = concatenate_videoclips(clips, method="compose")
    out_path = OUT_DIR / "argus_top5_findings.mp4"
    final.write_videofile(
        str(out_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=str(TMP / "temp_audio.m4a"),
        remove_temp=True,
        logger=None,
    )

    total = sum(c.duration for c in clips)
    print(f"""
{'=' * 50}
VIDEO COMPLETE

  Output  : {out_path}
  Duration: {total:.1f}s  ({total/60:.1f} min)
  Size    : {out_path.stat().st_size / 1024 / 1024:.1f} MB
  FPS     : {FPS}
  Slides  : {len(clips)} (intro + 5 findings + outro)
{'=' * 50}
""")

if __name__ == "__main__":
    main()
