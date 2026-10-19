#!/usr/bin/env bash
# One-time install (run on the server with sudo):
#   sudo bash /home/sc/site-boot/install-boot-services.sh
#
# Fixes native MongoDB permissions, enables systemd units, and removes cron fallback.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

BOOT_DIR="/home/sc/site-boot"
SYSTEMD_SRC="/home/sc/site-boot/systemd"
chown -R sc:sc "${BOOT_DIR}"
chmod +x "${BOOT_DIR}"/*.sh

echo "Fixing MongoDB data directory ownership..."
chown -R mongodb:mongodb /var/lib/mongodb
systemctl enable mongod
systemctl restart mongod
if ! systemctl is-active --quiet mongod; then
  echo "WARNING: native mongod failed; keeping Docker Mongo as backup." >&2
  cp "${SYSTEMD_SRC}/gamainet-mongo-docker.service" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable gamainet-mongo-docker.service
  systemctl start gamainet-mongo-docker.service
else
  echo "Native mongod is running; stopping Docker Mongo if present..."
  docker stop gamainet-mongo 2>/dev/null || true
  docker rm gamainet-mongo 2>/dev/null || true
  rm -f /etc/systemd/system/gamainet-mongo-docker.service
  systemctl disable gamainet-mongo-docker.service 2>/dev/null || true
fi

echo "Installing wait-for-mongo helper..."
install -m 755 "${BOOT_DIR}/wait-for-mongo.sh" /usr/local/bin/gamainet-wait-for-mongo.sh

echo "Installing website systemd units..."
cp "${SYSTEMD_SRC}/gamainet-website.service" /etc/systemd/system/
cp "${SYSTEMD_SRC}/smateq-website.service" /etc/systemd/system/

systemctl daemon-reload
systemctl enable gamainet-website.service smateq-website.service
systemctl restart smateq-website.service gamainet-website.service

echo "Apache auto-recovery (every 5 min, passwordless sudo for ensure-apache only)..."
install -m 755 "${BOOT_DIR}/ensure-apache.sh" /usr/local/bin/gamainet-ensure-apache.sh
cat >/etc/sudoers.d/gamainet-ensure-apache <<'EOF'
sc ALL=(root) NOPASSWD: /usr/bin/systemctl start apache2, /usr/bin/systemctl is-active apache2
EOF
chmod 440 /etc/sudoers.d/gamainet-ensure-apache
(sudo -u sc crontab -l 2>/dev/null | grep -v 'gamainet-ensure-apache'; echo '*/5 * * * * sudo /usr/local/bin/gamainet-ensure-apache.sh') | sudo -u sc crontab -

echo "Removing cron @reboot fallback (if present)..."
sudo -u sc crontab -l 2>/dev/null | grep -v 'site-boot/reboot-start-websites.sh' | sudo -u sc crontab - 2>/dev/null || true

echo "Boot readiness:"
systemctl is-enabled mongod gamainet-website smateq-website 2>/dev/null || true
systemctl is-active mongod gamainet-website smateq-website 2>/dev/null || true
curl -sf -o /dev/null -w 'gamainet 3008: %{http_code}\n' http://127.0.0.1:3008/ || true
curl -sf -o /dev/null -w 'smateq 3002: %{http_code}\n' http://127.0.0.1:3002/ || true
echo "Done."
