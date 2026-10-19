#!/usr/bin/env bash
# Fallback boot hook (cron @reboot) when systemd units are not yet installed.
# Ensures MongoDB container exists, then starts Node apps if their ports are down.
set -euo pipefail

LOG="${HOME}/site-boot/reboot-start.log"
BOOT_DIR="${HOME}/site-boot"
mkdir -p "${BOOT_DIR}"
exec >>"${LOG}" 2>&1
echo "=== $(date -Is) reboot-start-websites ==="

MONGO_CONTAINER="${MONGO_CONTAINER:-gamainet-mongo}"
MONGO_IMAGE="${MONGO_IMAGE:-mongo:7.0}"
MONGO_DATA="${MONGO_DATA:-/var/lib/mongodb}"

if command -v docker >/dev/null 2>&1; then
  if ! docker ps --format '{{.Names}}' | grep -qx "${MONGO_CONTAINER}"; then
    if docker ps -a --format '{{.Names}}' | grep -qx "${MONGO_CONTAINER}"; then
      docker start "${MONGO_CONTAINER}" || true
    else
      docker run -d --name "${MONGO_CONTAINER}" --restart unless-stopped \
        -v "${MONGO_DATA}:/data/db" \
        -p 127.0.0.1:27017:27017 \
        "${MONGO_IMAGE}" mongod --bind_ip_all || true
    fi
  fi
fi

"${BOOT_DIR}/wait-for-mongo.sh" || exit 1

start_node_if_down() {
  local port="$1"
  local dir="$2"
  local label="$3"

  if curl -sf -o /dev/null --max-time 3 "http://127.0.0.1:${port}/"; then
    echo "${label}: already listening on ${port}"
    return 0
  fi

  echo "${label}: starting Node in ${dir} on port ${port}"
  cd "${dir}"
  # shellcheck disable=SC1091
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
  nohup /usr/bin/node server.js >>"${BOOT_DIR}/${label}.log" 2>&1 &
  disown || true

  for _ in $(seq 1 30); do
    if curl -sf -o /dev/null --max-time 2 "http://127.0.0.1:${port}/"; then
      echo "${label}: up on ${port}"
      return 0
    fi
    sleep 1
  done
  echo "${label}: failed to bind ${port}" >&2
  return 1
}

start_node_if_down 3002 /var/www/smateq.gm smateq || true
start_node_if_down 3008 /var/www/gamainet.org gamainet || true

echo "=== $(date -Is) done ==="
