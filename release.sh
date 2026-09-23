#!/bin/sh
set -eu

# Release the current website and linked vault commits to reality.design.
cd "$(dirname "$0")"

case "${1-}" in
  --help)
    echo 'Usage: sh release.sh [--check]'
    echo 'Checks both repositories, builds and verifies a staged production deployment, then promotes it.'
    exit 0
    ;;
  ''|--check) ;;
  *)
    echo 'Usage: sh release.sh [--check]' >&2
    exit 2
    ;;
esac
[ "$#" -le 1 ] || { echo 'Usage: sh release.sh [--check]' >&2; exit 2; }

for command in curl git node npx; do
  command -v "$command" >/dev/null 2>&1 || { echo "Missing command: $command" >&2; exit 1; }
done
[ -d vault ] || { echo 'Missing linked vault directory.' >&2; exit 1; }
[ -f .vercel/project.json ] || { echo 'Run vercel link for the website project first.' >&2; exit 1; }
node -e 'const p = require("./.vercel/project.json"); if (p.projectId !== "prj_We3FYWn5jTfgEjbsinKjLiPI2LuG" || p.orgId !== "team_S29TLsbS8lXAm49FngUJxFR0") process.exit(1)' || {
  echo 'The linked Vercel project is not Reality Design Lab.' >&2
  exit 1
}

for repo in . vault; do
  [ "$(git -C "$repo" branch --show-current)" = main ] || {
    echo "$repo must be on main." >&2
    exit 1
  }
  [ -z "$(git -C "$repo" status --porcelain)" ] || {
    echo "$repo has uncommitted changes." >&2
    exit 1
  }
  local_head=$(git -C "$repo" rev-parse HEAD)
  remote_head=$(git -C "$repo" ls-remote origin refs/heads/main | cut -f1)
  [ -n "$remote_head" ] && [ "$local_head" = "$remote_head" ] || {
    echo "$repo main does not match origin/main. Push or pull it before releasing." >&2
    exit 1
  }
  echo "$repo: $local_head"
done

if [ "${1-}" = --check ]; then
  echo 'Release preflight passed.'
  exit 0
fi

npx --yes --package=node@24 --package=vercel@59.25.0 -c 'vercel pull --yes --environment=production && vercel build --prod'
staged_url=$(npx --yes --package=node@24 --package=vercel@59.25.0 -c 'vercel deploy --prebuilt --prod --skip-domain')
case "$staged_url" in
  https://realitydeslab-website-*.vercel.app) ;;
  *) echo "Unexpected staged deployment URL: $staged_url" >&2; exit 1 ;;
esac

echo "Checking staged deployment: $staged_url"
VERCEL_CURL=1 node scripts/check-deployment.mjs "$staged_url"
npx --yes vercel@59.25.0 promote "$staged_url"
node scripts/check-deployment.mjs https://reality.design
echo "Released to https://reality.design from $staged_url"
