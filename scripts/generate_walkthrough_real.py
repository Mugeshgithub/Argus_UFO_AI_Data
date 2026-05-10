"""
ARGUS Walkthrough Video — Real app screenshots + Edge TTS male voice
"""
import asyncio, os, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import edge_tts
import tempfile

VOICE   = "en-US-GuyNeural"
W, H    = 1440, 900
FPS     = 30
OUT     = Path(__file__).parent / "argus_walkthrough_real.mp4"
SHOTS   = Path("/tmp")

# ── TTS ──────────────────────────────────────────────────────────
async def _tts(text: str, path: Path) -> float:
    c = edge_tts.Communicate(text, voice=VOICE, rate="+0%", pitch="+0Hz")
    await c.save(str(path))
    from moviepy import AudioFileClip
    a = AudioFileClip(str(path))
    d = a.duration
    a.close()
    return d

def speak(text: str, path: Path) -> float:
    return asyncio.run(_tts(text, path))

# ── Overlay helpers ───────────────────────────────────────────────
def load_shot(name: str) -> Image.Image:
    p = SHOTS / f"{name}.png"
    if p.exists():
        img = Image.open(p).convert("RGB")
        if img.size != (W, H):
            img = img.resize((W, H), Image.LANCZOS)
        return img
    # fallback blank
    return Image.new("RGB", (W, H), (2, 8, 23))

CYAN   = (6, 182, 212)
AMBER  = (245, 158, 11)
GREEN  = (0, 255, 136)
RED    = (239, 68, 68)
WHITE  = (255, 255, 255)
DARK   = (0, 0, 0)

def _font(size: int, bold: bool = False):
    size = max(size, 9)
    paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: continue
    return ImageFont.load_default()

def overlay_bar(img: Image.Image, title: str, subtitle: str, accent: tuple, page: int, total: int) -> Image.Image:
    """Add a dark top bar with title + page counter over the screenshot."""
    out = img.copy()
    d   = ImageDraw.Draw(out, "RGBA")
    # semi-transparent top bar
    d.rectangle([(0, 0), (W, 64)], fill=(*DARK, 210))
    d.rectangle([(0, 62), (W, 65)], fill=(*accent, 220))
    d.rectangle([(0, 0), (5, 64)], fill=(*accent, 255))
    # page badge
    badge = f"PAGE {page}/{total}"
    d.text((16, 8),  badge.upper(), font=_font(9), fill=(*accent, 200))
    d.text((16, 24), title.upper(), font=_font(20, bold=True), fill=WHITE)
    d.text((16, 50), subtitle,       font=_font(9),  fill=(148, 163, 184, 210))
    # bottom progress bar
    d.rectangle([(0, H-6), (W, H)], fill=(*DARK, 180))
    d.rectangle([(0, H-6), (int(W * page / total), H)], fill=(*accent, 230))
    return out

