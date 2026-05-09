"""
Processes raw NUFORC CSV into aggregated JSON files for the research dashboard.
Outputs to public/data/ so Next.js can serve them as static files.
"""
import pandas as pd
import json
import math
from pathlib import Path
from collections import defaultdict

RAW = Path(__file__).parent / "nuforc_raw.csv"
OUT = Path(__file__).parent.parent / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

COLS = ["datetime","city","state","country","shape",
        "duration_seconds","duration_hm","comments","date_posted","lat","lng"]

print("Loading NUFORC data...")
df = pd.read_csv(RAW, header=None, names=COLS, low_memory=False)
print(f"  Raw rows: {len(df)}")

# ── Clean ──────────────────────────────────────────────────────────────
df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
df["year"]  = df["datetime"].dt.year
df["month"] = df["datetime"].dt.month
df["hour"]  = df["datetime"].dt.hour
df["duration_seconds"] = pd.to_numeric(df["duration_seconds"], errors="coerce")
df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
df["lng"] = pd.to_numeric(df["lng"], errors="coerce")
df["shape"] = df["shape"].str.lower().str.strip().fillna("unknown")
df["state"] = df["state"].str.upper().str.strip()
df["country"] = df["country"].str.lower().str.strip()

# Drop rows with no usable year
df = df.dropna(subset=["year"])
df = df[df["year"] >= 1940]
df = df[df["year"] <= 2024]
df["year"] = df["year"].astype(int)
print(f"  Cleaned rows: {len(df)}")

TOTAL = len(df)

# ── 1. Sightings by Year ───────────────────────────────────────────────
by_year = (df.groupby("year").size()
             .reset_index(name="count")
             .sort_values("year"))
save_year = by_year.to_dict("records")
print(f"  Years: {len(save_year)}")

# ── 2. Sightings by Shape ──────────────────────────────────────────────
shape_map = {
    "light":"Light","circle":"Circle","triangle":"Triangle",
    "fireball":"Fireball","unknown":"Unknown","other":"Other",
    "sphere":"Sphere","disk":"Disk","oval":"Oval","formation":"Formation",
    "cigar":"Cigar","flash":"Flash","rectangle":"Rectangle",
    "chevron":"Chevron","diamond":"Diamond","teardrop":"Teardrop",
    "egg":"Egg","cone":"Cone","cross":"Cross","cylinder":"Cylinder",
    "changing":"Changing","delta":"Delta",
}
df["shape_clean"] = df["shape"].map(shape_map).fillna("Other")
by_shape = (df.groupby("shape_clean").size()
              .reset_index(name="count")
              .sort_values("count", ascending=False)
              .head(15))
save_shape = by_shape.to_dict("records")

# ── 3. Sightings by US State ───────────────────────────────────────────
us = df[df["country"] == "us"]
by_state = (us.groupby("state").size()
               .reset_index(name="count")
               .sort_values("count", ascending=False))
# keep valid 2-letter state codes
valid_states = {"AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID",
                "IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS",
                "MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
                "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV",
                "WI","WY","DC"}
by_state = by_state[by_state["state"].isin(valid_states)]
save_state = by_state.to_dict("records")

# ── 4. Sightings by Hour of Day ────────────────────────────────────────
by_hour = (df.groupby("hour").size()
             .reset_index(name="count")
             .sort_values("hour"))
save_hour = by_hour.to_dict("records")

# ── 5. Duration Analysis (buckets) ────────────────────────────────────
dur = df["duration_seconds"].dropna()
dur = dur[(dur > 0) & (dur < 86400)]  # 0 to 24 hours
buckets = [
    ("< 1 min",    0,    60),
    ("1–5 min",    60,   300),
    ("5–15 min",   300,  900),
    ("15–60 min",  900,  3600),
    ("1–4 hrs",    3600, 14400),
    ("> 4 hrs",    14400,86400),
]
dur_data = []
for label, lo, hi in buckets:
    cnt = int(((dur >= lo) & (dur < hi)).sum())
    dur_data.append({"label": label, "count": cnt})

# ── 6. Sightings by Country ────────────────────────────────────────────
by_country = (df.groupby("country").size()
                .reset_index(name="count")
                .sort_values("count", ascending=False)
                .head(12))
country_names = {
    "us":"United States","gb":"United Kingdom","ca":"Canada",
    "au":"Australia","de":"Germany","fr":"France","in":"India",
    "mx":"Mexico","br":"Brazil","nl":"Netherlands","nz":"New Zealand",
    "it":"Italy","es":"Spain","se":"Sweden","no":"Norway",
}
by_country["country"] = by_country["country"].map(country_names).fillna(by_country["country"].str.upper())
save_country = by_country.to_dict("records")

