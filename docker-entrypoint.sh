#!bin/bash
if [ "${NODE_ENV}" = "development" ]
then
  NPM_SCRIPT="start:watch"
elif [ "${NODE_ENV}" = "test" ]
then
  if [ "${coverage}" = "true" ]
  then
    NPM_SCRIPT="test:coverage"
  else
    NPM_SCRIPT="test"
  fi
else
  NPM_SCRIPT="start"
fi

cd /home/node/app
echo "Waiting for the database to be ready at ${Database__Host}:${Database__Port}..."
./wait-for ${Database__Host}:${Database__Port} -q -t ${DB_TIMEOUT}
if [ $? = 0 ]
then
  echo "Database is ready, starting the server."
  npm run "${NPM_SCRIPT}"
else
  echo "Timeout waiting for database after ${DB_TIMEOUT} seconds."
  echo "Exiting..."
  exit 1
fi
