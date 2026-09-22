#!/bin/sh
set -eu
# Produce a preview; promote an explicitly reviewed deployment separately.
npx --yes --package=node@24 --package=vercel@59.25.0 -c 'vercel pull --yes --environment=preview && vercel build && vercel deploy --prebuilt'
