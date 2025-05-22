INITIALS=aa
PG_APP_NAME=$INITIALS-zstart-pg

PG_PASSWORD="$(head -c 256 /dev/urandom | od -An -t x1 | tr -d ' \n' | tr -dc 'a-zA-Z' | head -c 16)"

fly postgres create \
  --name $PG_APP_NAME \
  --region lax \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-2x \
  --volume-size 40 \
  --password=$PG_PASSWORD