#!/usr/bin/env bash
set -euo pipefail

HOST="${AGATHON_HOST:-43.138.205.227}"
USER="${AGATHON_USER:-ubuntu}"
KEY="${AGATHON_KEY:-/Users/mac/Downloads/codex.pem}"
REMOTE_DIR="${AGATHON_REMOTE_DIR:-/opt/agathon-edu}"

SSH_OPTS=(
  -i "$KEY"
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
)

rsync -az --delete \
  --exclude ".git" \
  --exclude ".env" \
  --exclude "node_modules" \
  --exclude "dist" \
  --exclude ".DS_Store" \
  --exclude "._*" \
  -e "ssh ${SSH_OPTS[*]}" \
  ./ "$USER@$HOST:/tmp/agathon-edu-sync/"

ssh "${SSH_OPTS[@]}" "$USER@$HOST" "
  set -e
  sudo mkdir -p '$REMOTE_DIR'
  sudo rsync -az --delete \
    --exclude '.env' \
    /tmp/agathon-edu-sync/ '$REMOTE_DIR'/
  cd '$REMOTE_DIR'
  sudo docker compose up -d --build
  for i in \$(seq 1 12); do
    if curl -fsS --max-time 15 http://127.0.0.1/api/health; then
      exit 0
    fi
    sleep 3
  done
  exit 1
"
