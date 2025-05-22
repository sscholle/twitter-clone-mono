npx zero-deploy-permissions --schema-path='./src/schema.ts'  --output-file='/tmp/permissions.sql'
(cat /tmp/permissions.sql; echo "\q") | fly pg connect -a $PG_APP_NAME -d zstart