#!/usr/bin/env bash
# Check whether gamainet.org and smateq.gm should survive a reboot.
set -euo pipefail

ok=0
warn=0
fail=0

pass() { echo "OK   $*"; ok=$((ok + 1)); }
warn() { echo "WARN $*"; warn=$((warn + 1)); }
fail() { echo "FAIL $*"; fail=$((fail + 1)); }

echo "=== Boot readiness ($(date -Is)) ==="

if systemctl is-active apache2 >/dev/null 2>&1; then
  pass "apache2 is running (public HTTPS/HTTP)"
else
  fail "apache2 is not running — all vhosts (gamainet, smateq, etc.) unreachable"
fi

if systemctl is-enabled mongod >/dev/null 2>&1; then
  pass "mongod unit is enabled"
else
  fail "mongod unit is not enabled"
fi

if systemctl is-active mongod >/dev/null 2>&1; then
  pass "mongod is running"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -qx gamainet-mongo; then
  warn "mongod down but gamainet-mongo container is running"
elif systemctl is-enabled gamainet-mongo-docker >/dev/null 2>&1; then
  pass "gamainet-mongo-docker unit enabled (Docker Mongo on boot)"
else
  fail "no MongoDB (mongod or Docker) running/enabled for boot"
fi

for unit in gamainet-website smateq-website; do
  if systemctl is-enabled "${unit}" >/dev/null 2>&1; then
    pass "${unit} enabled"
  else
    if crontab -l 2>/dev/null | grep -q 'reboot-start-websites.sh'; then
      warn "${unit} not enabled; cron @reboot fallback is configured"
    else
      fail "${unit} not enabled and no cron fallback"
    fi
  fi
done

if curl -sf -o /dev/null --max-time 3 http://127.0.0.1:3008/; then
  pass "gamainet backend responds on :3008"
else
  fail "nothing healthy on :3008 (Apache proxies gamainet.org here)"
fi

if curl -sf -o /dev/null --max-time 3 http://127.0.0.1:3002/; then
  pass "smateq backend responds on :3002"
else
  fail "nothing healthy on :3002 (Apache proxies smateq.gm here)"
fi

if grep -q 'Requires=mongod.service' /etc/systemd/system/smateq-website.service 2>/dev/null; then
  if crontab -l 2>/dev/null | grep -q 'reboot-start-websites.sh'; then
    warn "smateq has Requires=mongod.service (systemd may skip it); cron @reboot will start apps"
  else
    fail "smateq has Requires=mongod.service and no cron fallback"
  fi
fi

echo "---"
echo "Summary: ${ok} ok, ${warn} warn, ${fail} fail"
if [[ "${fail}" -gt 0 ]]; then
  exit 1
fi