# ── Slide definitions ─────────────────────────────────────────────
SLIDES = [
    {
        "shot":    "ss_landing",
        "title":   "ARGUS — UAP Intelligence Command",
        "sub":     "Not a UFO blog. An AI investigation system built on 79,621 real reports.",
        "accent":  CYAN,
        "vo": (
            "Welcome to ARGUS — the UAP Intelligence Command platform. "
            "This is not a UFO blog. It's a full AI investigation system "
            "built on seventy-nine thousand, six hundred and twenty-one real reports "
            "from the National UFO Reporting Center, spanning 1941 to 2014. "
            "The platform collects unstructured anomaly reports, runs them through "
            "an AI pipeline, and surfaces the patterns humans miss at scale. "
            "Let's walk through every page."
        ),
    },
    {
        "shot":    "ss_dashboard",
        "title":   "Mission Overview — Live Intelligence Dashboard",
        "sub":     "Real-time global map · anomaly feed · credibility scores · statistical panels",
        "accent":  CYAN,
        "vo": (
            "The Mission Overview is your operational command center. "
            "At the top you see four headline numbers: seventy-nine thousand reports analyzed, "
            "one thousand and forty-five verified cases, one thousand and sixty credibility-scored incidents, "
            "and two hundred and seven high-priority anomalies. "
            "The center panel is a global heat map — every dot is a real sighting, "
            "colored by shape category: triangles, lights, discs, fireballs. "
            "Below that, three analytical panels break down sightings by year, "
            "shape distribution with a donut chart, and state interpretation confidence. "
            "On the right, the live anomaly feed streams the highest-scoring recent reports "
            "with severity tags and behavior flags. "
            "At the bottom, collaborator panels show evidence cards for the most significant cases."
        ),
    },
    {
        "shot":    "ss_collect",
        "title":   "Collect — Data Sources & Ingestion",
        "sub":     "79,621 NUFORC records · Pentagon files · pilot testimonies · radar logs",
        "accent":  GREEN,
        "vo": (
            "The Collect page shows exactly where the data comes from. "
            "The primary source is the National UFO Reporting Center — NUFORC — "
            "seventy-nine thousand six hundred and twenty-one public sightings "
            "covering seventy-four years from 1940 to 2014. "
            "Additional sources include Pentagon declassified files, "
            "pilot testimonies from commercial and military aviators, "
            "radar cross-reference logs, and NASA incident records. "
            "All raw data is funneled into a single structured database "
            "before the extraction pipeline processes it."
        ),
    },
    {
        "shot":    "ss_extract",
        "title":   "Extract — NLP Pipeline: Raw Text → Structured Fields",
        "sub":     "Rule-based NLP · shape · speed · movement · military context · 77 anomalous cases",
        "accent":  AMBER,
        "vo": (
            "Extract is the engine room of ARGUS. "
            "A natural language processing pipeline reads every raw report "
            "and converts unstructured witness text into structured fields. "
            "It extracts: object shape, estimated speed, movement pattern, "
            "duration, location, whether military assets were mentioned, "
            "and explicit physics-violation language. "
            "The pipeline uses rule-based regex matching — no external API, no hallucinations, "
            "fully auditable and reproducible. "
            "The most important discovery here: seventy-seven cases combine "
            "silent flight with instant acceleration simultaneously — "
            "behaviors that are hardest to explain with conventional aircraft. "
            "The witness testimony cards on the right show verbatim extracts "
            "from these high-anomaly reports."
        ),
    },
    {
        "shot":    "ss_research",
        "title":   "Analyze — Research Dashboard with Real NUFORC Data",
        "sub":     "79,621 records · bias-corrected trends · per-capita state ranking · key Q&A",
        "accent":  CYAN,
        "vo": (
            "The Analyze page is the core data science layer of ARGUS. "
            "Five headline stats computed from real data: "
            "seventy-nine thousand six hundred and twenty-one total reports, "
            "peak sighting year 2012, sixty-one percent occurring at night, "
            "median duration three minutes, and seven thousand eight hundred and twelve triangle reports. "
            "The year chart below plots raw sightings from 1940 to 2024. "
            "You can toggle to bias-corrected mode — this normalizes for internet penetration, "
            "because the 2012 spike is partly a reporting artifact from smartphone adoption, "
            "not necessarily more actual sightings. "
            "Filter by shape, adjust the year range slider, "
            "and export the filtered dataset as CSV or JSON. "
            "Scroll down and you'll find the per-capita state ranking — "
            "Washington State ranks number one at 58.6 sightings per hundred thousand people, "
            "not California, once you control for population. "
            "Below that, eight key research questions are each answered directly with a computed statistic."
        ),
    },
    {
        "shot":    "ss_cluster",
        "title":   "Cluster — Behavioral Grouping by Pattern",
        "sub":     "6 behavioral clusters · silent+instant · high-altitude · formation · military zone",
        "accent":  (139, 92, 246),
        "vo": (
            "The Cluster page groups all reports by behavioral signature — "
            "not by what witnesses said, but by what the extracted fields show. "
            "Six clusters emerge from the data. "
            "Cluster one: silent flight combined with instant acceleration — the rarest and most anomalous. "
            "Cluster two: high-altitude hovering with no propulsion visible. "
            "Cluster three: formation patterns — multiple objects moving in coordinated geometry. "
            "Cluster four: proximity to military installations or restricted airspace. "
            "Cluster five: electromagnetic interference reports — vehicle stalls, radio blackouts. "
            "Cluster six: close encounter cases with physical trace evidence mentioned. "
            "Each cluster panel shows the count, a behavioral description, "
            "and a confidence score based on how many extraction fields fired."
        ),
    },
    {
        "shot":    "ss_score",
        "title":   "Score — Credibility Ranking System",
        "sub":     "Multi-factor scoring · radar confirmation · military witness · physical traces",
        "accent":  RED,
        "vo": (
            "The Score page ranks every incident by a multi-factor credibility model. "
            "The scoring stack considers: "
            "whether radar confirmation is mentioned, "
            "whether the witness is a pilot or military professional, "
            "whether physical trace evidence was documented, "
            "whether multiple independent witnesses corroborate the account, "
            "and whether the report contains explicit physics-violation language. "
            "The top ten highest-scoring incidents are listed with their factor breakdown. "
            "This is not about believing the witness — it's about measuring "
            "how many independently verifiable signals a report contains. "
            "High-scoring cases are flagged for deeper review in the Cases archive."
        ),
    },
    {
        "shot":    "ss_map",
        "title":   "Visualize — Global Intelligence Map",
        "sub":     "Geographic heat map · 40 countries · state-level density · shape filtering",
        "accent":  CYAN,
        "vo": (
            "The Visualize page renders all sightings on an interactive global map. "
            "Forty countries are represented in the dataset. "
            "The United States accounts for eighty-one percent of all reports — "
            "a reporting bias, not necessarily a geographic phenomenon. "
            "Each dot on the map is a real report, colored by object shape. "
            "The heat overlay shows density clusters — "
            "the Pacific Northwest, the Southwest corridor, and the Great Lakes region "
            "show the highest per-area concentration. "
            "You can filter by shape, year range, and severity to isolate patterns."
        ),
    },
    {
        "shot":    "ss_insights",
        "title":   "Insights — Key Statistical Findings",
        "sub":     "6 computed stats from real data · no fabrication · fully sourced",
        "accent":  GREEN,
        "vo": (
            "The Insights page distills the six most important statistics "
            "computed directly from the seventy-nine thousand reports. "
            "Sixty point nine percent of sightings occur between eight p m and two a m — "
            "computed from real hourly data, not estimated. "
            "Fifty-six percent of sightings last under five minutes. "
            "Ten point four percent describe triangle-shaped objects. "
            "One thousand eight hundred and forty-five reports contain explicit military context. "
            "Sightings in summer are one point six times more common than winter. "
            "And two hundred and seven reports use explicit physics-violation language — "
            "rare, but real and measurable."
        ),
    },
    {
        "shot":    "ss_livefeed",
        "title":   "Live Feed — Real-Time Anomaly Stream",
        "sub":     "Filtered by severity · shape · behavior tags · exportable",
        "accent":  RED,
        "vo": (
            "The Live Feed page streams the most recent and highest-scoring anomaly reports "
            "in a filterable card layout. "
            "Each card shows the severity classification, object type, "
            "location, year, a summary of the witness account, "
            "and behavior tags extracted by the NLP pipeline — "
            "tags like silent flight, instant acceleration, radar confirmation, "
            "military proximity, and formation pattern. "
            "Filter the feed by severity level, object shape, or behavior tag "
            "to narrow in on specific incident types. "
            "This is your real-time triage interface for the full dataset."
        ),
    },
]

