# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0] - 2026-11-12

### Added

- Link the latest-publication card to SPF Economy's official tariff page, with translated tooltips and keyboard focus styling.
- Support GitHub-backed Cloudflare Pages deployment with production builds from `main`, branch previews, and a daily price-refresh trigger at 12:15 UTC. Enable the schedule by configuring the `CLOUDFLARE_DEPLOY_HOOK` GitHub repository secret and merging the workflow into `main` (refs [#1]).

### Changed

- Use Node.js 26 LTS for development and CI through `.node-version`. Cloudflare production and preview builds must use `NODE_VERSION=26`.
- Refresh the bundled heating-oil price history with 147 additional observations, bringing the snapshot to 2,298 points.

### Fixed

- Build assets for the Cloudflare domain root while preserving the GitHub Pages repository subpath (refs [#1]).
- Remove references to unavailable favicon and application icon files to prevent broken asset requests.

[#1]: https://github.com/3isenHeiM/BE-fuel-price-app/issues/1
