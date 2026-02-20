#!/bin/sh
set -e
# Enable streaming replication and create replicator user.
# Runs inside master container during first init (postgres is running).

set -e

# Persist replication settings for next start (entrypoint restarts postgres after init)
echo "wal_level = replica" >> "$PGDATA/postgresql.conf"
echo "max_wal_senders = 10" >> "$PGDATA/postgresql.conf"
echo "max_replication_slots = 10" >> "$PGDATA/postgresql.conf"
echo "hot_standby = on" >> "$PGDATA/postgresql.conf"

# Allow replication from any host (replica containers)
echo "host replication replicator 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"

# Create replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER replicator WITH REPLICATION PASSWORD 'repl_secret';
EOSQL
