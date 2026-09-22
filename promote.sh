#!/bin/sh
set -eu
if [ "$#" -ne 1 ]; then
  echo 'Usage: sh promote.sh <verified-preview-url>' >&2
  exit 2
fi
npx --yes vercel@59.25.0 promote "$1"
