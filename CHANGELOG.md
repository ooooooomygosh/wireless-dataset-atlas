# Changelog

## 2.2.0

- Added 14 radio-map datasets: SpectrumNet was added earlier in 2.1.2; this release adds RadioMap-PCE, FARM, FR3 UxNB CKM, 3DCKM, DeepREM, Map2APS, optimal radio maps and deployments, Rome 4G/NB-IoT/5G passive measurements, Oslo and Rome NB-IoT coverage, Manaus mobile coverage, Yunnan campus 5G drive test, two indoor radio-map sets and a measured multi-source spectrum map set.
- Each new record has the 28-item capability matrix, a pipeline and a version history.

## 2.1.2

- Added SpectrumNet (multiband 3D radio maps, IEEE TCCN 2025).

## 2.1.1

- The task and data-type matrix now counts what can be obtained: provided, derivable by a standard transform, or produced by the generator or by a ray tracer on the released 3D scene. A toggle switches to directly provided data only.
- A second matrix covers scenario and propagation conditions (multi-user, multi-BS, paired bands, near field, high mobility, blockage, reflection, diffraction, scattering, transmission, polarization, EM field).
- The datasets list has a separate "directly provided" filter next to the "obtainable" one; matrix cells link to the matching filter.
- Added capability data for WINNER II and inference rules for CIR, CSI, power and beam labels; fixed three records whose signal list contradicted the capability matrix.

## 2.1.0

- Every dataset now carries a 28-item capability matrix (CSI, CIR, paths, power, I/Q, beam labels, position, geometry, materials, RGB, depth, LiDAR, radar, IMU, time series, multi-user, multi-BS, cross-frequency, near field, high mobility, dynamic blockage, reflection, diffraction, scattering, transmission, polarization, EM field), each marked provided, derivable, simulated, absent or unknown with a source-backed note.
- Added a version history per dataset: dataset releases, archive snapshots and paper revisions, newest first.
- The datasets list can be filtered by capability, and the compare view shows capability and version rows.
- Dataset pages are split into tabs (Overview, Generation pipeline, Specification, Versions, Notes, Papers and resources) with a key-facts strip.
- All 135 records were re-checked against their official pages and papers; incorrect or unsupported statements were corrected or removed.

## 2.0.0

- Rebuilt the site with Astro: one URL per dataset, task and language (`/en/`, `/zh/`).
- Data moved to one YAML file per dataset with schema validation.
- Added tasks beyond beam management: channel estimation, CSI feedback, channel prediction, DoA estimation, localization, radio maps, MIMO detection, modulation classification, RF fingerprinting, spectrum sensing, Wi-Fi sensing, ISAC, multimodal sensing, RIS, near-field, foundation models, network traffic.
- Each dataset lists its dataset paper and citing studies, with metadata from OpenAlex.
- Added filters with shareable URLs, comparison view with CSV export, and search.
- Dataset pages gain an overview, per-signal capture details and a data generation pipeline. Pipelines, field notes, history and usage steps from the 1.x catalog are kept for the datasets they covered.
- Added a Tools page with the 13 pipeline tools and the 7 runnable examples from 1.x, and restored the redistributable official materials under `public/materials/`.
- Removed the research-route wizard, topic pages and recommendation texts; the previous version stays available at the `v1.4.0` tag.

## 1.4.0

- Chinese and English interface for the single-page version.
