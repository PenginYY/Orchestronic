#!/bin/bash

# Exit on any error
set -e

# Ensure the script runs as the postgres user (default POSTGRES_USER in Docker)
POSTGRES_USER=${POSTGRES_USER:-postgres}

# Run SQL commands with error handling
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Create the airflow role if it doesn’t exist
    DO \$\$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'airflow') THEN
            CREATE ROLE airflow WITH LOGIN PASSWORD 'airflow';
        END IF;
    END \$\$;

    -- Create the airflow database if it doesn’t exist
    DO \$\$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'airflow') THEN
            CREATE DATABASE airflow OWNER airflow;
        END IF;
    END \$\$;

    -- Grant privileges to the airflow user on the airflow database
    GRANT ALL PRIVILEGES ON DATABASE airflow TO airflow;
EOSQL

echo "Database and user setup completed successfully."