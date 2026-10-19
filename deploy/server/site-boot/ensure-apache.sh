#!/usr/bin/env bash
# Restart Apache if it stopped (e.g. after OOM). Install via cron with sudo — see README.
set -euo pipefail

LOG="${HOME}/site-boot/apache-monitor.log"
mkdir -p "$(dirname "${LOG}")"

if systemctl is-active --quiet apache2; then
  exit 0
fi

echo "$(date -Is): apache2 inactive; attempting start" >>"${LOG}"
if systemctl start apache2 >>"${LOG}" 2>&1; then
  echo "$(date -Is): apache2 started" >>"${LOG}"
else
  echo "$(date -Is): apache2 start failed (need sudo?)" >>"${LOG}"
  exit 1
fi
