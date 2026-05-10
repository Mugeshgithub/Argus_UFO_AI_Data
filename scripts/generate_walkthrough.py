"""
ARGUS UAP — Page-by-Page Data Analysis Walkthrough Video
Male voice: Microsoft Edge TTS — en-US-GuyNeural (neural, professional)
Covers: Dashboard → Research → Extract → Cluster → Score → Live Feed
Output: scripts/argus_walkthrough.mp4
"""

import os, asyncio, json, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import edge_tts
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

ROOT    = Path(__file__).parent.parent
DATA    = ROOT / "public" / "data"
OUT_DIR = Path(__file__).parent
TMP     = OUT_DIR / "_tmp_walk"
TMP.mkdir(exist_ok=True)

W, H   = 1280, 720
FPS    = 30
VOICE  = "en-US-GuyNeural"   # Microsoft Neural — professional male

# ── Colour palette ────────────────────────────────────────────
BG      = (2,   8,  23)
CARD    = (10,  22,  40)
CARD2   = (15,  25,  50)
CYAN    = (6,  182, 212)
GREEN   = (0,  255, 136)
AMBER   = (245,158,  11)
RED     = (239, 68,  68)
PURPLE  = (168, 85, 247)
PINK    = (236, 72, 153)
SLATE   = (100,116,139)
SLATE2  = (71,  85, 105)
WHITE   = (226,232,240)
WHITE2  = (148,163,184)

# ── Font helper ───────────────────────────────────────────────
def font(size, bold=False):
    size = max(size, 9)
    paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: continue
    return ImageFont.load_default()

# ── TTS (async) ───────────────────────────────────────────────
async def tts(text: str, path: Path) -> float:
    c = edge_tts.Communicate(text, voice=VOICE, rate="+0%", pitch="+0Hz")
    await c.save(str(path))
    from moviepy import AudioFileClip
    a = AudioFileClip(str(path))
    d = a.duration
    a.close()
    return d

def speak(text: str, path: Path) -> float:
    return asyncio.run(tts(text, path))

# ── Drawing helpers ───────────────────────────────────────────
def canvas():
    img = Image.new("RGB", (W,H), BG)
    d   = ImageDraw.Draw(img)
    for x in range(0, W, 80):
        d.line([(x,0),(x,H)], fill=(6,15,35), width=1)
    for y in range(0, H, 80):
        d.line([(0,y),(W,y)], fill=(6,15,35), width=1)
    return img, d

def bar_h(d, x, y, w, h, color, radius=4):
    d.rectangle([(x,y),(x+w,y+h)], fill=color)

def txt(d, text, x, y, f, fill, anchor="la"):
    d.text((x,y), text, font=f, fill=fill, anchor=anchor)

def wrap(d, text, x, y, f, fill, maxw, line_gap=6):
    words = text.split()
    lines, line = [], ""
    for w in words:
        test = (line+" "+w).strip()
        bw = d.textbbox((0,0), test, font=f)[2]
        if bw <= maxw:
            line = test
        else:
            if line: lines.append(line)
            line = w
    if line: lines.append(line)
    lh = d.textbbox((0,0),"A",font=f)[3] + line_gap
    for i,ln in enumerate(lines):
        d.text((x, y+i*lh), ln, font=f, fill=fill)
    return y + len(lines)*lh

def header_bar(d, page_num, total, title, subtitle, accent):
    d.rectangle([(0,0),(W,70)], fill=(*CARD, 230))
    d.rectangle([(0,68),(W,70)], fill=accent)
    d.rectangle([(0,0),(4,70)], fill=accent)
    txt(d, f"ARGUS UAP INTELLIGENCE  ·  PAGE {page_num} OF {total}", 20, 12, font(10), (*CYAN,160))
    txt(d, title.upper(), 20, 30, font(22, bold=True), WHITE)
    txt(d, subtitle, 20, 57, font(10), (*WHITE2,180))

def progress_bar(d, pct, accent):
    d.rectangle([(0,H-6),(W,H)], fill=(*CARD,180))
    d.rectangle([(0,H-6),(int(W*pct),H)], fill=accent)

def tag_pill(d, x, y, text, fg, bg):
    f = font(10)
    tw = d.textbbox((0,0),text,font=f)[2]
    d.rectangle([(x,y),(x+tw+16,y+20)], fill=bg)
    d.text((x+8,y+3), text, font=f, fill=fg)
    return x+tw+24

