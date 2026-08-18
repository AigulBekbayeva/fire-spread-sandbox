# Fire Spread Sandbox

[![CI](https://github.com/USERNAME/fire-spread-sandbox/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/fire-spread-sandbox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![No build step](https://img.shields.io/badge/build-none-lightgrey.svg)](index.html)

Click anywhere on a map and watch where a grass fire starting at that point
would travel over the next few hours, driven by the live hourly wind forecast
for that exact location.

**[▶ Open the tool](https://USERNAME.github.io/fire-spread-sandbox/)**

One HTML file. No backend, no API key, no build step, no install. The date is
taken from your clock automatically.

*Русская версия: [README.ru.md](README.ru.md)*

---

## What it does

Pick a point. The page fetches the hourly forecast for those coordinates from
Open-Meteo — keyless and CORS-enabled, so everything runs in the browser — then
marches a fire perimeter forward hour by hour and animates the result.

- **Time slider** at the bottom scrubs through the forecast hours. Arrows step,
  space plays and pauses.
- **Burn outline** grows and bends as the wind veers, with the end-of-period
  extent shown as a dashed contour.
- **Smoke plume** drifts on the current hour's wind. Particles already in flight
  keep their original velocity, so the plume curves when the wind turns — the
  way real smoke does.
- **Controls** for forecast horizon (3–24 h), grass curing, and initial fire
  size.
- **Four basemaps** — dark (default), light grey, satellite, and OpenStreetMap,
  all with labels.

The palette is deliberate rather than decorative: the dark basemap lets the burn
outline glow and keeps the smoke legible, and the plume is lavender because grey
smoke simply disappears against a dark map while a cool violet reads clearly
without competing with the warm colours of fire.

## The model

Head-fire rate of spread follows Cheney, Gould & Catchpole (1998) for grassland:

```
U10 ≤ 5 km/h:  R = (0.054 + 0.269·U10) · Φm · Φc
U10 > 5 km/h:  R = (1.4 + 0.838·(U10−5)^0.844) · Φm · Φc
```

`Φm` corrects for fine dead fuel moisture, estimated from temperature and
humidity; `Φc` for grass curing (Cruz et al., 2015). Spread in directions off
the wind axis uses the standard elliptical relation, with length-to-breadth
`1.1·U10^0.464`.

Open-Meteo reports the direction wind blows **from**; fire travels the opposite
way, so `bearing = wind_direction + 180°`.

### How the perimeter advances

Each vertex moves along its own outward normal at the speed given by the angle
between that normal and the wind — Huygens' principle. As the head fans out,
new points are inserted into the gaps that open up.

Nothing is smoothed, and vertices are never resampled in place. Both were tried
and both fail the same way: they shave the sharp head of the fire and understate
reach by a factor of three. This is documented in the test suite, which pins the
head position against the analytical value at every hour.

Reference values, checked on every run:

| Wind, km/h | Rate of spread, km/h |
|---|---|
| 10 | 1.98 |
| 20 | 4.09 |
| 30 | 5.97 |

Below roughly 50% curing the model stops carrying fire: green grass does not
burn.

## Limitations

**This is an indicative estimate, not an operational forecast.** Do not use it
for evacuation or suppression decisions. It ignores terrain (fire runs several
times faster upslope), barriers such as rivers, roads and ploughed firebreaks,
gustiness within the hour, fuel load and patchiness, and firefighting.

The Cheney model was developed on Australian pasture. Applied anywhere else it
is an analogue, not a calibrated local model — and it assumes continuous grass
fuel, so results over forest, cropland, wetland or bare ground are meaningless.

Beyond a few hours the wind is itself a forecast, and that uncertainty compounds
on top of the fire model's own.

The smoke animation shows near-surface fire drift, **not** smoke dispersion.
Real plumes rise in a convection column and travel with winds aloft. Air quality
work needs a transport model such as HYSPLIT.

## Development

```bash
npm test           # extracts the model from index.html, runs 20 checks
npm run serve      # http://localhost:8000
```

The model lives inside `index.html` between `// ---- MODEL START` and
`// ---- MODEL END` so the tool stays a single portable file. The test harness
extracts that block into a module and exercises it in Node.

## Related project

[**steppe-fire-era5**](https://github.com/USERNAME/steppe-fire-era5) —
the retrospective counterpart. Instead of forecasting from a point you pick, it
pulls real NASA FIRMS hotspots for a past date, clusters them into fire
complexes, drives the same spread model with ERA5 reanalysis wind, and checks
the modelled direction against how the fires actually moved between satellite
overpasses.

Same physics, opposite direction in time: this one asks *what if*, that one asks
*what happened*.

## Sources

- Open-Meteo — hourly forecast wind, temperature and humidity
- Leaflet — mapping; Esri World Imagery — satellite basemap
- Cheney N.P., Gould J.S., Catchpole W.R. (1998). *Prediction of fire spread in
  grasslands.* International Journal of Wildland Fire, 8(1), 1–13.
- Cruz M.G. et al. (2015). *Empirical-based models for predicting head-fire rate
  of spread in Australian fuels.* Australian Forestry, 78(3), 118–158.

Citations are reproduced from memory — verify them before quoting in a report
or paper.

## License

MIT — see [LICENSE](LICENSE).
