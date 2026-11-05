# Changelog

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
