#!/bin/sh

echo "Waiting for MySQL..."

until npm run migrate; do
  echo "MySQL is not ready yet. Retrying in 3 seconds..."
  sleep 3
done

npm run seed
npm start