# ── 7. Shape Trends by Decade ──────────────────────────────────────────
df["decade"] = (df["year"] // 10 * 10).astype(str) + "s"
top_shapes = ["Light","Circle","Triangle","Fireball","Sphere","Disk","Unknown"]
decade_shape = {}
for decade, grp in df.groupby("decade"):
    sc = grp["shape_clean"].value_counts()
    decade_shape[decade] = {s: int(sc.get(s, 0)) for s in top_shapes}
# Sort decades
decades_sorted = sorted(decade_shape.keys())
save_decade = [{"decade": d, **decade_shape[d]} for d in decades_sorted if int(d[:-1]) >= 1940]

# ── 8. Top Cities ──────────────────────────────────────────────────────
top_cities = (us.groupby("city").size()
                .reset_index(name="count")
                .sort_values("count", ascending=False)
                .head(20))
save_cities = top_cities.to_dict("records")

# ── 9. Month Distribution ─────────────────────────────────────────────
month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
by_month = (df.groupby("month").size().reset_index(name="count").sort_values("month"))
by_month["month_name"] = by_month["month"].apply(lambda x: month_names[int(x)-1] if 1<=x<=12 else "?")
save_month = by_month[["month_name","count"]].to_dict("records")

# ── 10. Map Points (sample for performance — top 5000 with lat/lng) ───
has_coords = df.dropna(subset=["lat","lng"])
has_coords = has_coords[(has_coords["lat"].abs() < 90) & (has_coords["lng"].abs() < 180)]
# Take recent + credible (longer reports)
has_coords = has_coords.copy()
has_coords["comment_len"] = has_coords["comments"].str.len().fillna(0)
sample = has_coords.nlargest(8000, "comment_len")[["lat","lng","year","shape_clean","city","state","country","duration_seconds"]].copy()
sample = sample.dropna(subset=["lat","lng"])
sample["lat"] = sample["lat"].round(4)
sample["lng"] = sample["lng"].round(4)
sample["duration_seconds"] = sample["duration_seconds"].fillna(0).astype(int)
map_points = sample.to_dict("records")
print(f"  Map points: {len(map_points)}")

# ── 11. Key Stats ─────────────────────────────────────────────────────
years_span = f"{int(df['year'].min())}–{int(df['year'].max())}"
peak_year = int(by_year.loc[by_year['count'].idxmax(), 'year'])
top_shape = save_shape[0]["shape_clean"]
us_pct = round(len(us) / TOTAL * 100)
night_hours = df[df["hour"].isin([20,21,22,23,0,1,2])].shape[0]
night_pct = round(night_hours / TOTAL * 100)
median_dur = round(float(dur.median()))

stats = {
    "total": TOTAL,
    "years_span": years_span,
    "peak_year": peak_year,
    "peak_year_count": int(by_year.loc[by_year["year"] == peak_year, "count"].values[0]),
    "top_shape": top_shape,
    "top_state": save_state[0]["state"] if save_state else "CA",
    "us_pct": us_pct,
    "night_pct": night_pct,
    "median_duration_seconds": median_dur,
    "countries": len(by_country),
    "triangle_count": int(df[df["shape_clean"] == "Triangle"].shape[0]),
    "military_states_top": ["CA","TX","VA","FL","WA"],  # states with most military bases
}

# ── Write JSON files ───────────────────────────────────────────────────
files = {
    "nuforc_by_year.json":    save_year,
    "nuforc_by_shape.json":   save_shape,
    "nuforc_by_state.json":   save_state,
    "nuforc_by_hour.json":    save_hour,
    "nuforc_by_duration.json":dur_data,
    "nuforc_by_country.json": save_country,
    "nuforc_by_decade.json":  save_decade,
    "nuforc_top_cities.json": save_cities,
    "nuforc_by_month.json":   save_month,
    "nuforc_map_points.json": map_points,
    "nuforc_stats.json":      stats,
}

for fname, data in files.items():
    path = OUT / fname
    with open(path, "w") as f:
        json.dump(data, f, separators=(",",":"))
    kb = path.stat().st_size / 1024
    print(f"  ✓ {fname} ({kb:.0f} KB, {len(data) if isinstance(data, list) else 'obj'} records)")

print(f"\nDone. {len(files)} files written to public/data/")
print(f"Total NUFORC records processed: {TOTAL:,}")
