"""
ARGUS — Real Intelligence Extraction Pipeline
Stage 2: Extract structured fields from 79,621 raw NUFORC witness narratives

Approach:
  - Rule-based NLP using regex + keyword matching (free, instant, no API)
  - spaCy for named entity recognition (locations, organizations)
  - Produces nuforc_extracted.json — ingested by the ANALYZE dashboard

No API keys. No cost. Runs entirely on your machine.
Data stored locally in public/data/.
"""

import pandas as pd
import json
import math
import re
import spacy
from pathlib import Path
from collections import defaultdict
import sys

def safe_default(obj):
    if isinstance(obj, float) and math.isnan(obj):
        return None
    return str(obj)

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT    = Path(__file__).parent.parent
RAW     = Path(__file__).parent / "nuforc_raw.csv"
OUT_DIR = ROOT / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("ARGUS EXTRACTION PIPELINE — Stage 2: Extract")
print("=" * 52)

# ── Load spaCy ─────────────────────────────────────────────────────────────
print("Loading spaCy NLP model...")
nlp = spacy.load("en_core_web_sm", disable=["parser"])  # NER + tagger only

# ── Load raw data ──────────────────────────────────────────────────────────
COLS = ["datetime","city","state","country","shape",
        "duration_seconds","duration_hm","comments","date_posted","lat","lng"]

print("Loading 79,621 NUFORC records...")
df = pd.read_csv(RAW, header=None, names=COLS, low_memory=False)
df["comments"] = df["comments"].fillna("").astype(str)
df["shape"]    = df["shape"].fillna("unknown").str.lower().str.strip()
df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
df["year"]     = df["datetime"].dt.year
df = df.dropna(subset=["year"])
df = df[df["year"].between(1940, 2024)]
df["year"] = df["year"].astype(int)
df["comment_len"] = df["comments"].str.len()
print(f"  Loaded: {len(df):,} records")

# ── Extraction Rules ───────────────────────────────────────────────────────

SHAPE_PATTERNS = {
    "Triangle":  r"\b(triangle|triangular|delta|wedge|v.?shape|boomerang|chevron)\b",
    "Sphere":    r"\b(sphere|spherical|orb|ball|globular|round object|circular object)\b",
    "Disc":      r"\b(disc|disk|saucer|flying saucer|flat.{0,10}circular|lenticular)\b",
    "Cigar":     r"\b(cigar|cylinder|cylindrical|elongated|tube.?shaped|pencil.?shape|rod)\b",
    "Light":     r"\b(light|lights|glowing|luminous|bright point|star.?like|starlike)\b",
    "Fireball":  r"\b(fireball|fire.?ball|meteor|comet.?like|burning|flaming|blazing)\b",
    "Formation": r"\b(formation|fleet|squadron|group of|multiple object|several object)\b",
    "Unknown":   r"\b(shapeless|formless|indistinct|unclear shape|no clear shape)\b",
}

SOUND_PATTERNS = {
    "silent":  r"\b(silent|no sound|soundless|noiseless|quiet|made no noise|without sound|absolute silence)\b",
    "humming": r"\b(hum|humming|buzz|buzzing|low.{0,10}drone|drone|low frequency)\b",
    "loud":    r"\b(loud|roar|roaring|thunder|thunderous|deafening|ear.?splitting)\b",
    "whoosh":  r"\b(whoosh|whooshing|rushing|wind.?sound|swoosh)\b",
}

MOVEMENT_PATTERNS = {
    "instant_acceleration": r"\b(instant|instantly|sudden|immediate|shot away|vanished|disappeared instantly|blink|flash|hypersonic|extreme speed|impossibly fast)\b",
    "hovering":             r"\b(hover|hovering|stationary|motionless|stood still|suspended|floating|hang|hanging)\b",
    "erratic":              r"\b(erratic|zigzag|zig.?zag|random|irregular|unpredictable|darted|jerky|back and forth)\b",
    "formation_flight":     r"\b(formation|in line|parallel|synchronized|together|convoy|in unison)\b",
    "slow_drift":           r"\b(drifting|slowly|gradual|meandering|gliding|floating slowly)\b",
    "right_angle":          r"\b(right angle|90.degree|sharp turn|abrupt turn|turned sharply|direction change)\b",
}

