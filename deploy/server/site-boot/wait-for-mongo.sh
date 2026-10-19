#!/usr/bin/env bash
# Wait until MongoDB accepts connections on localhost (native mongod or Docker).
set -euo pipefail

HOST="${MONGO_WAIT_HOST:-127.0.0.1}"
PORT="${MONGO_WAIT_PORT:-27017}"
TRIES="${MONGO_WAIT_TRIES:-90}"
SLEEP="${MONGO_WAIT_SLEEP:-2}"

for ((i = 1; i <= TRIES; i++)); do
  if command -v mongosh >/dev/null 2>&1; then
    if mongosh --quiet "mongodb://${HOST}:${PORT}/admin" --eval 'db.adminCommand({ ping: 1 })' >/dev/null 2>&1; then
      exit 0
    fi
  elif command -v mongo >/dev/null 2>&1; then
    if mongo --quiet "mongodb://${HOST}:${PORT}/admin" --eval 'db.adminCommand({ ping: 1 })' >/dev/null 2>&1; then
      exit 0
    fi
  else
    if (echo >/dev/tcp/"${HOST}"/"${PORT}") 2>/dev/null; then
      exit 0
    fi
  fi
  sleep "${SLEEP}"
done

echo "MongoDB not reachable at ${HOST}:${PORT} after ${TRIES} attempts" >&2
exit 1
