# LagiButuh-web

Web version of LagiButuh — the Flutter web release of the app, published as a
static bundle from the repository root.

## Hosting

| Host | URL | Notes |
| --- | --- | --- |
| Cloudflare Pages (canonical) | https://lagibutuh.pages.dev | Deploys `main` on every push; the host users are meant to reach |
| Vercel (alias) | https://lagibutuh.vercel.app | Project `lagibutuh`, deploys `main` on every push, then answers every request with a 308 to the canonical host |
| GitHub Pages (legacy) | https://grey21onyx.github.io/LagiButuh-web/ | Kept alive, forwards to the canonical host when it answers |

`https://lagibutuh.thedev.id` is the intended branded domain but has no DNS
record yet, so nothing points at it: the shell's probe would fail and the Pages
copy would keep serving. Once the record exists, the redirect target is the one
`origin` constant in the emitted `index.html`/`404.html`, and the domain has to
be added to the Supabase redirect allow list before auth links may return there.

`vercel.json` sends the `lagibutuh.vercel.app` host to Cloudflare Pages: a single
`redirects` rule, scoped by `has: host`, replies 308 with the path preserved
and the query string passed through, so bookmarks, Supabase auth links and deep
links keep working after the move.

Nothing is served from that host any more, but the cache headers for the
entrypoints (`index.html`, the service workers, `main.dart*`, `version.json`) and
the `routes` below are kept for the other hostnames on the same project — the
branded domain and preview deployments — which still serve the bundle. No build
step runs on Vercel; the checked-in bundle is the release.

`/version.json` also carries `Access-Control-Allow-Origin: *`. That is what the
Pages shell's health probe reads: it forwards to the canonical host only when
that file answers **2xx** with `app_name: "lagibutuh"`. A 5xx, a Vercel outage
page, a parked host or a dead network leaves the visitor on GitHub Pages, whose
build is complete and whose origin is in the Supabase redirect allow list, so
sign-in still works there. Without the CORS header the probe cannot read the
response and never forwards.

## Precompressed engine

The CDN's on-the-fly brotli is low quality: the 4.0 MB dart2wasm module leaves
the edge as ~1.55 MB, while `brotli -q 11` makes it ~1.17 MB. The release
therefore ships `main.dart.wasm.br`, `canvaskit/skwasm.wasm.br` and
`main.dart.js.br` beside the plain files, and `vercel.json` delivers them
through `routes` — the legacy routing list, which is evaluated *before* the
filesystem check, unlike `rewrites`. A request that advertises `br` is served
the sibling with `Content-Type`, `Content-Encoding: br`, `Vary: Accept-Encoding`
and the same `Cache-Control` the plain file gets; every other client still gets
the plain file, which is also what GitHub Pages serves (Pages has no rewrites,
so the canonical filenames must stay in place).

Deleting the `routes` entry for a file reverts it to edge compression; nothing
else depends on the `.br` siblings.

## Cross-origin isolation

`/` and `/index.html` carry `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: credentialless`. Together they make
`crossOriginIsolated` true, which is what lets skwasm run its renderer on web
workers and allocate its wasm memory as a `SharedArrayBuffer` instead of
logging "Skwasm will run in single-threaded mode" and drawing on the main
thread.

`credentialless` rather than `require-corp`: the app renders public Supabase
Storage images whose responses carry no `Cross-Origin-Resource-Policy`, and
`require-corp` would block them. The cost is Safari, which does not implement
`credentialless` — it simply stays non-isolated and single-threaded.
`same-origin` (not `same-origin-allow-popups`) is required for isolation;
Google sign-in survives it because `signInWithOAuth` navigates the current tab
(`webOnlyWindowName: '_self'`) rather than opening a popup that needs
`window.opener`.

GitHub Pages cannot send headers, so that copy stays non-isolated and keeps
rendering single-threaded.

## Domain

`lagibutuh.thedev.id` is a free subdomain from
[thedev-id/thedev.id](https://github.com/thedev-id/thedev.id); it is registered
in that repo's `subdomains.json` as `cname.vercel-dns.com`, and the domain is
attached to the Vercel project.

## Old links

`index.html` and `404.html` carry a small script that runs only on `*.github.io`.
It probes the canonical domain and, once it answers, forwards visitors there
with the path, query and hash preserved (the app uses hash routing, so deep
links survive). While the record does not exist yet, the Pages copy keeps
serving the app instead of redirecting to a dead host.

## Release pipeline

The Flutter source lives in the `nossilleen/LagiButuh` repository. Its
`Deploy web release` workflow builds the bundle and publishes it here:

1. `pwsh tool/build_web.ps1` — `flutter build web --release --wasm -O4
   --no-web-resources-cdn`, then `tool/stamp_web_build.mjs` (service-worker
   build id) and `tool/precompress_web.mjs` (the `.br` siblings above)
2. replace everything in this repository except `.git`, `.github`,
   `README.md`, `vercel.json` and `.nojekyll` with `build/web/`
3. commit and push to `main`, which is the commit both hosts deploy: Cloudflare
   Pages serves it, Vercel answers with the 308 above

The workflow needs `WEB_DEPLOY_KEY` (the private half of a deploy key with
write access to this repository) plus `BUILD_ENV_JSON` (the contents of
`env/dev.json`) as repository secrets.

To publish by hand, run the same build in the app repository and copy
`build/web/` over this repository's root, keeping the files listed above.
