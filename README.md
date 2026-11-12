# LagiButuh-web

Web version of LagiButuh — the Flutter web release of the app, published as a
static bundle from the repository root.

## Hosting

| Host | URL | Notes |
| --- | --- | --- |
| Vercel (canonical) | https://lagibutuh.thedev.id | Project `lagibutuh`, deploys `main` on every push |
| Vercel (default) | https://lagibutuh.vercel.app | Same deployment, Vercel's own domain |
| GitHub Pages (legacy) | https://grey21onyx.github.io/LagiButuh-web/ | Kept alive, forwards to the canonical domain |

`vercel.json` only sets cache headers for the entrypoints (`index.html`, the
service workers, `main.dart*`, `version.json`); everything else is served as
static files. No build step runs on Vercel — the checked-in bundle is the
release.

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

1. `flutter build web --release --wasm --dart-define-from-file=env/ci.json`
2. replace everything in this repository except `.git`, `.github`,
   `README.md`, `vercel.json` and `.nojekyll` with `build/web/`
3. commit and push to `main`, which is the commit Vercel deploys

The workflow needs `WEB_DEPLOY_TOKEN` (a fine-grained token with write access
to this repository) plus the Supabase build defines as repository secrets.

To publish by hand, run the same build in the app repository and copy
`build/web/` over this repository's root, keeping the files listed above.
