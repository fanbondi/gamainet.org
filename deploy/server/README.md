# Production server boot (gamainet.org + smateq.gm)

Host: `172.237.118.244`, SSH port `917`, user `sc`.

Apache terminates TLS and proxies:

| Site | Backend |
|------|---------|
| gamainet.org | `http://127.0.0.1:3008` |
| smateq.gm | `http://127.0.0.1:3002` |

Both Node apps need MongoDB on `127.0.0.1:27017`.

## Check boot readiness (no sudo)

```bash
ssh -p 917 sc@172.237.118.244 '/home/sc/site-boot/verify-boot-readiness.sh'
```

Exit code `0` means a reboot should bring the sites back without manual steps.

## One-time install (sudo on server)

Fixes native `mongod` data ownership, enables `gamainet-website.service`, updates `smateq-website.service` (removes hard `Requires=mongod`), and removes the cron fallback.

```bash
ssh -p 917 sc@172.237.118.244
sudo bash /home/sc/site-boot/install-boot-services.sh
```

## Cron fallback (already on server if install was not run)

`@reboot sleep 30 && /home/sc/site-boot/reboot-start-websites.sh` ensures Docker Mongo (if needed) and both Node apps start even when systemd units are incomplete. Expect up to ~1 minute of 503s right after reboot until this finishes.

Files live under `/home/sc/site-boot/` on the server; copies are in this repo under `site-boot/` and `systemd/`.