LIGHT_PATTERNS = {
    "pulsing":   r"\b(pulsing|pulsed|pulsate|flickering|flicker|blink|blinking|strobing|strobe)\b",
    "solid":     r"\b(solid light|constant light|steady light|unwavering|consistent glow)\b",
    "multicolor":r"\b(red and (blue|green|white)|blue and red|color.?changing|multicolor|multi.?color|changing color)\b",
    "white":     r"\b(white light|bright white|glowing white|pure white)\b",
    "orange":    r"\b(orange|amber.{0,15}light|orange.{0,15}glow)\b",
}

MILITARY_PATTERNS = {
    "base_proximity":  r"\b(air force base|afb|military base|naval base|nas |nab |fort |camp |mcas)\b",
    "nuclear_zone":    r"\b(nuclear|missile silo|icbm|minuteman|nuclear plant|nuclear facility|warhead)\b",
    "aircraft_chase":  r"\b(f-16|f-18|jet|fighter|scrambled|intercept|chase|followed by|escort)\b",
    "radar_mentioned": r"\b(radar|detected on radar|radar track|radar contact|radar return|air traffic control|atc)\b",
    "pilot_witness":   r"\b(pilot|co.?pilot|flight crew|airline|commercial flight|air traffic|atc officer)\b",
}

CREDIBILITY_SIGNALS = {
    "multiple_witnesses": r"\b(multiple|several witnesses|many witness|group of people|dozens|hundreds|thousands)\b",
    "official_report":    r"\b(reported to|faa|police|sheriff|military|official|government|department of defense|dod)\b",
    "video_photo":        r"\b(photograph|photo|picture|video|film|footage|recorded|camera|cell.?phone|phone camera)\b",
    "physical_evidence":  r"\b(landing.?mark|burn mark|radiation|soil disturb|imprint|trace|physical evidence)\b",
    "professional":       r"\b(astronomer|scientist|engineer|doctor|law enforcement|military personnel|trained observer)\b",
}

ANOMALY_BEHAVIORS = {
    "physics_violation":  r"\b(impossible|defied|defying|against physics|no propulsion|no wings|no exhaust|no heat|no sound despite speed)\b",
    "size_anomaly":       r"\b(enormous|massive|huge|gigantic|size of|football field|aircraft carrier|city block|mile)\b",
    "trans_medium":       r"\b(entered water|went into|ocean|sea|lake|plunged|submerged|came out of water|emerged from)\b",
    "cloaking":           r"\b(disappeared|vanished|invisible|cloaked|faded|dematerialized|transparent|see.through)\b",
    "electromagnetic":    r"\b(car stalled|engine died|electronic|power out|compass|interference|magnetic|electrical)\b",
}

def extract(text: str) -> dict:
    t = text.lower()
    result: dict = {}

    # Shape from narrative
    for label, pattern in SHAPE_PATTERNS.items():
        if re.search(pattern, t, re.I):
            result["extracted_shape"] = label
            break

    # Sound
    for label, pattern in SOUND_PATTERNS.items():
        if re.search(pattern, t, re.I):
            result["sound"] = label
            break

    # Movement
    movements = [l for l, p in MOVEMENT_PATTERNS.items() if re.search(p, t, re.I)]
    if movements:
        result["movement"] = movements[0]
        result["movement_tags"] = movements

    # Light behavior
    lights = [l for l, p in LIGHT_PATTERNS.items() if re.search(p, t, re.I)]
    if lights:
        result["light_behavior"] = lights

    # Military signals
    mil = [l for l, p in MILITARY_PATTERNS.items() if re.search(p, t, re.I)]
    result["military_signals"] = mil
    result["military_context"] = len(mil) > 0

    # Credibility signals
    cred = [l for l, p in CREDIBILITY_SIGNALS.items() if re.search(p, t, re.I)]
    result["credibility_signals"] = cred
    result["credibility_score"] = min(100, 30 + len(cred) * 17 + len(mil) * 10)

    # Anomaly behaviors
    anomalies = [l for l, p in ANOMALY_BEHAVIORS.items() if re.search(p, t, re.I)]
    result["anomaly_behaviors"] = anomalies
    result["anomaly_count"] = len(anomalies)

    # Word count as richness proxy
    result["narrative_richness"] = min(100, len(text.split()) * 2)

    return result

