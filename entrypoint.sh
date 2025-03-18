#!/bin/bash
set -e

echo "Listing DAGs directory:"
ls -la /opt/airflow/dags

echo "Testing PostgreSQL connection..."
export PGPASSWORD="airflow"
psql -h orchestronic-postgres -p 5432 -U airflow -d airflow -c "SELECT 1" || {
    echo "Failed to connect to PostgreSQL"
    exit 1
}
unset PGPASSWORD

echo "Initializing Airflow database..."
airflow db init

echo "Creating admin user..."
airflow users create \
    --username "$AIRFLOW_USERNAME" \
    --firstname Admin \
    --lastname User \
    --role Admin \
    --email admin@example.com \
    --password "$AIRFLOW_PASSWORD"

echo "Starting scheduler in background..."
airflow scheduler &

echo "Starting webserver with debug..."
airflow webserver --port 8080 --debug  # Remove exec for now, add --debug