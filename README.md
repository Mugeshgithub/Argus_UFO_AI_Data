# ARGUS — UAP Intelligence Command

> Not a UFO blog. An AI investigation system.

ARGUS is a full-stack data science platform that analyzes **79,621 declassified sightings** from the National UFO Reporting Center (NUFORC), runs them through an NLP pipeline, and surfaces patterns humans miss at scale — bias corrections, per-capita normalization, behavioral clustering, and credibility scoring included.

**[Live Demo →](https://your-deployed-url.vercel.app)**

![ARGUS Dashboard](public/preview.png)

---

## Key Findings

| Finding | Stat | Method |
|---|---|---|
| Night dominance | **61%** of sightings occur 8pm–2am | Computed from hourly breakdown across all 79,621 records |
| 2012 spike is reporting bias | Flattens when normalized | Corrected using World Bank internet penetration data |
| True hotspot | **Washington State #1** at 58.6/100k | US population normalized via 2010 Census |
| Hardest to explain | **77 cases** combine silent flight + instant acceleration | Rule-based NLP across full corpus |
| Shape shift | Triangle reports **3× more common** since 1980s | Computed from decade-level shape breakdown |
| Physics language | **207 reports** use explicit violation terms | Keyword extraction from raw witness text |

---

## What's Inside

### Intelligence Pipeline

```
NUFORC Raw Data (79,621 reports)
        ↓
    COLLECT      — ingest from public NUFORC database
        ↓
    EXTRACT      — rule-based NLP: shape, speed, movement, duration,
                   military context, physics-violation language
        ↓
    ANALYZE      — bias correction, per-capita normalization,
                   temporal and geographic pattern detection
        ↓
    CLUSTER      — behavioral grouping: 6 clusters by signature
                   (silent+instant, high-altitude hover, formation,
                    military proximity, EM interference, trace evidence)
        ↓
    SCORE        — multi-factor credibility ranking: radar confirmation,
                   witness type, corroboration, physical traces
        ↓
    VISUALIZE    — interactive global map, research dashboard,
                   live anomaly feed, AI analyst
```

### Pages

| Page | What it shows |
|---|---|
| **Mission Overview** | Live command center — global map, anomaly feed, headline stats |
| **Collect** | Data sources: NUFORC, Pentagon files, pilot testimonies, radar logs |
| **Extract** | NLP pipeline output — extracted fields, 77 anomalous cases, witness cards |
| **Analyze** | Core research dashboard — year chart with bias toggle, per-capita state ranking, 8 key questions answered with data |
| **Cluster** | 6 behavioral clusters with counts and confidence scores |
| **Score** | Top-ranked incidents by multi-factor credibility model |
| **Visualize** | Interactive global heat map — filterable by shape, year, severity |
| **Insights** | 6 key stats computed from raw data, nothing fabricated |
| **Live Feed** | Real-time anomaly stream — filter by severity, shape, behavior tag |
| **AI Analyst** | Bring your own OpenAI key — query the dataset in plain English |

---

## Data Science Methodology

### Bias Correction
Raw NUFORC counts are heavily inflated post-2010 due to smartphone adoption. We normalize using World Bank internet penetration data:

```python
correction_factor = baseline_internet_pct / year_internet_pct
corrected_count   = raw_count * correction_factor
```

This deflates the 2012 spike from ~8,000 reports to a much flatter trend — more representative of actual sighting frequency.

### Per-Capita Normalization
State-level counts are normalized using 2010 US Census population data. California drops significantly; Washington State emerges as the true #1 at **58.6 sightings per 100,000 people**.

### NLP Pipeline
Rule-based regex matching across all 79,621 raw report texts — no external API, no LLM hallucinations, fully auditable:
- Shape extraction: light, triangle, disc, fireball, sphere, cylinder
- Behavior flags: silent flight, instant acceleration, hovering, formation
- Context flags: military mention, radar reference, multiple witnesses, physical trace
- Physics-violation language: 207 reports flagged

### Known Limitations
- NUFORC is self-reported — no independent verification of individual accounts
- 81% US-centric — international coverage is sparse and inconsistent
- Reporting bias increases with internet access — pre-1990 data is underrepresented
- NLP is rule-based — complex descriptions may be missed or miscategorized

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Recharts |
| Styling | Inline styles, dark military aesthetic |
| Data pipeline | Python 3 — Pandas, Pillow, regex NLP |
| Data format | Static JSON served from `public/data/` |
| AI Analyst | OpenAI API (user-supplied key, no server-side key required) |
| Deployment | Vercel |

---

## Local Setup

```bash
git clone https://github.com/your-username/argus-uap-command
cd argus-uap-command
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

No environment variables required. All data is pre-computed and shipped as static JSON. The AI Analyst feature requires an OpenAI API key entered at runtime via the sidebar — nothing is stored server-side.

### Re-run the Data Pipeline

```bash
cd scripts
pip install pandas pillow moviepy edge-tts
python3 derive_advanced_data.py   # regenerates all derived JSON files
```

---

## Data Sources

| Source | Records | Used For |
|---|---|---|
| [NUFORC](https://nuforc.org) — National UFO Reporting Center | 79,621 reports | Primary sighting database (1941–2014) |
| [World Bank](https://data.worldbank.org/indicator/IT.NET.USER.ZS) — Internet users (% of population) | Yearly 1990–2024 | Bias correction for reporting inflation |
| [US Census 2010](https://www.census.gov/2010census/) — State population estimates | 50 states | Per-capita normalization |
| [Wikipedia](https://en.wikipedia.org/wiki/Pentagon_UFO_videos) — Pentagon UAP disclosures | Reference | Context for high-credibility cases |
| [FAA](https://www.faa.gov/) — Airspace & pilot report conventions | Reference | Military proximity and radar flag context |

---

## License

MIT — open source, use freely, attribution appreciated.

Data sourced from NUFORC public database. This project makes no claims about the nature of reported phenomena.