# ── Process all records ────────────────────────────────────────────────────
print("\nExtracting intelligence from 79,621 narratives...")
print("(Rule-based NLP — no API, no cost, runs locally)")

extracted = []
batch_size = 5000
total = len(df)

for i, (_, row) in enumerate(df.iterrows()):
    if i % batch_size == 0:
        pct = i / total * 100
        bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
        print(f"  [{bar}] {pct:5.1f}%  {i:,}/{total:,}", end="\r")
        sys.stdout.flush()

    fields = extract(str(row["comments"]))
    extracted.append({
        "id":       f"N{i:06d}",
        "year":     int(row["year"]),
        "state":    str(row["state"]) if pd.notna(row["state"]) else "",
        "country":  str(row["country"]) if pd.notna(row["country"]) else "",
        "city":     str(row["city"]) if pd.notna(row["city"]) else "",
        "shape_raw":str(row["shape"]),
        "comment_preview": str(row["comments"])[:200],
        **fields,
    })

print(f"\n  [████████████████████] 100.0%  {total:,}/{total:,}")
print(f"  ✓ Extraction complete: {total:,} records processed")

df_out = pd.DataFrame(extracted)

# ── Aggregate results ──────────────────────────────────────────────────────
print("\nBuilding aggregated intelligence datasets...")

# 1. Sound distribution
sound_counts = df_out["sound"].value_counts().reset_index()
sound_counts.columns = ["sound", "count"]
sound_data = sound_counts.to_dict("records")

# 2. Movement distribution
all_movements = []
for tags in df_out["movement_tags"].dropna():
    all_movements.extend(tags)
movement_counts = pd.Series(all_movements).value_counts().reset_index()
movement_counts.columns = ["movement", "count"]
movement_data = movement_counts.to_dict("records")

# 3. Credibility signal frequency
all_cred = []
for tags in df_out["credibility_signals"].dropna():
    all_cred.extend(tags)
cred_counts = pd.Series(all_cred).value_counts().reset_index()
cred_counts.columns = ["signal", "count"]
cred_data = cred_counts.to_dict("records")

# 4. Anomaly behavior frequency
all_anomalies = []
for tags in df_out["anomaly_behaviors"].dropna():
    all_anomalies.extend(tags)
anomaly_counts = pd.Series(all_anomalies).value_counts().reset_index()
anomaly_counts.columns = ["behavior", "count"]
anomaly_data = anomaly_counts.to_dict("records")

# 5. Military context by year
mil_by_year = (df_out[df_out["military_context"] == True]
               .groupby("year").size()
               .reset_index(name="count")
               .sort_values("year"))
mil_year_data = mil_by_year.to_dict("records")

# 6. Extracted shape vs raw shape comparison
extracted_shape_counts = df_out["extracted_shape"].value_counts().reset_index()
extracted_shape_counts.columns = ["shape", "count"]
shape_extracted_data = extracted_shape_counts.to_dict("records")

# 7. High-credibility records (score >= 70)
high_cred = df_out[df_out["credibility_score"] >= 70].copy()
high_cred_by_year = (high_cred.groupby("year").size()
                     .reset_index(name="count")
                     .sort_values("year"))
high_cred_year_data = high_cred_by_year.to_dict("records")

# 8. Physics violation reports by year
physics = df_out[df_out["anomaly_behaviors"].apply(
    lambda x: "physics_violation" in x if isinstance(x, list) else False
)]
physics_by_year = (physics.groupby("year").size()
                   .reset_index(name="count")
                   .sort_values("year"))
