#!/usr/bin/env bash
# Optional script to run on the VPS for deploy. Used by GitHub Actions deploy workflow.
# Ensure IMAGE_FULL and (optionally) VPS_APP_DIR are set before running.
set -e
cd "${VPS_APP_DIR:-/opt/app1m-users}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull api
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d api
docker image prune -f
