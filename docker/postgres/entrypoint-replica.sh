#!/bin/sh
set -e

MASTER_HOST="${POSTGRES_MASTER_HOST:-postgres-master}"
REPLICATOR_PASSWORD="${REPLICATOR_PASSWORD:-repl_secret}"

# Wait for master to be ready
until PGPASSWORD="$REPLICATOR_PASSWORD" pg_isready -h "$MASTER_HOST" -p 5432 -U replicator 2>/dev/null; do
  echo "Waiting for master at $MASTER_HOST..."
  sleep 2
done

# If not already a standby, do base backup (run as postgres so contents are owned correctly)
if [ ! -f "$PGDATA/standby.signal" ]; then
  echo "Running pg_basebackup from $MASTER_HOST..."
  rm -rf "${PGDATA:?}"/*
  gosu postgres env PGPASSWORD="$REPLICATOR_PASSWORD" pg_basebackup -h "$MASTER_HOST" -p 5432 -U replicator -D "$PGDATA" -P -R -X stream
  echo "Base backup completed."
fi

# PGDATA directory may be root-owned from volume/mount or rm; Postgres requires 0700/0750 and postgres owner
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

# Start postgres server as postgres user (standby mode when standby.signal exists)
exec gosu postgres postgres
