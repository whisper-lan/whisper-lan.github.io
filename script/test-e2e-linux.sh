#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
image="mcr.microsoft.com/playwright:v1.61.1-noble"

docker run --rm --init --ipc=host --platform linux/amd64 \
  --env CI=1 \
  --volume "${repo_dir}:/work" \
  --volume whisper-web-node-modules-v1-61-1:/work/node_modules \
  --volume whisper-web-next-v1-61-1:/work/.next \
  --workdir /work \
  "${image}" \
  bash -lc 'npm ci && npx playwright test "$@"' -- "$@"