# ── Main ──────────────────────────────────────────────────────────
def main():
    from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

    print("ARGUS WALKTHROUGH — Real App Screenshots + GuyNeural Voice")
    print("=" * 60)

    clips = []
    total = len(SLIDES)

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        for i, slide in enumerate(SLIDES, 1):
            label = slide["title"].split("—")[0].strip()
            print(f"  [{i}/{total}] {label} ...")

            # Load real screenshot
            img = load_shot(slide["shot"])

            # Add overlay bar
            img = overlay_bar(img, slide["title"], slide["sub"], slide["accent"], i, total)

            # Save frame
            frame_path = tmp / f"frame_{i:02d}.png"
            img.save(str(frame_path))

            # TTS
            audio_path = tmp / f"audio_{i:02d}.mp3"
            dur = speak(slide["vo"], audio_path)
            print(f"     Audio: {dur:.1f}s")

            # Build clip
            clip = (
                ImageClip(str(frame_path))
                .with_duration(dur + 0.8)
                .with_audio(AudioFileClip(str(audio_path)))
            )
            clips.append(clip)

        print()
        print("  Encoding video ...")
        final = concatenate_videoclips(clips, method="compose")
        final.write_videofile(
            str(OUT),
            fps=FPS,
            codec="libx264",
            audio_codec="aac",
            logger=None,
        )

    size_mb = OUT.stat().st_size / 1_048_576
    dur_s   = sum(c.duration for c in clips)
    print()
    print("=" * 60)
    print(f"  Output  : {OUT}")
    print(f"  Duration: {dur_s:.0f}s  ({dur_s/60:.1f} min)")
    print(f"  Size    : {size_mb:.1f} MB")
    print(f"  Slides  : {total} real app pages")
    print(f"  Voice   : {VOICE}")
    print("=" * 60)

if __name__ == "__main__":
    main()
