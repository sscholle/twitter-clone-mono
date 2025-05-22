(cat ./docker/seed.sql; echo "\q") | fly pg connect -a $PG_APP_NAME
echo "ALTER SYSTEM SET wal_level = logical; \q" | fly pg connect -a $PG_APP_NAME
fly postgres restart --app $PG_APP_NAME