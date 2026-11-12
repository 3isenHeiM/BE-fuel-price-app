# Daily Cloudflare price refresh

The [daily refresh workflow](../.github/workflows/refresh-cloudflare.yml) triggers
a Cloudflare Pages production build every day at **12:15 UTC**. This is 13:15
in Belgium in winter and 14:15 in summer. It can also be run manually from
GitHub Actions. GitHub may delay scheduled runs.

The job sends a POST request to a Cloudflare deploy hook for the `main` branch
of `3isenHeiM/BE-fuel-price-app`. Cloudflare clones that branch and runs its
configured build command:

```sh
npm test -- --watchAll=false --runInBand && npm run sync:history && npm run build
```

The sync downloads the latest history from the Mazout.com/CARBU API and writes
`public/data/heating-oil-history.json`. Cloudflare then builds and publishes the
site at <https://be-fuel-price-app-github.pages.dev/>. No code commit, running
computer, or server process is needed for each refresh.

## Activate once

1. In Cloudflare, open the **be-fuel-price-app-github** Pages project, then
   **Settings → Builds → Add deploy hook**.
2. Name the hook `daily-price-refresh` and select branch **main**.
3. Copy the generated hook URL. Treat it as a secret: anyone with the URL can
   trigger a build. Do not commit it or paste it into an issue comment.
4. In the [GitHub repository's Actions secrets](https://github.com/3isenHeiM/BE-fuel-price-app/settings/secrets/actions),
   add a repository secret named **CLOUDFLARE_DEPLOY_HOOK**, with that URL as its
   value. No Cloudflare API token or account ID secret is required.
5. Push and merge this workflow into the repository's default branch, `main`.
   A scheduled workflow on `dev` alone will not run.
6. In GitHub Actions, select **Refresh Cloudflare Prices Daily → Run workflow**.
   Confirm that the Cloudflare deployment finishes successfully and that
   `/data/heating-oil-history.json` has a newer `metadata.syncedAt` value.

The Cloudflare project must retain the build command above, Node.js 26 LTS, build
output directory `build`, and `PUBLIC_URL=/`. These were configured when the
Git-connected project was created. See [Cloudflare's deploy hook documentation](https://developers.cloudflare.com/pages/configuration/deploy-hooks/).

## Failure handling and freshness

- A missing secret stops the workflow with a setup message. HTTP errors from
  the hook also fail the job. Requests have connection and overall timeouts.
- A successful GitHub job means Cloudflare accepted the build request. Check
  Cloudflare's **Deployments** tab for the actual build result. A failed sync,
  test, or build leaves the previous successful site available.
- The job sends one request per run. It does not retry POST requests, which
  could queue duplicate builds. Use **Run workflow** to retry after a failure.
- The publication date advances only when the upstream source publishes a
  new price. It may stay the same even when `metadata.syncedAt` changes.
- Visitors see the new snapshot after reloading the page or using **Reload
  local history**. An already open page does not poll for changes.
- Public repositories may have scheduled workflows disabled by GitHub after
  60 days without repository activity. Re-enable the workflow if that happens.
- The existing GitHub Pages workflow publishes a separate site; it does not
  refresh this Cloudflare deployment.