physics_year_data = physics_by_year.to_dict("records")

# 9. Silent + instant acceleration cases (the most anomalous)
def is_top_anomaly(row):
    tags = row.get("movement_tags")
    if not isinstance(tags, list):
        return False
    return row.get("sound") == "silent" and "instant_acceleration" in tags
top_anomaly = df_out[df_out.apply(is_top_anomaly, axis=1)]
top_anomaly_by_year = (top_anomaly.groupby("year").size()
                       .reset_index(name="count")
                       .sort_values("year"))
top_anomaly_year_data = top_anomaly_by_year.to_dict("records")

# 10. Summary stats
stats = {
    "total_processed":        int(total),
    "silent_reports":         int((df_out["sound"] == "silent").sum()),
    "hovering_reports":       int(df_out["movement"].eq("hovering").sum()),
    "instant_accel_reports":  int(df_out["movement"].eq("instant_acceleration").sum()),
    "military_context":       int(df_out["military_context"].sum()),
    "physics_violations":     int(len(physics)),
    "high_credibility":       int(len(high_cred)),
    "with_video_photo":       int(df_out["credibility_signals"].apply(lambda x: "video_photo" in x if isinstance(x, list) else False).sum()),
    "trans_medium":           int(df_out["anomaly_behaviors"].apply(lambda x: "trans_medium" in x if isinstance(x, list) else False).sum()),
    "electromagnetic":        int(df_out["anomaly_behaviors"].apply(lambda x: "electromagnetic" in x if isinstance(x, list) else False).sum()),
    "top_anomaly_combo":      int(len(top_anomaly)),
    "silent_pct":             round(int((df_out["sound"] == "silent").sum()) / total * 100, 1),
    "military_pct":           round(int(df_out["military_context"].sum()) / total * 100, 1),
    "physics_violation_pct":  round(len(physics) / total * 100, 1),
}

# 11. Sample top anomaly records (for display)
sample_top = (top_anomaly
              .sort_values("credibility_score", ascending=False)
              .head(50)[["id","year","state","country","city",
                          "extracted_shape","sound","movement_tags",
                          "anomaly_behaviors","credibility_score","comment_preview"]]
              .to_dict("records"))

# ── Write outputs ──────────────────────────────────────────────────────────
print("\nWriting intelligence files to public/data/...")

files = {
    "extracted_sound.json":          sound_data,
    "extracted_movement.json":       movement_data,
    "extracted_credibility.json":    cred_data,
    "extracted_anomalies.json":      anomaly_data,
    "extracted_military_by_year.json": mil_year_data,
    "extracted_shapes.json":         shape_extracted_data,
    "extracted_high_cred_year.json": high_cred_year_data,
    "extracted_physics_year.json":   physics_year_data,
    "extracted_top_anomaly_year.json": top_anomaly_year_data,
    "extracted_stats.json":          stats,
    "extracted_top_cases.json":      sample_top,
}

for fname, data in files.items():
    path = OUT_DIR / fname
    with open(path, "w") as f:
        json.dump(data, f, separators=(",", ":"), default=safe_default)
    kb = path.stat().st_size / 1024
    records = len(data) if isinstance(data, list) else "obj"
    print(f"  ✓ {fname:<42} ({kb:6.1f} KB, {records} records)")

print(f"""
{'=' * 52}
EXTRACTION COMPLETE

  Records processed : {stats['total_processed']:,}
  Silent objects    : {stats['silent_reports']:,}  ({stats['silent_pct']}%)
  Instant accel     : {stats['instant_accel_reports']:,}
  Physics violations: {stats['physics_violations']:,}  ({stats['physics_violation_pct']}%)
  Military context  : {stats['military_context']:,}  ({stats['military_pct']}%)
  High credibility  : {stats['high_credibility']:,}
  Top anomaly combo : {stats['top_anomaly_combo']:,}
  (Silent + Instant Acceleration — most unexplained behavior pattern)

Files written to: public/data/
Run the dev server to see results in Step 03 ANALYZE
{'=' * 52}
""")