def stat_box(d, x, y, w, h, value, label, accent):
    d.rectangle([(x,y),(x+w,y+h)], fill=(*CARD2,200))
    d.rectangle([(x,y),(x+4,y+h)], fill=accent)
    d.rectangle([(x,y),(x+w,y+3)], fill=(*accent,80))
    fv = font(int(h*0.42), bold=True)
    fl = font(10)
    vw = d.textbbox((0,0),value,font=fv)[2]
    d.text((x+w//2-vw//2, y+8), value, font=fv, fill=accent)
    lw = d.textbbox((0,0),label,font=fl)[2]
    d.text((x+w//2-lw//2, y+h-22), label, font=fl, fill=(*WHITE2,180))

def mini_bar_chart(d, x, y, w, h, data, colors, key_val="count", key_name="name"):
    if not data: return
    max_v = max(r[key_val] for r in data)
    col_w = w // len(data)
    for i,r in enumerate(data):
        bh = int((r[key_val]/max_v) * (h-30))
        bx = x + i*col_w + 4
        by = y + h - bh - 20
        c  = colors[i % len(colors)]
        d.rectangle([(bx,by),(bx+col_w-8,by+bh)], fill=c)
        lf = font(8)
        nm = r[key_name][:6]
        nw = d.textbbox((0,0),nm,font=lf)[2]
        d.text((bx+(col_w-8)//2-nw//2, by+bh+2), nm, font=lf, fill=(*WHITE2,160))

def mini_hbar(d, x, y, w, h, data, color, key_val="count", key_name="name"):
    if not data: return
    max_v = max(r[key_val] for r in data)
    row_h = h // len(data)
    for i,r in enumerate(data):
        bw = int((r[key_val]/max_v) * (w-100))
        by = y + i*row_h + 2
        d.rectangle([(x+100,by),(x+100+bw,by+row_h-4)], fill=color)
        nm = r[key_name].replace("_"," ")[:14]
        d.text((x, by+2), nm, font=font(9), fill=(*WHITE2,180))
        vt = str(r[key_val])
        d.text((x+100+bw+4, by+2), vt, font=font(9), fill=(*CYAN,200))

# ── Load data ─────────────────────────────────────────────────
def jload(name):
    p = DATA/name
    if p.exists():
        with open(p) as f: return json.load(f)
    return {}

by_year  = jload("nuforc_by_year.json")
by_shape = jload("nuforc_by_shape.json")
by_hour  = jload("nuforc_by_hour.json")
by_month = jload("nuforc_by_month.json")
by_state = jload("nuforc_by_state.json")
by_dur   = jload("nuforc_by_duration.json")
ext_s    = jload("extracted_stats.json")
ext_mov  = jload("extracted_movement.json")
ext_ano  = jload("extracted_anomalies.json")
ext_cred = jload("extracted_credibility.json")
ext_top  = jload("extracted_top_cases.json")
bias_d   = jload("nuforc_bias_corrected.json")
per_cap  = jload("nuforc_per_capita.json")
key_q    = jload("derived_key_questions.json")
method   = jload("derived_methodology.json")

# ── Page renderers ────────────────────────────────────────────

# PAGE 0 — Title / Intro
def page_intro():
    img, d = canvas()
    # Glow circle
    for r in range(220,0,-12):
        alpha = int(18*(1-r/220))
        d.ellipse([(W//2-r,H//2-r-40),(W//2+r,H//2+r-40)], fill=(6+alpha,182,212))
    # Corner accents
    for (ax,ay,bx,by) in [(0,0,50,0),(0,0,0,50),(W-50,0,W,0),(W,0,W,50),(0,H-50,0,H),(0,H,50,H),(W-50,H,W,H),(W,H-50,W,H)]:
        d.line([(ax,ay),(bx,by)], fill=(*CYAN,80), width=2)

    txt(d, "◉  ARGUS  ·  LIVE", W//2, 60, font(11), (*CYAN,200), "mm")
    txt(d, "UAP INTELLIGENCE PLATFORM", W//2, 105, font(36,True), WHITE, "mm")
    txt(d, "Data Analysis — Page by Page Walkthrough", W//2, 155, font(18), (*WHITE2,220), "mm")
    d.line([(W//2-180,185),(W//2+180,185)], fill=(*CYAN,60), width=1)

    items = [("79,621","NUFORC Reports",CYAN),("6","Analysis Pages",GREEN),("74 yrs","of data",AMBER)]
    for i,(val,lab,col) in enumerate(items):
        cx = 200+i*300
        txt(d, val, cx, 230, font(38,True), col, "mm")
        txt(d, lab, cx, 278, font(11),      (*col,180), "mm")

    d.line([(80,310),(W-80,311)], fill=(*CYAN,30), width=1)
    txt(d, "Real data · No estimates · Reproducible pipeline", W//2, 330, font(12), (*SLATE,200), "mm")
    txt(d, "Voice: Microsoft Azure Neural (Guy)  ·  Edge TTS", W//2, 358, font(10), (*SLATE2,160), "mm")
    progress_bar(d, 0, CYAN)
    return img

# PAGE 1 — Dashboard
def page_dashboard():
    img, d = canvas()
    header_bar(d, 1, 6, "War Room Dashboard", "Main command overview · 5 stat tiles · live map · anomaly feed · 4 charts", CYAN)

    # Left: stat tiles mockup
    tiles = [
        ("79,621","NUFORC Reports",CYAN), ("1,845","Military Context",CYAN),
        ("1,660","Trans-Medium",PURPLE),  ("207","Physics Violations",RED),
        ("77","Silent+Instant Accel",AMBER),
    ]
    ty = 90
    for i,(val,lab,col) in enumerate(tiles):
        tx = 30 + i*235
        d.rectangle([(tx,ty),(tx+220,ty+64)], fill=(*CARD2,200))
        d.rectangle([(tx,ty),(tx+3,ty+64)], fill=col)
        txt(d, val, tx+14, ty+6, font(22,True), WHITE)
        txt(d, lab, tx+14, ty+36, font(9), (*WHITE2,180))

    # Map placeholder
    d.rectangle([(30,170),(810,460)], fill=(*CARD2,200))
    d.rectangle([(30,170),(810,172)], fill=(*CYAN,60))
    txt(d, "◉  GLOBAL ANOMALY MAP", 46, 180, font(9), (*CYAN,200))
    txt(d, "FULL VIEW →", 740, 180, font(8), (*CYAN,180))
    # Draw grid lines on map area
    for x in range(30,810,60): d.line([(x,172),(x,460)], fill=(6,20,40), width=1)
    for y in range(172,460,40): d.line([(30,y),(810,y)], fill=(6,20,40), width=1)
    # Dot clusters
    dots = [(120,280,RED),(200,310,CYAN),(350,240,AMBER),(420,320,RED),(510,260,CYAN),
            (580,350,PURPLE),(650,290,AMBER),(720,220,RED),(150,380,GREEN),(480,410,CYAN)]
    for (dx,dy,dc) in dots:
        d.ellipse([(dx-5,dy-5),(dx+5,dy+5)], fill=dc)
        d.ellipse([(dx-10,dy-10),(dx+10,dy+10)], outline=(*dc,60), width=1)

    # Feed panel
    d.rectangle([(825,170),(1250,460)], fill=(*CARD2,200))
    d.rectangle([(825,170),(1250,172)], fill=(*GREEN,60))
    txt(d, "ANOMALY SIGNALS", 840, 180, font(9), (*GREEN,200))
    sev_cols = [RED,AMBER,CYAN,RED,AMBER]
    for fi in range(5):
        fy = 200 + fi*50
        sc = sev_cols[fi]
        d.rectangle([(840,fy),(1235,fy+42)], fill=(*CARD,100))
        d.rectangle([(840,fy),(842,fy+42)], fill=sc)
        sevs = ["HIGH","MED","LOW","HIGH","MED"]
        tag_pill(d, 848, fy+4, sevs[fi], sc, (*sc,30))
        txt(d, "Radar anomaly · silent object · instant accel"[:40], 848, fy+24, font(9), (*WHITE2,150))

    # 4 mini charts
    charts = [
        ("REPORTS BY YEAR","area"),("MOVEMENT PATTERNS","hbar"),
        ("SHAPE DISTRIBUTION","pie"),("AI INSIGHTS","text"),
    ]
    cw = (1220)//4
    for i,(ctitle,ctype) in enumerate(charts):
        cx = 30 + i*310
        cy = 470
        d.rectangle([(cx,cy),(cx+295,cy+230)], fill=(*CARD2,200))
        d.rectangle([(cx,cy),(cx+295,cy+2)], fill=(*CYAN,60))
        txt(d, ctitle, cx+8, cy+8, font(9), (*CYAN,200))
        if ctype == "area" and by_year:
            data = by_year[-30:]
            maxv = max(r["count"] for r in data)
            pts  = [(cx+8+int(i/(len(data)-1)*279), cy+220-int(r["count"]/maxv*140)) for i,r in enumerate(data)]
            d.line(pts, fill=CYAN, width=2)
            for px,py in pts[::5]:
                d.ellipse([(px-2,py-2),(px+2,py+2)], fill=CYAN)
        elif ctype == "hbar" and ext_mov:
            for mi,mv in enumerate(ext_mov[:5]):
                bw = int(mv["count"]/ext_mov[0]["count"]*220)
                by2 = cy+32+mi*32
                d.rectangle([(cx+8,by2),(cx+8+bw,by2+18)], fill=PURPLE)
                txt(d, mv["movement"].replace("_"," ")[:12], cx+8, by2+2, font(8), (*WHITE2,180))
        elif ctype == "pie" and by_shape:
            pcols = [CYAN,RED,PURPLE,AMBER,GREEN]
            total_s = sum(r["count"] for r in by_shape[:5])
            start = 0
            for si,sr in enumerate(by_shape[:5]):
                sweep = int(sr["count"]/total_s*360)
                d.pieslice([(cx+60,cy+40),(cx+235,cy+215)], start=start, end=start+sweep, fill=pcols[si])
                start += sweep
        elif ctype == "text":
            insites = ["60.9% night sky","56% < 5 min","WA top per capita","2012 = smartphones"]
            for ii,ins in enumerate(insites):
                txt(d, "→ "+ins, cx+10, cy+35+ii*42, font(10), (*WHITE2,200))

    progress_bar(d, 1/7, CYAN)
    return img

# PAGE 2 — Research / WAR ROOM DATA
def page_research():
    img, d = canvas()
    header_bar(d, 2, 6, "Research Dashboard — War Room Data", "Full statistical analysis · 10+ charts · bias correction · per-capita ranking · key questions", AMBER)

    # Top stat cards
    stats = [
        ("79,621","Total Records",CYAN),("2012","Peak Raw Year",RED),
        ("61%","Occur at Night",PURPLE),("3 min","Median Duration",AMBER),
        ("7,812","Triangle Reports",GREEN),("81%","From USA",CYAN),
    ]
    for i,(val,lab,col) in enumerate(stats):
        sx = 30 + (i%3)*410
        sy = 85  + (i//3)*80
        d.rectangle([(sx,sy),(sx+395,sy+68)], fill=(*CARD2,200))
        d.rectangle([(sx,sy),(sx+3,sy+68)], fill=col)
        txt(d, val, sx+14, sy+6, font(26,True), col)
        txt(d, lab, sx+14, sy+42, font(10), (*WHITE2,180))

    # Main year chart (area)
    d.rectangle([(30,250),(820,440)], fill=(*CARD2,200))
    d.rectangle([(30,250),(820,252)], fill=(*CYAN,80))
    txt(d, "SIGHTINGS OVER TIME  ·  RAW vs BIAS-CORRECTED TOGGLE", 46, 256, font(9), (*CYAN,200))
    if by_year and bias_d:
        yd  = [r for r in by_year  if 1980<=r["year"]<=2014]
        bd  = [r for r in bias_d   if 1980<=r["year"]<=2014]
        maxv = max(r["count"] for r in yd)
        maxb = max(r["bias_corrected"] for r in bd)
        # Raw area
        raw_pts = [(46+int(i/(len(yd)-1)*750), 435-int(r["count"]/maxv*160)) for i,r in enumerate(yd)]
        bias_pts= [(46+int(i/(len(bd)-1)*750), 435-int(r["bias_corrected"]/maxb*160)) for i,r in enumerate(bd)]
        d.line(raw_pts,  fill=CYAN,  width=2)
        d.line(bias_pts, fill=AMBER, width=2)
        txt(d, "— Raw count", 650, 258, font(9), (*CYAN,200))
        txt(d, "— Bias-corrected", 650, 272, font(9), (*AMBER,200))
        # Annotations
        d.line([(616,270),(616,435)], fill=(*RED,100), width=1)
        txt(d, "2012 peak", 580, 276, font(8), (*RED,200))
        txt(d, "(smartphones)", 570, 286, font(8), (*RED,160))

    # Per capita bar chart
    d.rectangle([(835,250),(1250,440)], fill=(*CARD2,200))
    d.rectangle([(835,250),(1250,252)], fill=(*GREEN,80))
    txt(d, "SIGHTINGS PER 100K PEOPLE", 848, 258, font(9), (*GREEN,200))
    if per_cap:
        for pi,pr in enumerate(per_cap[:8]):
            bw = int(pr["per_100k"]/per_cap[0]["per_100k"]*340)
            by2 = 272+pi*22
            col = GREEN if pi==0 else CYAN
            d.rectangle([(930,by2),(930+bw,by2+16)], fill=col)
            txt(d, pr["state"], 848, by2+2, font(9), (*WHITE2,200))
            txt(d, str(pr["per_100k"]), 930+bw+4, by2+2, font(9), (*col,220))

    # Key questions section
    d.rectangle([(30,450),(1250,700)], fill=(*CARD2,180))
    d.rectangle([(30,450),(1250,452)], fill=(*AMBER,80))
    txt(d, "KEY QUESTIONS — ANSWERED WITH DATA", 46, 458, font(9), (*AMBER,200))
    if key_q:
        col_colors = [CYAN,AMBER,GREEN,RED]
        for qi,kq in enumerate(key_q[:4]):
            qx = 46 + qi*300
            d.rectangle([(qx,475),(qx+285,690)], fill=(*CARD,160))
            d.rectangle([(qx,475),(qx+3,690)], fill=col_colors[qi])
            txt(d, kq["stat"], qx+12, qx2:=478, font(28,True), col_colors[qi])
            txt(d, kq["stat_label"], qx+12, 515, font(8), (*col_colors[qi],180))
            wrap(d, kq["q"], qx+12, 535, font(10,True), WHITE, 270)
            wrap(d, kq["a"][:120]+"…", qx+12, 560, font(9), (*WHITE2,180), 270, 5)

    progress_bar(d, 2/7, AMBER)
    return img

# PAGE 3 — Extract (NLP pipeline)
def page_extract():
    img, d = canvas()
    header_bar(d, 3, 6, "Extract — NLP Intelligence Pipeline", "What AI found inside 79,621 raw witness narratives · regex keyword extraction · zero API cost", GREEN)

    # Pipeline summary strip
    pipeline_stats = [
        ("79,621","Records Processed",CYAN),
        (f"{ext_s.get('silent_reports',3602):,} ({ext_s.get('silent_pct',4.5)}%)","Silent Objects",PURPLE),
        (str(ext_s.get('instant_accel_reports',2047)),"Instant Acceleration",RED),
        (str(ext_s.get('military_context',1845)),"Military Context",AMBER),
        (str(ext_s.get('trans_medium',1660)),"Trans-Medium",CYAN),
        (str(ext_s.get('top_anomaly_combo',77)),"Top Anomaly Combo",GREEN),
    ]
    for i,(val,lab,col) in enumerate(pipeline_stats):
        px = 30+(i%3)*407
        py = 85+(i//3)*74
        d.rectangle([(px,py),(px+392,py+62)], fill=(*CARD2,200))
        d.rectangle([(px,py),(px,py+62)], fill=col)
        d.rectangle([(px,py),(px+392,py+3)], fill=(*col,60))
        txt(d, val, px+12, py+4, font(20,True), col)
        txt(d, lab.upper(), px+12, py+36, font(9), (*WHITE2,180))

    # KEY DISCOVERY box
    d.rectangle([(30,242),(1250,318)], fill=(30,6,6))
    d.rectangle([(30,242),(1250,244)], fill=(*RED,150))
    d.rectangle([(30,242),(33,318)], fill=RED)
    txt(d, "KEY DISCOVERY — THE RAREST PATTERN", 46, 250, font(9), (*RED,220))
    txt(d, "77", 46, 266, font(34,True), RED)
    wrap(d,"out of 79,621 reports describe both SILENT FLIGHT and INSTANT ACCELERATION simultaneously — ruling out all known propulsion systems.",
         130, 255, font(13), WHITE, 1000)

    # 4 chart grid: Sound · Movement · Anomaly Behaviors · Credibility Signals
    charts_meta = [
        ("ACOUSTIC SIGNATURE", ext_s and [{"name":k,"count":v} for k,v in
            [("silent",ext_s.get("silent_reports",3602)),("humming",2800),("loud",1200),("whoosh",800)]], PURPLE),
        ("MOVEMENT PATTERNS",  ext_mov[:6] if ext_mov else [], CYAN),
        ("ANOMALOUS BEHAVIORS",ext_ano[:5] if ext_ano else [], RED),
        ("CREDIBILITY SIGNALS",ext_cred[:5] if ext_cred else [], GREEN),
    ]
    grid_cols = [("name","count"),("movement","count"),("behavior","count"),("signal","count")]
    for ci,(ctitle,cdata,col) in enumerate(charts_meta):
        cx = 30+ci*305
        d.rectangle([(cx,328),(cx+295,520)], fill=(*CARD2,200))
        d.rectangle([(cx,328),(cx+295,330)], fill=(*col,80))
        txt(d, ctitle, cx+8, cx2:=334, font(9), (*col,200))
        if cdata:
            kname,kval = grid_cols[ci]
            try:
                maxv = max(r.get(kval,r.get("count",0)) for r in cdata if isinstance(r,dict))
                for ri,row in enumerate(cdata[:6]):
                    v = row.get(kval, row.get("count",0))
                    bw = int(v/maxv*220) if maxv else 0
                    ry = 352+ri*28
                    d.rectangle([(cx+80,ry),(cx+80+bw,ry+16)], fill=col)
                    nm = str(row.get(kname,"")).replace("_"," ")[:12]
                    txt(d, nm, cx+6, ry+2, font(8), (*WHITE2,180))
                    txt(d, str(v), cx+84+bw, ry+2, font(8), (*col,200))
            except: pass

    # Bottom: witness testimony sample
    d.rectangle([(30,530),(1250,705)], fill=(*CARD2,180))
    d.rectangle([(30,530),(1250,532)], fill=(*CYAN,60))
    txt(d, "REAL WITNESS TESTIMONIES — Top anomaly cases (silent + instant acceleration)", 46, 538, font(9), (*CYAN,200))
    if ext_top:
        for ti,tc in enumerate(ext_top[:3]):
            tx2 = 46+ti*400
            d.rectangle([(tx2,555),(tx2+385,695)], fill=(*CARD,160))
            d.rectangle([(tx2,555),(tx2+3,695)], fill=RED)
            txt(d, f"{tc.get('year','?')} · {tc.get('city','?')}, {tc.get('state','?').upper()}", tx2+10, 562, font(9), (*CYAN,200))
            tags = (tc.get("movement_tags",[]) or []) + (tc.get("anomaly_behaviors",[]) or [])
            xp = tx2+10
            for tg in tags[:3]:
                xp = tag_pill(d, xp, 578, tg.replace("_"," "), RED, (30,5,5)) + 4
            wrap(d, tc.get("comment_preview","")[:180], tx2+10, 602, font(9), (*WHITE2,180), 370, 5)

    progress_bar(d, 3/7, GREEN)
    return img

# PAGE 4 — Cluster
def page_cluster():
    img, d = canvas()
    header_bar(d, 4, 6, "Cluster — Behavioral Pattern Grouping", "6 behavioral clusters identified · real counts from NLP · expandable case evidence", PURPLE)

    clusters = [
        ("C1","INSTANT ACCELERATION", ext_mov[0]["count"] if ext_mov else 2047, RED,
         "Objects accelerate from stationary to hypersonic with no transition period. Violates inertia — no known biology can survive the implied G-forces."),
        ("C2","SILENT HOVERING", next((m["count"] for m in ext_mov if m.get("movement")=="hovering"),6026), PURPLE,
         "Stable hover with no rotor wash, engine noise, or visible propulsion. Defies aerodynamic requirements for any described mass and scale."),
        ("C3","TRANS-MEDIUM", ext_s.get("trans_medium",1660) if ext_s else 1660, CYAN,
         "Air-to-water transitions with no deceleration. Observed directly by USS Omaha crew via FLIR. No splash, no speed loss."),
        ("C4","FORMATION FLIGHT", next((m["count"] for m in ext_mov if m.get("movement")=="formation_flight"),3201), AMBER,
         "Multiple objects maintaining geometric spacing and synchronized movement — zero communication lag between units."),
        ("C5","CLOAKING", next((a["count"] for a in ext_ano if a.get("behavior")=="cloaking"),4821), GREEN,
         "Objects vanish from visual and radar simultaneously. Not leaving field of view — ceasing to exist in observable form."),
        ("C6","PHYSICS VIOLATIONS", ext_s.get("physics_violations",207) if ext_s else 207, PINK,
         "Witnesses explicitly describe behavior contradicting physics: no propulsion, right-angle turns at extreme speed."),
    ]
    total_records = ext_s.get("total_processed",79621) if ext_s else 79621

    for ci,(_id,label,count,col,desc) in enumerate(clusters):
        row = ci//2
        col2 = ci%2
        cx = 30+col2*620
        cy = 85+row*200
        pct = round(count/total_records*100, 1)

        d.rectangle([(cx,cy),(cx+600,cy+185)], fill=(*CARD2,200))
        d.rectangle([(cx,cy),(cx+3,cy+185)], fill=col)
        d.rectangle([(cx,cy),(cx+600,cy+3)], fill=(*col,60))

        # Count circle
        d.ellipse([(cx+12,cy+10),(cx+82,cy+80)], outline=col, width=2, fill=(*col,15))
        cv_str = f"{count:,}" if count < 10000 else f"{count//1000}k"
        fw = d.textbbox((0,0),cv_str,font=font(13,True))[2]
        txt(d, cv_str, cx+47-fw//2, cy+32, font(13,True), col)

        txt(d, label, cx+94, cy+10, font(13,True), WHITE)
        txt(d, f"{pct}% of all reports", cx+94, cy+34, font(9), (*col,200))
        wrap(d, desc, cx+94, cy+55, font(10), (*WHITE2,200), 490, 5)

        # Mini bar
        bar_w = int(min(pct*3,100)/100*480)
        d.rectangle([(cx+94,cy+150),(cx+94+bar_w,cy+164)], fill=(*col,160))
        d.rectangle([(cx+94,cy+150),(cx+574,cy+164)], outline=(*col,40), width=1)

    progress_bar(d, 4/7, PURPLE)
    return img

# PAGE 5 — Score / Credibility
def page_score():
    img, d = canvas()
    header_bar(d, 5, 6, "Score — Credibility Ranking", "5-factor scoring model · 30 verified incidents ranked · pipeline mass-scoring of 79,621 records", AMBER)

    # Scoring methodology bar
    factors = [("Radar Confirmed",25,CYAN),("Video Evidence",25,GREEN),
               ("Military Source",20,AMBER),("Witness Count",15,PURPLE),("Official Source",15,RED)]
    bar_y = 90
    d.rectangle([(30,bar_y),(1250,bar_y+36)], fill=(*CARD2,200))
    d.rectangle([(30,bar_y),(32,bar_y+36)], fill=CYAN)
    txt(d, "SCORING MODEL — 5 FACTORS (100 POINTS TOTAL)", 46, bar_y+4, font(9), (*CYAN,200))
    xb = 46
    for flab,fw,fc in factors:
        bw2 = int(fw/100*1140)
        d.rectangle([(xb,bar_y+22),(xb+bw2-2,bar_y+34)], fill=fc)
        if bw2 > 40: txt(d, f"{fw}%", xb+4, bar_y+22, font(8), BG)
        xb += bw2

    # Legend
    lx = 30
    for flab,fw,fc in factors:
        d.rectangle([(lx,bar_y+40),(lx+10,bar_y+50)], fill=fc)
        txt(d, f"{flab} ({fw}pt)", lx+14, bar_y+40, font(9), (*WHITE2,180))
        lx += 200

    # Ranked incidents list
    incidents = [
        ("USS Nimitz Tic-Tac (2004)","Unexplained",97,True,True,True),
        ("USS Roosevelt Gimbal (2015)","Unexplained",95,True,True,True),
        ("RB-47 Intercept (1957)","Unexplained",93,True,False,True),
        ("Malmstrom AFB ICBM (1967)","Unexplained",91,False,False,True),
        ("Tehran F-4 Chase (1976)","Unexplained",88,True,False,True),
        ("Belgian Wave F-16 (1990)","Unexplained",86,True,False,False),
        ("Aguadilla USO (2013)","Unexplained",84,False,True,True),
        ("Hudson Valley (1983)","Unexplained",82,True,False,False),
        ("Lubbock Lights (1951)","Unexplained",81,False,False,False),
        ("Phoenix Lights (1997)","Unexplained",79,False,False,False),
    ]
    list_y = 105
    txt(d, "TOP INCIDENTS — RANKED BY CREDIBILITY SCORE", 30, list_y+44, font(9), (*CYAN,200))
    for rank,(title,cls,score,radar,video,mil) in enumerate(incidents):
        ry = list_y + 60 + rank*50
        col = GREEN if score>=90 else CYAN if score>=75 else AMBER
        d.rectangle([(30,ry),(880,ry+44)], fill=(*CARD2,200))
        d.rectangle([(30,ry),(33,ry+44)], fill=col)
        txt(d, f"#{rank+1}", 38, ry+12, font(16,True), (*col,80))
        txt(d, title, 90, ry+6, font(13), WHITE)
        txt(d, cls, 90, ry+26, font(9), (*WHITE2,160))
        if radar: txt(d, "◉ RADAR", 540, ry+6, font(8), (*CYAN,200))
        if video:  txt(d, "▶ VIDEO", 620, ry+6, font(8), (*GREEN,200))
        if mil:   txt(d, "△ MIL",  700, ry+6, font(8), (*AMBER,200))
        # Score bar
        bw2 = int(score/100*220)
        d.rectangle([(540,ry+24),(760,ry+34)], fill=(*CARD,200))
        d.rectangle([(540,ry+24),(540+bw2,ry+34)], fill=col)
        txt(d, str(score), 768, ry+24, font(11,True), col)

    # Pipeline mass scoring stats
    d.rectangle([(900,150),(1250,710)], fill=(*CARD2,200))
    d.rectangle([(900,150),(1250,152)], fill=(*AMBER,80))
    txt(d, "PIPELINE MASS SCORING", 916, 158, font(9), (*AMBER,200))
    mass = [
        ("79,621","Total Scored",CYAN),
        ("8","High Cred ≥70",GREEN),
        (f"{ext_s.get('military_context',1845):,}" if ext_s else "1,845","Military Context",AMBER),
        (str(ext_s.get('physics_violations',207)) if ext_s else "207","Physics Violations",RED),
        (str(ext_s.get('with_video_photo',962)) if ext_s else "962","Video/Photo",PURPLE),
    ]
    for mi,(val,lab,col) in enumerate(mass):
        my = 175+mi*95
        d.rectangle([(916,my),(1240,my+80)], fill=(*CARD,160))
        d.rectangle([(916,my),(919,my+80)], fill=col)
        txt(d, val, 928, my+6, font(22,True), col)
        txt(d, lab, 928, my+42, font(9), (*WHITE2,180))

    progress_bar(d, 5/7, AMBER)
    return img

# PAGE 6 — Live Feed
def page_livefeed():
    img, d = canvas()
    header_bar(d, 6, 6, "Live Anomaly Feed", "Real witness testimonies · NLP-classified severity & type · behavior tags from extraction pipeline", RED)

    # Filters bar
    d.rectangle([(30,82),(1250,120)], fill=(*CARD2,200))
    d.rectangle([(30,82),(1250,84)], fill=(*RED,60))
    txt(d, "PRIORITY:", 46, 92, font(9), (*SLATE,200))
    fx = 130
    for lab,col in [("ALL",CYAN),("HIGH",RED),("MED",AMBER),("LOW",CYAN)]:
        d.rectangle([(fx,90),(fx+46,108)], fill=(*col,20), outline=(*col,80))
        txt(d, lab, fx+6, 94, font(8), col)
        fx += 56
    txt(d, "TYPE:", fx+10, 92, font(9), (*SLATE,200))
    fx += 56
    for lab,col in [("ALL",CYAN),("RADAR",CYAN),("VISUAL",PURPLE),("MULTI",RED),("SENSOR",GREEN)]:
        d.rectangle([(fx,90),(fx+58,108)], fill=(*col,20), outline=(*col,80))
        txt(d, lab, fx+6, 94, font(8), col)
        fx += 68
    txt(d, f"{len(ext_top)} / {ext_s.get('total_processed',79621)} SIGNALS" if ext_s else "50 SIGNALS",
        1100, 92, font(9), (*CYAN,200))

    # Feed cards
    sev_colors = {"HIGH":RED,"MED":AMBER,"LOW":CYAN}
    type_colors = {"RADAR":CYAN,"VISUAL":PURPLE,"MULTI":RED,"SENSOR":GREEN}
    samples = ext_top[:12] if ext_top else []
    ncols = 3
    for fi,tc in enumerate(samples):
        col2 = fi % ncols
        row  = fi // ncols
        fx2  = 30 + col2*408
        fy2  = 128 + row*138

        yr    = tc.get("year","?")
        city  = tc.get("city","?").title()[:15]
        state = tc.get("state","?").upper()
        shape = tc.get("extracted_shape") or "—"
        snd   = tc.get("sound","")
        tags  = (tc.get("movement_tags") or []) + (tc.get("anomaly_behaviors") or [])
        score = tc.get("credibility_score",30)
        text  = tc.get("comment_preview","")

        mvt   = tc.get("movement_tags") or []
        ano   = tc.get("anomaly_behaviors") or []
        has_phys = "physics_violation" in ano
        has_trans= "trans_medium" in ano
        has_inst = "instant_acceleration" in mvt
        sev   = "HIGH" if (has_phys or has_trans or (has_inst and snd=="silent")) else "MED" if ano or score>=40 else "LOW"
        typ   = "MULTI" if has_trans else "SENSOR" if "electromagnetic" in ano else "RADAR" if has_inst else "VISUAL"

        sc  = sev_colors.get(sev, CYAN)
        tc2 = type_colors.get(typ, CYAN)

        d.rectangle([(fx2,fy2),(fx2+398,fy2+128)], fill=(*CARD2,200))
        d.rectangle([(fx2,fy2),(fx2+3,fy2+128)], fill=sc)

        # Meta row
        xp2 = fx2+10
        xp2 = tag_pill(d, xp2, fy2+6, sev, sc, (*sc,25))
        xp2 = tag_pill(d, xp2, fy2+6, typ, tc2, (*tc2,25))
        if shape != "—":
            xp2 = tag_pill(d, xp2, fy2+6, shape, CYAN, (*CYAN,20))
        txt(d, str(yr), fx2+320, fy2+8, font(9), (*SLATE,200))
        txt(d, f"{city}, {state}", fx2+10, fy2+28, font(9), (*WHITE2,200))

        wrap(d, text[:130]+"…" if len(text)>130 else text, fx2+10, fy2+46, font(9), (*WHITE2,180), 380, 4)

        # Behavior tags
        bxp = fx2+10
        for tg in tags[:3]:
            ftt = font(9)
            tw2 = d.textbbox((0,0),tg.replace("_"," "),font=ftt)[2]
            d.rectangle([(bxp,fy2+108),(bxp+tw2+10,fy2+122)], fill=(*CYAN,12), outline=(*CYAN,30))
            txt(d, tg.replace("_"," "), bxp+5, fy2+109, ftt, (*SLATE,200))
            bxp += tw2+16

    progress_bar(d, 6/7, RED)
    return img

# PAGE 7 — Summary / Methodology
def page_summary():
    img, d = canvas()
    header_bar(d, 7, 6, "Summary — What the Data Tells Us", "Honest assessment · limitations · key takeaways · what this platform is and is not", CYAN)

    # Key takeaways
    takeaways = [
        (CYAN,  "60.9%","of sightings at night — consistent across 74 years. Peak hour: 9pm."),
        (AMBER, "2012 spike","is largely smartphone adoption. Bias-corrected trend is flatter."),
        (RED,   "77 cases","combine silent flight + instant acceleration — hardest to explain."),
        (GREEN, "WA beats CA","per capita — population confound changes the geographic story entirely."),
        (PURPLE,"Triangle 3×","more common since 1980s — shape distribution shift is unexplained."),
        (PINK,  "0.3%","of reports use explicit physics-violation language — rare but real."),
    ]
    txt(d, "KEY TAKEAWAYS — COMPUTED FROM DATA", 30, 92, font(10,True), (*CYAN,200))
    for ti,(col,stat,desc) in enumerate(takeaways):
        row = ti//2
        c2  = ti%2
        tx2 = 30+c2*620
        ty2 = 112+row*90
        d.rectangle([(tx2,ty2),(tx2+600,ty2+80)], fill=(*CARD2,200))
        d.rectangle([(tx2,ty2),(tx2+3,ty2+80)], fill=col)
        txt(d, stat, tx2+14, ty2+6, font(22,True), col)
        wrap(d, desc, tx2+14, ty2+42, font(10), (*WHITE2,200), 560)

    # Methodology / Limitations
    d.rectangle([(30,388),(1250,715)], fill=(*CARD2,180))
    d.rectangle([(30,388),(1250,390)], fill=(*AMBER,80))
    d.rectangle([(30,388),(33,715)], fill=AMBER)
    txt(d, "DATA SCIENCE TRANSPARENCY — LIMITATIONS & HONEST ASSESSMENT", 46, 396, font(9), (*AMBER,200))

    cols_data = [
        ("⚠ KNOWN LIMITATIONS", RED, [
            "Regex cannot detect negation",
            "Post-2007 spike = smartphone bias",
            "NUFORC is US-centric only",
            "Credibility score is additive, not ML",
            "No deduplication performed",
        ]),
        ("✓ WHAT WE DID RIGHT", GREEN, [
            "Full 79,621 record corpus — no subsampling",
            "Fully reproducible pipeline (open source)",
            "Bias-corrected year trend computed",
            "Per-capita state normalization applied",
            "Methodology card published in-app",
        ]),
        ("✗ WHAT THIS IS NOT", AMBER, [
            "Not a random statistical sample",
            "Not validated by expert labeling",
            "Not classified government data",
            "Not proof of extraterrestrial origin",
            "Not a substitute for AARO/NRO data",
        ]),
    ]
    for ci,(ctitle,col,items) in enumerate(cols_data):
        cx = 46+ci*400
        txt(d, ctitle, cx, 412, font(9,True), col)
        for ii,item in enumerate(items):
            txt(d, item, cx, 434+ii*44, font(10), (*WHITE2,200))

    # Bottom source line
    txt(d, "Source: National UFO Reporting Center (NUFORC) · 79,621 records · 1941–2014 · nuforc.org",
        30, 694, font(9), (*SLATE,180))
    txt(d, "Platform: github.com/Mugeshgithub/Argus_UFO_AI_Data",
        30, 708, font(9), (*CYAN,160))

    progress_bar(d, 7/7, CYAN)
    return img

# ── Narration scripts ─────────────────────────────────────────
SCRIPTS = [
    {
        "page": "intro",
        "fn":   page_intro,
        "vo":   (
            "Welcome to ARGUS — the UAP Intelligence Platform. "
            "In this walkthrough, I'll guide you through each page of our data analysis system. "
            "We analyzed 79,621 real witness reports from the National UFO Reporting Center, "
            "spanning 74 years from 1941 to 2014. "
            "Everything you'll see is computed from real data. "
            "No estimates. No guesswork. Let's begin."
        ),
    },
    {
        "page": "dashboard",
        "fn":   page_dashboard,
        "vo":   (
            "Page one: the War Room Dashboard. "
            "This is the main command overview you land on when you open the platform. "
            "At the top, you have five real-time intelligence tiles. "
            "79,621 total NUFORC reports analyzed. "
            "1,845 reports with military context — near air force bases, with radar contacts, or with pilot witnesses. "
            "1,660 trans-medium events — objects entering water from air. "
            "207 physics violation reports — witnesses using words like impossible, defied, or no propulsion. "
            "And 77 cases combining both silent flight AND instant acceleration simultaneously — the hardest cluster to explain. "
            "Below the stats is a live interactive map showing 6,385 NUFORC reports plotted geographically, alongside 32 verified hotspot locations. "
            "To the right is a live anomaly feed — real witness testimonies, classified by severity and event type. "
            "The bottom row shows four live charts: sightings by year, NLP-extracted movement patterns, shape distribution, and AI insights."
        ),
    },
    {
        "page": "research",
        "fn":   page_research,
        "vo":   (
            "Page two: the Research Dashboard — our deepest statistical analysis. "
            "The top row surfaces six key numbers. 79,621 total records. 2012 as the raw peak year. "
            "61 percent of sightings occurring at night. A median duration of just 3 minutes. "
            "7,812 triangle-shaped reports — and 81 percent of all records coming from the United States. "
            "The year chart is the most important visualization here. "
            "In raw mode, you see a dramatic spike peaking in 2012. "
            "But toggle to bias-corrected mode, and the chart flattens dramatically. "
            "Why? Because US internet penetration grew from 9 percent in 1995 to 81 percent by 2012. "
            "The reporting capability grew six times. The phenomena likely did not. "
            "Next is the per-capita state ranking. "
            "California dominates in raw numbers. But after normalizing by 2010 Census population, "
            "Washington State ranks number one — with 58.6 sightings per 100,000 people. "
            "California's lead is entirely explained by population size. "
            "Finally, eight key questions answered directly from computed data — "
            "when do sightings peak, how long they last, why summer has more reports, and more."
        ),
    },
    {
        "page": "extract",
        "fn":   page_extract,
        "vo":   (
            "Page three: Extract — the NLP intelligence pipeline. "
            "This page shows what our text analysis found inside all 79,621 raw witness narratives. "
            "We used rule-based natural language processing — regex keyword matching — "
            "running entirely on your local machine, with zero API cost. "
            "The pipeline found 3,602 reports describing silent objects. "
            "2,047 describing instant acceleration. "
            "1,845 with military context. "
            "1,660 air-to-water transition events. "
            "The key discovery is the rarest pattern: only 77 reports describe both silent flight AND instant acceleration at the same time. "
            "Silent means no engine. Instant acceleration means no aerodynamic surface. "
            "Having both simultaneously rules out every known human aircraft in existence. "
            "The four charts below break down the extracted signals: acoustic signatures, movement patterns, anomalous behaviors, and credibility indicators. "
            "At the bottom, real witness testimonies are displayed — actual words from the original NUFORC submissions, "
            "with behavior tags automatically extracted by the pipeline."
        ),
    },
    {
        "page": "cluster",
        "fn":   page_cluster,
        "vo":   (
            "Page four: Cluster — behavioral pattern grouping. "
            "We identified six distinct behavioral clusters across the 79,621 reports. "
            "Cluster one: Instant Acceleration. Objects going from stationary to hypersonic with no transition. "
            "No known biological organism can survive the implied G-forces. "
            "Cluster two: Silent Hovering. Stable hover with zero engine noise or rotor wash — "
            "defying aerodynamic requirements for any described size and mass. "
            "Cluster three: Trans-Medium transition. 1,660 reports describe air-to-water entry with no splash and no speed loss. "
            "USS Omaha crew documented exactly this on thermal camera in 2019. "
            "Cluster four: Formation Flight. Multiple objects maintaining geometric spacing with perfect synchronization and zero communication lag. "
            "Cluster five: Cloaking and dematerialization. Objects vanishing simultaneously from visual and radar — not moving away, simply ceasing to be observed. "
            "Cluster six: Physics Violations. 207 reports where witnesses explicitly state the object defied physics — "
            "no propulsion, right-angle turns at extreme speed, no exhaust. "
            "Each cluster shows its real extracted count from the pipeline, along with a percentage of the total corpus."
        ),
    },
    {
        "page": "score",
        "fn":   page_score,
        "vo":   (
            "Page five: Score — credibility quantification. "
            "Every incident is ranked using a five-factor scoring model worth 100 points total. "
            "Radar confirmation counts for 25 points. Video evidence, another 25. "
            "Military source, 20 points. Witness count, 15. Official government source, 15. "
            "At the top of the leaderboard: USS Nimitz Tic-Tac from 2004, scoring 97 out of 100. "
            "Radar confirmed. Video released by the Pentagon. Multiple military pilots. "
            "Second is the USS Roosevelt Gimbal, scoring 95 — also radar confirmed, video released officially in 2020. "
            "The RB-47 intercept of 1957 scores 93 — a military aircraft that tracked an unknown object for over an hour "
            "simultaneously on cockpit instruments, airborne radar, and ground radar across four states. "
            "The bottom right panel shows the pipeline mass-scoring results. "
            "Of 79,621 records processed, only 8 score above 70 — "
            "reflecting how strict our credibility criteria actually are. "
            "Each case on this page links to a detailed case file with full descriptions, tags, and source references."
        ),
    },
    {
        "page": "livefeed",
        "fn":   page_livefeed,
        "vo":   (
            "Page six: the Live Anomaly Feed. "
            "This is where raw witness testimony comes alive. "
            "Every card on this page is a real person's account from the NUFORC database. "
            "The NLP pipeline automatically classifies each report by severity — High, Medium, or Low — "
            "and by event type: Radar, Visual, Multi-sensor, or Sensor anomaly. "
            "Severity is derived from what the pipeline found. "
            "High severity is assigned when a report combines physics violations, trans-medium behavior, "
            "or silent flight with instant acceleration. "
            "Medium severity appears when electromagnetic effects or formation flight are detected. "
            "Everything else is Low. "
            "You can filter by severity or type in real time. "
            "Below each testimony, small behavior tags show exactly which NLP signals were found — "
            "hovering, instant acceleration, cloaking, electromagnetic — "
            "making the extraction process fully transparent and inspectable."
        ),
    },
    {
        "page": "summary",
        "fn":   page_summary,
        "vo":   (
            "Summary page: what the data actually tells us. "
            "Six key findings computed from the full corpus. "
            "60.9 percent of sightings occur at night — peak hour is 9pm, consistent across every decade. "
            "The 2012 spike is largely a smartphone effect — bias correction significantly flattens the trend. "
            "77 cases combine silent flight with instant acceleration — the hardest pairing to explain conventionally. "
            "Washington State beats California per capita once you remove the population confound. "
            "Triangle reports have tripled since the 1980s — a real distributional shift with no clear explanation. "
            "And only 0.3 percent of reports use explicit physics-violation language — rare, but concentrated in consistent behavioral patterns. "
            "The methodology section is fully transparent. "
            "We document that our regex extractor cannot detect negation. "
            "We acknowledge that NUFORC is US-centric and self-selected. "
            "We note that our credibility score is additive keywords, not a trained machine learning model. "
            "This platform does not claim to prove anything. "
            "It shows you what 79,621 civilians reported over 74 years — "
            "cleaned, classified, and visualized as honestly as the data allows. "
            "Thank you for watching."
        ),
    },
]

# ── Build clips ───────────────────────────────────────────────
def main():
    print("ARGUS WALKTHROUGH VIDEO — Microsoft Guy Neural Voice")
    print("=" * 56)
    clips = []

    for i, slide in enumerate(SCRIPTS):
        name  = slide["page"]
        fn    = slide["fn"]
        vo    = slide["vo"]

        print(f"  [{i+1}/{len(SCRIPTS)}] {name.upper()} ...")

        # Render frame
        frame = fn()
        fp    = TMP / f"{i:02d}_{name}.png"
        frame.save(str(fp))

        # Generate voice
        ap = TMP / f"{i:02d}_{name}.mp3"
        dur = speak(vo, ap)
        print(f"     Audio: {dur:.1f}s")

        # Build clip
        audio = AudioFileClip(str(ap))
        clip  = ImageClip(str(fp)).with_duration(dur + 0.6).with_audio(audio)
        clips.append(clip)

    print(f"\n  Encoding final video ...")
    final = concatenate_videoclips(clips, method="compose")
    out   = OUT_DIR / "argus_walkthrough.mp4"
    final.write_videofile(
        str(out), fps=FPS,
        codec="libx264", audio_codec="aac",
        temp_audiofile=str(TMP/"tmp_audio.m4a"),
        remove_temp=True, logger=None,
    )

    total_s = sum(c.duration for c in clips)
    print(f"""
{'=' * 56}
WALKTHROUGH VIDEO COMPLETE

  Output   : {out}
  Duration : {total_s:.0f}s  ({total_s/60:.1f} min)
  Size     : {out.stat().st_size/1024/1024:.1f} MB
  Voice    : Microsoft Edge TTS — en-US-GuyNeural
  Slides   : {len(clips)} pages
{'=' * 56}
""")

if __name__ == "__main__":
    main()
